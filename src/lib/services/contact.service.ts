import { db } from '@/db';
import { contacts, companies, users, deals, activities, tasks, auditLog } from '@/db/schema';
import { eq, and, or, ilike, sql, desc, inArray } from 'drizzle-orm';
import { normalizeEmail } from '@/lib/utils/normalization';
import { SessionUser } from './auth.service';

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  leadSource?: string;
  companyId?: string;
  ownerId?: string;
}

export interface UpdateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  leadSource?: string;
  companyId?: string;
  ownerId?: string;
}

export async function listContacts(
  user: SessionUser,
  options?: {
    search?: string;
    ownerId?: string;
    companyId?: string;
    leadSource?: string;
    showArchived?: boolean;
    hasDuplicatesOnly?: boolean;
  }
) {
  const conditions = [];

  // Scoping: Salesperson can only see own contacts unless manager/admin
  if (user.role === 'salesperson') {
    conditions.push(eq(contacts.ownerId, user.id));
  } else if (options?.ownerId) {
    conditions.push(eq(contacts.ownerId, options.ownerId));
  }

  if (!options?.showArchived) {
    conditions.push(eq(contacts.isArchived, false));
  }

  if (options?.companyId) {
    conditions.push(eq(contacts.companyId, options.companyId));
  }

  if (options?.leadSource) {
    conditions.push(eq(contacts.leadSource, options.leadSource));
  }

  if (options?.search) {
    const searchPattern = `%${options.search.trim()}%`;
    conditions.push(
      or(
        ilike(contacts.firstName, searchPattern),
        ilike(contacts.lastName, searchPattern),
        ilike(contacts.email, searchPattern),
        ilike(contacts.jobTitle, searchPattern)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db.query.contacts.findMany({
    where: whereClause,
    with: {
      company: true,
      owner: true,
      deals: true,
      activities: true,
      contactTags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: [desc(contacts.createdAt)],
  });

  // Calculate duplicate indicators by checking normalized emails
  const allNormalizedEmails = result.map((c: any) => c.normalizedEmail);
  const emailCounts = new Map<string, number>();

  if (allNormalizedEmails.length > 0) {
    const counts = await db
      .select({
        normalizedEmail: contacts.normalizedEmail,
        count: sql<number>`count(*)`,
      })
      .from(contacts)
      .where(and(eq(contacts.isArchived, false), inArray(contacts.normalizedEmail, allNormalizedEmails)))
      .groupBy(contacts.normalizedEmail);

    counts.forEach((row: any) => emailCounts.set(row.normalizedEmail, Number(row.count)));
  }

  const contactsWithMeta = result.map((contact: any) => ({
    ...contact,
    duplicateCount: (emailCounts.get(contact.normalizedEmail) || 1) - 1,
    hasDuplicates: (emailCounts.get(contact.normalizedEmail) || 1) > 1,
  }));

  if (options?.hasDuplicatesOnly) {
    return contactsWithMeta.filter((c: any) => c.hasDuplicates);
  }

  return contactsWithMeta;
}

export async function getContactById(id: string, user: SessionUser) {
  const contact = await db.query.contacts.findFirst({
    where: eq(contacts.id, id),
    with: {
      company: true,
      owner: true,
      deals: {
        with: {
          stage: true,
          owner: true,
        },
      },
      activities: {
        with: {
          creator: true,
        },
        orderBy: [desc(activities.createdAt)],
      },
      tasks: {
        with: {
          assignee: true,
        },
        orderBy: [desc(tasks.createdAt)],
      },
    },
  });

  if (!contact) return null;

  // Authorization check
  if (user.role === 'salesperson' && contact.ownerId !== user.id) {
    throw new Error('Forbidden: You do not have permission to view this contact.');
  }

  // Find duplicates if any
  const duplicates = await db.query.contacts.findMany({
    where: and(
      eq(contacts.normalizedEmail, contact.normalizedEmail),
      sql`${contacts.id} != ${contact.id}`,
      eq(contacts.isArchived, false)
    ),
    with: {
      company: true,
      owner: true,
    },
  });

  return {
    ...contact,
    duplicates,
  };
}

export const getContactDetail = getContactById;

export async function findDuplicateContacts(email: string) {
  const norm = normalizeEmail(email);
  if (!norm) return [];

  return db.query.contacts.findMany({
    where: and(eq(contacts.normalizedEmail, norm), eq(contacts.isArchived, false)),
    with: {
      company: true,
      owner: true,
    },
  });
}

export async function createContact(input: CreateContactInput, user: SessionUser) {
  const rawEmail = input.email.trim();
  const normalized = normalizeEmail(rawEmail);

  // Check duplicate matches
  const existingDuplicates = await findDuplicateContacts(rawEmail);

  const [newContact] = await db
    .insert(contacts)
    .values({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: rawEmail,
      normalizedEmail: normalized,
      phone: input.phone?.trim() || null,
      jobTitle: input.jobTitle?.trim() || null,
      leadSource: input.leadSource || null,
      companyId: input.companyId || null,
      ownerId: input.ownerId || user.id,
    })
    .returning();

  // Create initial activity log
  await db.insert(activities).values({
    type: 'note',
    content: `Contact created by ${user.name}`,
    contactId: newContact.id,
    createdBy: user.id,
  });

  return {
    contact: newContact,
    duplicatesFound: existingDuplicates.length > 0,
    duplicateMatches: existingDuplicates,
  };
}

export async function updateContact(id: string, input: UpdateContactInput, user: SessionUser) {
  const existing = await db.query.contacts.findFirst({
    where: eq(contacts.id, id),
  });

  if (!existing) throw new Error('Contact not found');

  if (user.role === 'salesperson' && existing.ownerId !== user.id) {
    throw new Error('Forbidden: You can only edit your own contacts.');
  }

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (input.firstName !== undefined) updateData.firstName = input.firstName.trim();
  if (input.lastName !== undefined) updateData.lastName = input.lastName.trim();
  if (input.email !== undefined) {
    updateData.email = input.email.trim();
    updateData.normalizedEmail = normalizeEmail(input.email);
  }
  if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null;
  if (input.jobTitle !== undefined) updateData.jobTitle = input.jobTitle?.trim() || null;
  if (input.leadSource !== undefined) updateData.leadSource = input.leadSource || null;
  if (input.companyId !== undefined) updateData.companyId = input.companyId || null;
  if (input.ownerId !== undefined && user.role !== 'salesperson') {
    updateData.ownerId = input.ownerId || null;
  }

  const [updated] = await db
    .update(contacts)
    .set(updateData)
    .where(eq(contacts.id, id))
    .returning();

  return updated;
}

export async function archiveContact(id: string, user: SessionUser) {
  const existing = await db.query.contacts.findFirst({
    where: eq(contacts.id, id),
  });

  if (!existing) throw new Error('Contact not found');

  if (user.role === 'salesperson' && existing.ownerId !== user.id) {
    throw new Error('Forbidden: You can only archive your own contacts.');
  }

  const [archived] = await db
    .update(contacts)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();

  return archived;
}

export async function mergeContacts(
  sourceId: string,
  targetId: string,
  fieldSelections: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    companyId?: string;
    ownerId?: string;
  },
  user: SessionUser
) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators can merge contacts.');
  }

  if (sourceId === targetId) {
    throw new Error('Cannot merge a contact into itself.');
  }

  const source = await db.query.contacts.findFirst({ where: eq(contacts.id, sourceId) });
  const target = await db.query.contacts.findFirst({ where: eq(contacts.id, targetId) });

  if (!source || !target) {
    throw new Error('Source or target contact not found.');
  }

  // Execute Merge in a single Database Transaction
  return db.transaction((tx: any) => {
    // 1. Re-point deals to target
    tx.update(deals).set({ contactId: targetId }).where(eq(deals.contactId, sourceId)).run();

    // 2. Re-point activities to target
    tx.update(activities)
      .set({ contactId: targetId })
      .where(eq(activities.contactId, sourceId))
      .run();

    // 3. Re-point tasks to target
    tx.update(tasks).set({ contactId: targetId }).where(eq(tasks.contactId, sourceId)).run();

    // 4. Update target contact with selected fields
    const getMergedValue = (key: string) => {
      const choice = (fieldSelections as any)[key];
      if (choice === 'source') return (source as any)[key];
      if (choice === 'target') return (target as any)[key];
      return choice !== undefined ? choice : (target as any)[key];
    };

    const newEmail = getMergedValue('email') || target.email;

    const updatedTargetFields: Record<string, any> = {
      firstName: getMergedValue('firstName') || target.firstName,
      lastName: getMergedValue('lastName') || target.lastName,
      email: newEmail,
      normalizedEmail: normalizeEmail(newEmail),
      phone: getMergedValue('phone') ?? target.phone,
      jobTitle: getMergedValue('jobTitle') ?? target.jobTitle,
      companyId: getMergedValue('companyId') ?? target.companyId,
      ownerId: getMergedValue('ownerId') ?? target.ownerId,
      updatedAt: new Date().toISOString(),
    };

    const updatedTarget = tx
      .update(contacts)
      .set(updatedTargetFields)
      .where(eq(contacts.id, targetId))
      .returning()
      .get();

    // 5. Mark source contact as merged & archived
    tx.update(contacts)
      .set({
        isArchived: true,
        mergedIntoId: targetId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contacts.id, sourceId))
      .run();

    // 6. Record activity on target contact
    tx.insert(activities).values({
      type: 'merge',
      content: `Merged contact "${source.firstName} ${source.lastName}" (${source.email}) into this contact by ${user.name}`,
      metadata: {
        source_contact_id: sourceId,
        source_email: source.email,
        field_selections: fieldSelections,
      },
      contactId: targetId,
      createdBy: user.id,
    }).run();

    // 7. Audit log entry
    tx.insert(auditLog).values({
      action: 'merge_contact',
      entityType: 'contact',
      entityId: targetId,
      actorId: user.id,
      details: {
        source_contact_id: sourceId,
        target_contact_id: targetId,
        source_email: source.email,
        target_email: target.email,
      },
    }).run();

    return updatedTarget;
  });
}
