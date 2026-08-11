import { stringify } from 'csv-stringify/sync';
import { db } from '@/db';
import { deals, contacts, auditLog } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export async function exportDealsCSV(user: SessionUser) {
  // Required Security Rule: Permit full CRM exports only to admins
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators are authorized to export CRM data.');
  }

  const allDeals = await db.query.deals.findMany({
    with: {
      stage: true,
      company: true,
      contact: true,
      owner: true,
    },
    orderBy: [desc(deals.createdAt)],
  });

  const records = allDeals.map((d: any) => ({
    'Deal ID': d.id,
    'Title': d.title,
    'Value': d.value || '0.00',
    'Currency': d.currency,
    'Stage': d.stage.name,
    'Company': d.company?.name || '',
    'Contact': d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : '',
    'Contact Email': d.contact?.email || '',
    'Owner': d.owner.name,
    'Expected Close Date': d.expectedCloseDate || '',
    'Closed At': d.closedAt ? d.closedAt.toISOString() : '',
    'Is Archived': d.isArchived ? 'Yes' : 'No',
    'Created At': d.createdAt.toISOString(),
  }));

  const csvOutput = stringify(records, { header: true });

  // Audit Log Entry
  await db.insert(auditLog).values({
    action: 'export_deals_csv',
    entityType: 'deal',
    actorId: user.id,
    details: {
      exported_count: records.length,
    },
  });

  return csvOutput;
}

export async function exportContactsCSV(user: SessionUser) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators are authorized to export CRM data.');
  }

  const allContacts = await db.query.contacts.findMany({
    where: eq(contacts.isArchived, false),
    with: {
      company: true,
      owner: true,
    },
    orderBy: [desc(contacts.createdAt)],
  });

  const records = allContacts.map((c: any) => ({
    'Contact ID': c.id,
    'First Name': c.firstName,
    'Last Name': c.lastName,
    'Email': c.email,
    'Phone': c.phone || '',
    'Job Title': c.jobTitle || '',
    'Company': c.company?.name || '',
    'Owner': c.owner?.name || '',
    'Created At': c.createdAt.toISOString(),
  }));

  const csvOutput = stringify(records, { header: true });

  await db.insert(auditLog).values({
    action: 'export_contacts_csv',
    entityType: 'contact',
    actorId: user.id,
    details: {
      exported_count: records.length,
    },
  });

  return csvOutput;
}
