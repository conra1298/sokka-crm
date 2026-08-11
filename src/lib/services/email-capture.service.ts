import { db } from '@/db';
import { emailIngestionLog, contacts, activities, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { normalizeEmail } from '@/lib/utils/normalization';

export interface InboundEmailPayload {
  messageId: string;
  from: string;
  to: string[];
  subject?: string;
  textBody?: string;
  htmlBody?: string;
}

export async function processInboundEmail(payload: InboundEmailPayload) {
  const messageId = payload.messageId.trim();

  // Deduplication check by RFC Message-ID
  const existingLog = await db.query.emailIngestionLog.findFirst({
    where: eq(emailIngestionLog.messageId, messageId),
  });

  if (existingLog) {
    return {
      status: 'duplicate',
      log: existingLog,
      message: 'Email with this Message-ID was already processed.',
    };
  }

  const senderEmail = normalizeEmail(payload.from);

  // Match contact by normalized email
  const matchedContacts = await db.query.contacts.findMany({
    where: eq(contacts.normalizedEmail, senderEmail),
    with: {
      owner: true,
    },
  });

  let status: 'matched' | 'unmatched' = 'unmatched';
  let matchedContactId: string | null = null;
  let createdActivityId: string | null = null;

  if (matchedContacts.length === 1) {
    status = 'matched';
    const contact = matchedContacts[0];
    matchedContactId = contact.id;

    // Find default system/admin user or contact owner
    const actorId = contact.ownerId || (await db.query.users.findFirst())?.id;

    if (actorId) {
      const [activity] = await db
        .insert(activities)
        .values({
          type: 'email',
          content: `[Inbound Email] ${payload.subject || 'No Subject'}\n\n${payload.textBody || ''}`,
          metadata: {
            message_id: messageId,
            from: payload.from,
            to: payload.to,
            subject: payload.subject,
          },
          contactId: contact.id,
          companyId: contact.companyId,
          createdBy: actorId,
        })
        .returning();

      createdActivityId = activity.id;
    }
  }

  // Create Email Ingestion Log Entry
  const [ingestionEntry] = await db
    .insert(emailIngestionLog)
    .values({
      messageId,
      fromAddress: payload.from,
      toAddresses: payload.to,
      subject: payload.subject || null,
      bodyPreview: (payload.textBody || '').slice(0, 300),
      matchedContactId,
      activityId: createdActivityId,
      status,
    })
    .returning();

  return {
    status,
    log: ingestionEntry,
    matchedContact: matchedContacts[0] || null,
    ambiguousCount: matchedContacts.length > 1 ? matchedContacts.length : 0,
  };
}
