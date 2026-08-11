import { parse } from 'csv-parse/sync';
import { db } from '@/db';
import { importJobs, contacts, companies, activities, auditLog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { normalizeEmail, normalizeDomain } from '@/lib/utils/normalization';
import { SessionUser } from './auth.service';
import { findDuplicateContacts } from './contact.service';

export interface ColumnMapping {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyName?: string;
}

export async function createImportJob(
  fileName: string,
  fileKey: string,
  entityType: 'contact' | 'company',
  user: SessionUser,
  idempotencyKey?: string
) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators can import CSV data.');
  }

  // Idempotency check
  if (idempotencyKey) {
    const existing = await db.query.importJobs.findFirst({
      where: eq(importJobs.idempotencyKey, idempotencyKey),
    });
    if (existing) return existing;
  }

  const [job] = await db
    .insert(importJobs)
    .values({
      fileName,
      fileKey,
      entityType,
      status: 'pending',
      createdBy: user.id,
      idempotencyKey: idempotencyKey || null,
    })
    .returning();

  return job;
}

export async function processCSVContent(
  csvContent: string,
  columnMapping: ColumnMapping,
  user: SessionUser
) {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const validRows: Array<{
    rowNumber: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    companyName?: string;
  }> = [];

  const errorRows: Array<{ rowNumber: number; data: any; reason: string }> = [];
  const duplicateRows: Array<{ rowNumber: number; data: any; matchedEmail: string; matchedId?: string }> = [];

  let rowNumber = 1; // 1-indexed header + data rows

  for (const rawRow of records) {
    rowNumber += 1;

    const firstName = rawRow[columnMapping.firstName || 'First Name'] || rawRow['firstName'] || rawRow['First Name'] || '';
    const lastName = rawRow[columnMapping.lastName || 'Last Name'] || rawRow['lastName'] || rawRow['Last Name'] || '';
    const email = rawRow[columnMapping.email || 'Email'] || rawRow['email'] || rawRow['Email'] || '';
    const phone = rawRow[columnMapping.phone || 'Phone'] || rawRow['phone'] || rawRow['Phone'] || '';
    const jobTitle = rawRow[columnMapping.jobTitle || 'Job Title'] || rawRow['jobTitle'] || rawRow['Job Title'] || '';
    const companyName = rawRow[columnMapping.companyName || 'Company'] || rawRow['companyName'] || rawRow['Company'] || '';

    // Validation
    if (!firstName || !lastName) {
      errorRows.push({
        rowNumber,
        data: rawRow,
        reason: 'Missing required First Name or Last Name',
      });
      continue;
    }

    if (!email || !email.includes('@')) {
      errorRows.push({
        rowNumber,
        data: rawRow,
        reason: 'Missing or invalid email address',
      });
      continue;
    }

    // Duplicate Check
    const normalized = normalizeEmail(email);
    const existingDuplicates = await findDuplicateContacts(email);

    if (existingDuplicates.length > 0) {
      duplicateRows.push({
        rowNumber,
        data: rawRow,
        matchedEmail: existingDuplicates[0].email,
        matchedId: existingDuplicates[0].id,
      });
      continue;
    }

    validRows.push({
      rowNumber,
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      jobTitle: jobTitle || undefined,
      companyName: companyName || undefined,
    });
  }

  return {
    totalRows: records.length,
    validRows,
    errorRows,
    duplicateRows,
  };
}

export async function confirmImportInsert(
  jobId: string,
  validRecords: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    companyName?: string;
  }>,
  user: SessionUser
) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators can confirm CSV imports.');
  }

  const job = await db.query.importJobs.findFirst({ where: eq(importJobs.id, jobId) });
  if (!job) throw new Error('Import job not found');

  return await db.transaction(async (tx: any) => {
    let insertedCount = 0;

    for (const rec of validRecords) {
      let companyId: string | null = null;

      if (rec.companyName) {
        const normDom = normalizeDomain(rec.companyName);
        let existingComp = await tx.query.companies.findFirst({
          where: eq(companies.name, rec.companyName.trim()),
        });

        if (!existingComp) {
          const [newComp] = await tx
            .insert(companies)
            .values({
              name: rec.companyName.trim(),
              domain: normDom || null,
              ownerId: user.id,
            })
            .returning();
          existingComp = newComp;
        }
        companyId = existingComp.id;
      }

      const [insertedContact] = await tx
        .insert(contacts)
        .values({
          firstName: rec.firstName.trim(),
          lastName: rec.lastName.trim(),
          email: rec.email.trim(),
          normalizedEmail: normalizeEmail(rec.email),
          phone: rec.phone?.trim() || null,
          jobTitle: rec.jobTitle?.trim() || null,
          companyId,
          ownerId: user.id,
        })
        .returning();

      await tx.insert(activities).values({
        type: 'import',
        content: `Contact imported via CSV (Job #${job.id.slice(0, 8)}) by ${user.name}`,
        contactId: insertedContact.id,
        companyId,
        createdBy: user.id,
      });

      insertedCount += 1;
    }

    // Update job status
    const [updatedJob] = await tx
      .update(importJobs)
      .set({
        status: 'completed',
        validRows: insertedCount,
        completedAt: new Date(),
      })
      .where(eq(importJobs.id, jobId))
      .returning();

    // Audit log
    await tx.insert(auditLog).values({
      action: 'confirm_csv_import',
      entityType: 'import_job',
      entityId: jobId,
      actorId: user.id,
      details: {
        file_name: job.fileName,
        inserted_count: insertedCount,
      },
    });

    return updatedJob;
  });
}
