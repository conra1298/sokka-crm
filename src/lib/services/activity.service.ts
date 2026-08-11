import { db } from '@/db';
import { activities } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface CreateActivityInput {
  type: 'note' | 'call' | 'email' | 'stage_change' | 'merge' | 'import';
  content?: string;
  metadata?: Record<string, any>;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export async function createActivity(input: CreateActivityInput, user: SessionUser) {
  const [newActivity] = await db
    .insert(activities)
    .values({
      type: input.type,
      content: input.content?.trim() || null,
      metadata: input.metadata || null,
      contactId: input.contactId || null,
      dealId: input.dealId || null,
      companyId: input.companyId || null,
      createdBy: user.id,
    })
    .returning();

  return newActivity;
}

/**
 * Explicit Activity Correction
 * Required Business Rule: Keep activity history append-only apart from explicit corrections
 * that retain the original value, editor, reason, and correction timestamp.
 */
export async function correctActivity(
  originalActivityId: string,
  newContent: string,
  correctionReason: string,
  user: SessionUser
) {
  const original = await db.query.activities.findFirst({
    where: eq(activities.id, originalActivityId),
  });

  if (!original) throw new Error('Original activity not found');

  // Permission check: Creator or Manager/Admin
  if (user.role === 'salesperson' && original.createdBy !== user.id) {
    throw new Error('Forbidden: You can only correct your own activity entries.');
  }

  // Create correction entry (append-only)
  const [correctionEntry] = await db
    .insert(activities)
    .values({
      type: original.type,
      content: newContent.trim(),
      metadata: {
        ...(typeof original.metadata === 'object' ? original.metadata : {}),
        corrected_from_id: originalActivityId,
        original_content: original.content,
      },
      contactId: original.contactId,
      dealId: original.dealId,
      companyId: original.companyId,
      createdBy: user.id,
      isCorrection: true,
      correctsId: originalActivityId,
      correctionReason: correctionReason.trim(),
    })
    .returning();

  return correctionEntry;
}

export async function listTimelineForEntity(
  entityType: 'contact' | 'deal' | 'company',
  entityId: string
) {
  let condition;
  if (entityType === 'contact') condition = eq(activities.contactId, entityId);
  else if (entityType === 'deal') condition = eq(activities.dealId, entityId);
  else condition = eq(activities.companyId, entityId);

  return db.query.activities.findMany({
    where: condition,
    with: {
      creator: true,
      corrects: {
        with: {
          creator: true,
        },
      },
    },
    orderBy: [desc(activities.createdAt)],
  });
}
