import { db } from '@/db';
import { deals, pipelineStages, activities, auditLog, contacts, companies, tasks } from '@/db/schema';
import { eq, and, or, ilike, desc, asc } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface CreateDealInput {
  title: string;
  value?: number;
  currency?: string;
  leadSource?: string;
  dealType?: 'project' | 'retainer';
  monthlyValue?: number;
  retainerStartDate?: string;
  retainerRenewalDate?: string;
  briefNotes?: string;
  stageId: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  expectedCloseDate?: string;
}

export interface UpdateDealInput {
  title?: string;
  value?: number;
  currency?: string;
  leadSource?: string;
  dealType?: 'project' | 'retainer';
  monthlyValue?: number;
  retainerStartDate?: string;
  retainerRenewalDate?: string;
  briefNotes?: string;
  stageId?: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  expectedCloseDate?: string;
}

export async function listDeals(
  user: SessionUser,
  options?: {
    search?: string;
    ownerId?: string;
    stageId?: string;
    companyId?: string;
    contactId?: string;
    leadSource?: string;
    dealType?: string;
    showArchived?: boolean;
  }
) {
  const conditions = [];

  if (user.role === 'salesperson') {
    conditions.push(eq(deals.ownerId, user.id));
  } else if (options?.ownerId) {
    conditions.push(eq(deals.ownerId, options.ownerId));
  }

  if (!options?.showArchived) {
    conditions.push(eq(deals.isArchived, false));
  }

  if (options?.stageId) {
    conditions.push(eq(deals.stageId, options.stageId));
  }

  if (options?.companyId) {
    conditions.push(eq(deals.companyId, options.companyId));
  }

  if (options?.contactId) {
    conditions.push(eq(deals.contactId, options.contactId));
  }

  if (options?.leadSource) {
    conditions.push(eq(deals.leadSource, options.leadSource));
  }

  if (options?.dealType) {
    conditions.push(eq(deals.dealType, options.dealType));
  }

  if (options?.search) {
    const pattern = `%${options.search.trim()}%`;
    conditions.push(ilike(deals.title, pattern));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db.query.deals.findMany({
    where: whereClause,
    with: {
      stage: true,
      company: true,
      contact: true,
      owner: true,
      tasks: {
        where: eq(tasks.isCompleted, false),
      },
    },
    orderBy: [desc(deals.createdAt)],
  });
}

export async function getDealById(id: string, user: SessionUser) {
  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, id),
    with: {
      stage: true,
      company: true,
      contact: true,
      owner: true,
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

  if (!deal) return null;

  if (user.role === 'salesperson' && deal.ownerId !== user.id) {
    throw new Error('Forbidden: You do not have permission to view this deal.');
  }

  return deal;
}

export const getDealDetail = getDealById;

export async function createDeal(input: CreateDealInput, user: SessionUser) {
  const stage = await db.query.pipelineStages.findFirst({
    where: eq(pipelineStages.id, input.stageId),
  });

  if (!stage) throw new Error('Invalid pipeline stage ID');

  const companyIdVal = input.companyId && input.companyId.trim() !== '' ? input.companyId : null;
  const contactIdVal = input.contactId && input.contactId.trim() !== '' ? input.contactId : null;

  const [newDeal] = await db
    .insert(deals)
    .values({
      title: input.title.trim(),
      value: input.value !== undefined && input.value !== null ? input.value : null,
      currency: input.currency || 'ARS',
      leadSource: input.leadSource || null,
      dealType: input.dealType || 'project',
      monthlyValue: input.monthlyValue !== undefined && input.monthlyValue !== null ? input.monthlyValue : null,
      retainerStartDate: input.retainerStartDate || null,
      retainerRenewalDate: input.retainerRenewalDate || null,
      briefNotes: input.briefNotes?.trim() || null,
      stageId: input.stageId,
      companyId: companyIdVal,
      contactId: contactIdVal,
      ownerId: input.ownerId || user.id,
      expectedCloseDate: input.expectedCloseDate || null,
      closedAt: stage.isTerminal ? new Date().toISOString() : null,
    })
    .returning();

  // Create initial activity log
  await db.insert(activities).values({
    type: 'stage_change',
    content: `Deal created in stage "${stage.name}" by ${user.name}`,
    metadata: {
      old_stage: null,
      new_stage: stage.name,
      stage_id: stage.id,
    },
    dealId: newDeal.id,
    companyId: companyIdVal,
    contactId: contactIdVal,
    createdBy: user.id,
  });

  return newDeal;
}

/**
 * Transactional Stage Move Service
 * Required Business Rule: Apply stage moves through one transactional service
 * that records old stage, new stage, actor, time and updates metrics only after commit.
 */
export async function moveDealStage(dealId: string, newStageId: string, user: SessionUser) {
  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
    with: {
      stage: true,
    },
  });

  if (!deal) throw new Error('Deal not found');

  // Permission check
  if (user.role === 'salesperson' && deal.ownerId !== user.id) {
    throw new Error('Forbidden: You can only move your own deals.');
  }

  if (deal.stageId === newStageId) {
    return deal; // Idempotent no-op
  }

  const oldStage = deal.stage;
  const newStage = await db.query.pipelineStages.findFirst({
    where: eq(pipelineStages.id, newStageId),
  });

  if (!newStage) throw new Error('Target pipeline stage not found');

  // Reopen Terminal Deal Restriction: Reopening terminal deal requires Manager or Admin role
  if (oldStage.isTerminal && !newStage.isTerminal && user.role === 'salesperson') {
    throw new Error('Forbidden: Only Managers or Administrators can reopen a closed deal.');
  }

  // Execute in a single DB Transaction
  return db.transaction((tx: any) => {
    const isNowTerminal = newStage.isTerminal;
    const closedAtValue = isNowTerminal ? new Date().toISOString() : null;

    // 1. Update Deal Stage
    const updatedDeal = tx
      .update(deals)
      .set({
        stageId: newStageId,
        closedAt: closedAtValue,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(deals.id, dealId))
      .returning()
      .get();

    // Sanitize Foreign Keys for activities insertion
    let validCompanyId: string | null = deal.companyId || null;
    if (validCompanyId) {
      const comp = tx.query.companies.findFirst({ where: eq(companies.id, validCompanyId) });
      if (!comp) validCompanyId = null;
    }

    let validContactId: string | null = deal.contactId || null;
    if (validContactId) {
      const cont = tx.query.contacts.findFirst({ where: eq(contacts.id, validContactId) });
      if (!cont) validContactId = null;
    }

    // 2. Append Stage Change Activity
    tx.insert(activities).values({
      type: 'stage_change',
      content: `Stage changed from "${oldStage.name}" to "${newStage.name}" by ${user.name}`,
      metadata: {
        old_stage_id: oldStage.id,
        old_stage_name: oldStage.name,
        new_stage_id: newStage.id,
        new_stage_name: newStage.name,
        actor_name: user.name,
      },
      dealId,
      companyId: validCompanyId,
      contactId: validContactId,
      createdBy: user.id,
    }).run();

    // 3. Log to Audit Log
    tx.insert(auditLog).values({
      action: 'move_deal_stage',
      entityType: 'deal',
      entityId: dealId,
      actorId: user.id,
      details: {
        deal_title: deal.title,
        old_stage: oldStage.name,
        new_stage: newStage.name,
        deal_value: deal.value,
      },
    }).run();

    return updatedDeal;
  });
}

export async function updateDeal(id: string, input: UpdateDealInput, user: SessionUser) {
  const existing = await db.query.deals.findFirst({ where: eq(deals.id, id) });
  if (!existing) throw new Error('Deal not found');

  if (user.role === 'salesperson' && existing.ownerId !== user.id) {
    throw new Error('Forbidden: You can only edit your own deals.');
  }

  // If stageId is changing, delegate to moveDealStage transactional service!
  if (input.stageId && input.stageId !== existing.stageId) {
    await moveDealStage(id, input.stageId, user);
  }

  const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.value !== undefined) updateData.value = input.value !== null ? input.value : null;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.leadSource !== undefined) updateData.leadSource = input.leadSource || null;
  if (input.dealType !== undefined) updateData.dealType = input.dealType;
  if (input.monthlyValue !== undefined) updateData.monthlyValue = input.monthlyValue !== null ? input.monthlyValue : null;
  if (input.retainerStartDate !== undefined) updateData.retainerStartDate = input.retainerStartDate || null;
  if (input.retainerRenewalDate !== undefined) updateData.retainerRenewalDate = input.retainerRenewalDate || null;
  if (input.briefNotes !== undefined) updateData.briefNotes = input.briefNotes?.trim() || null;
  if (input.companyId !== undefined) updateData.companyId = input.companyId || null;
  if (input.contactId !== undefined) updateData.contactId = input.contactId || null;
  if (input.expectedCloseDate !== undefined) updateData.expectedCloseDate = input.expectedCloseDate || null;
  if (input.ownerId !== undefined && user.role !== 'salesperson') {
    updateData.ownerId = input.ownerId || null;
  }

  const [updated] = await db
    .update(deals)
    .set(updateData)
    .where(eq(deals.id, id))
    .returning();

  return updated;
}

export async function archiveDeal(id: string, user: SessionUser) {
  const existing = await db.query.deals.findFirst({ where: eq(deals.id, id) });
  if (!existing) throw new Error('Deal not found');

  if (user.role === 'salesperson' && existing.ownerId !== user.id) {
    throw new Error('Forbidden: You can only archive your own deals.');
  }

  const [archived] = await db
    .update(deals)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(deals.id, id))
    .returning();

  return archived;
}
