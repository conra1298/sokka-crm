import { db } from '@/db';
import { pipelineStages, deals } from '@/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export async function getPipelineStages() {
  return db.query.pipelineStages.findMany({
    orderBy: [asc(pipelineStages.displayOrder)],
  });
}

export async function createPipelineStage(
  name: string,
  displayOrder: number,
  isTerminal = false,
  isWon = false,
  user: SessionUser
) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators can configure pipeline stages.');
  }

  if (isWon && !isTerminal) {
    throw new Error('A stage marked as Won must also be a terminal stage.');
  }

  const [newStage] = await db
    .insert(pipelineStages)
    .values({
      name: name.trim(),
      displayOrder,
      isTerminal,
      isWon,
    })
    .returning();

  return newStage;
}

export async function updatePipelineStageOrder(
  stageOrders: Array<{ id: string; displayOrder: number }>,
  user: SessionUser
) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only administrators can reorder pipeline stages.');
  }

  return db.transaction((tx: any) => {
    for (const item of stageOrders) {
      tx.update(pipelineStages)
        .set({ displayOrder: item.displayOrder })
        .where(eq(pipelineStages.id, item.id))
        .run();
    }
    return tx.query.pipelineStages.findMany({
      orderBy: [asc(pipelineStages.displayOrder)],
    });
  });
}

export async function getPipelineMetrics(user: SessionUser, ownerIdFilter?: string) {
  const stages = await getPipelineStages();

  const dealConditions = [eq(deals.isArchived, false)];
  if (user.role === 'salesperson') {
    dealConditions.push(eq(deals.ownerId, user.id));
  } else if (ownerIdFilter) {
    dealConditions.push(eq(deals.ownerId, ownerIdFilter));
  }

  const whereClause = and(...dealConditions);

  const activeDeals = await db.query.deals.findMany({
    where: whereClause,
    with: {
      stage: true,
      owner: true,
      company: true,
      contact: true,
    },
  });

  // Aggregations per stage
  const stageMetricsMap = new Map<
    string,
    {
      stageId: string;
      stageName: string;
      displayOrder: number;
      isTerminal: boolean;
      isWon: boolean;
      dealCount: number;
      totalValue: number;
    }
  >();

  stages.forEach((s: any) => {
    stageMetricsMap.set(s.id, {
      stageId: s.id,
      stageName: s.name,
      displayOrder: s.displayOrder,
      isTerminal: s.isTerminal,
      isWon: s.isWon,
      dealCount: 0,
      totalValue: 0,
    });
  });

  let totalActivePipelineValue = 0;
  let totalActiveDeals = 0;
  let totalWonDeals = 0;
  let totalWonValue = 0;
  let totalLostDeals = 0;

  activeDeals.forEach((deal: any) => {
    const stageId = deal.stageId;
    const valueNum = deal.value ? parseFloat(deal.value) : 0;
    const stageMetric = stageMetricsMap.get(stageId);

    if (stageMetric) {
      stageMetric.dealCount += 1;
      stageMetric.totalValue += valueNum;
    }

    if (!deal.stage.isTerminal) {
      totalActivePipelineValue += valueNum;
      totalActiveDeals += 1;
    } else if (deal.stage.isWon) {
      totalWonDeals += 1;
      totalWonValue += valueNum;
    } else {
      totalLostDeals += 1;
    }
  });

  const totalClosedDeals = totalWonDeals + totalLostDeals;
  const winRatePercentage = totalClosedDeals > 0 ? (totalWonDeals / totalClosedDeals) * 100 : 0;

  const stageBreakdown = Array.from(stageMetricsMap.values()).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return {
    totalActivePipelineValue,
    totalActiveDeals,
    totalWonDeals,
    totalWonValue,
    totalLostDeals,
    winRatePercentage: Math.round(winRatePercentage * 10) / 10,
    stageBreakdown,
  };
}

export async function getPipelineBoardData(
  user: SessionUser,
  options?: { search?: string; ownerId?: string }
) {
  const stages = await getPipelineStages();
  const conditions = [eq(deals.isArchived, false)];

  if (user.role === 'salesperson') {
    conditions.push(eq(deals.ownerId, user.id));
  } else if (options?.ownerId) {
    conditions.push(eq(deals.ownerId, options.ownerId));
  }

  if (options?.search) {
    const pattern = `%${options.search.trim()}%`;
    conditions.push(eq(deals.title, pattern));
  }

  const dealsList = await db.query.deals.findMany({
    where: and(...conditions),
    with: {
      stage: true,
      company: true,
      contact: true,
      owner: true,
      tasks: true,
    },
    orderBy: (d: any, { desc }: any) => [desc(d.createdAt)],
  });

  return { stages, dealsList };
}

