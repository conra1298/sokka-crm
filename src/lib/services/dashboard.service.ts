import { db } from '@/db';
import { deals, pipelineStages, tasks, activities, users, companies, contacts } from '@/db/schema';
import { eq, and, gte, lte, isNull, sql, desc, asc, inArray, not } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface DashboardMetrics {
  mrrActive: number;
  monthlyRevenueWon: number;
  conversionRate: number;
  totalDealsCount: number;
  wonDealsCount: number;
  overdueTasksCount: number;
  coldDealsCount: number;
  dealsByStage: Array<{
    stageId: string;
    stageName: string;
    count: number;
    totalValue: number;
    displayOrder: number;
    color: string;
  }>;
  leadsBySource: Array<{
    source: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    wonCount: number;
    totalWonValue: number;
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    assigneeName: string;
    dealTitle?: string | null;
    companyName?: string | null;
  }>;
  coldDeals: Array<{
    id: string;
    title: string;
    companyName: string | null;
    ownerName: string;
    stageName: string;
    daysInactive: number;
    status: 'warning' | 'critical';
  }>;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  instagram: { label: '📸 Instagram', color: '#E1306C' },
  linkedin: { label: '💼 LinkedIn', color: '#0A66C2' },
  facebook: { label: '👍 Facebook', color: '#1877F2' },
  referido: { label: '🤝 Referido', color: '#10B981' },
  sitio_web: { label: '🌐 Sitio Web', color: '#5CB2D4' },
  google_ads: { label: '🎯 Google Ads', color: '#F59E0B' },
  evento: { label: '🎪 Eventos', color: '#8B5CF6' },
  directo: { label: '📞 Directo / Sales', color: '#274283' },
  otro: { label: '📌 Otro', color: '#64748B' },
};

const STAGE_COLORS = ['#5CB2D4', '#274283', '#EDA143', '#EB7638', '#10B981', '#EF4444'];

export async function getDashboardMetrics(user: SessionUser): Promise<DashboardMetrics> {
  const userFilter = user.role === 'salesperson' ? eq(deals.ownerId, user.id) : undefined;
  const activeDealsCondition = userFilter
    ? and(eq(deals.isArchived, false), userFilter)
    : eq(deals.isArchived, false);

  // 1. Fetch all active deals with their stage & owner
  const allDeals = await db.query.deals.findMany({
    where: activeDealsCondition,
    with: {
      stage: true,
      owner: true,
      company: true,
    },
  });

  // MRR Active: sum of monthlyValue (or value if monthlyValue null) for retainer deals
  const retainerDeals = allDeals.filter((d: any) => d.dealType === 'retainer');
  const mrrActive = retainerDeals.reduce((sum: number, d: any) => {
    return sum + (Number(d.monthlyValue || d.value || 0));
  }, 0);

  // Start of current month (ISO string prefix YYYY-MM)
  const now = new Date();
  const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Monthly Revenue Won: won deals closed this month
  const wonDealsThisMonth = allDeals.filter(
    (d: any) => d.stage?.isWon && d.closedAt && d.closedAt >= startOfMonthStr
  );
  const monthlyRevenueWon = wonDealsThisMonth.reduce(
    (sum: number, d: any) => sum + Number(d.value || 0),
    0
  );

  // Conversion rate calculation
  const totalDealsCount = allDeals.length;
  const wonDealsCount = allDeals.filter((d: any) => d.stage?.isWon).length;
  const conversionRate = totalDealsCount > 0 ? Math.round((wonDealsCount / totalDealsCount) * 100) : 0;

  // 2. Deals by Stage
  const stages = await db.query.pipelineStages.findMany({
    orderBy: [asc(pipelineStages.displayOrder)],
  });

  const stageMap = new Map<string, { count: number; totalValue: number }>();
  stages.forEach((s: any) => stageMap.set(s.id, { count: 0, totalValue: 0 }));

  allDeals.forEach((d: any) => {
    const current = stageMap.get(d.stageId) || { count: 0, totalValue: 0 };
    stageMap.set(d.stageId, {
      count: current.count + 1,
      totalValue: current.totalValue + Number(d.value || d.monthlyValue || 0),
    });
  });

  const dealsByStage = stages.map((s: any, idx: number) => {
    const data = stageMap.get(s.id) || { count: 0, totalValue: 0 };
    return {
      stageId: s.id,
      stageName: s.name,
      count: data.count,
      totalValue: data.totalValue,
      displayOrder: s.displayOrder,
      color: STAGE_COLORS[idx % STAGE_COLORS.length],
    };
  });

  // 3. Leads by Source
  const sourceCountMap = new Map<string, number>();
  allDeals.forEach((d: any) => {
    const src = d.leadSource || 'otro';
    sourceCountMap.set(src, (sourceCountMap.get(src) || 0) + 1);
  });

  const totalSourceDeals = Array.from(sourceCountMap.values()).reduce((a, b) => a + b, 0);
  const leadsBySource = Array.from(sourceCountMap.entries()).map(([src, count]) => {
    const meta = SOURCE_LABELS[src] || { label: src, color: '#64748B' };
    return {
      source: src,
      label: meta.label,
      count,
      percentage: totalSourceDeals > 0 ? Math.round((count / totalSourceDeals) * 100) : 0,
      color: meta.color,
    };
  }).sort((a, b) => b.count - a.count);

  // 4. Top Sellers (Won deals in current month by owner)
  const sellerMap = new Map<string, { name: string; count: number; total: number }>();
  wonDealsThisMonth.forEach((d: any) => {
    const sellerId = d.ownerId;
    const sellerName = d.owner?.name || 'Desconocido';
    const curr = sellerMap.get(sellerId) || { name: sellerName, count: 0, total: 0 };
    sellerMap.set(sellerId, {
      name: sellerName,
      count: curr.count + 1,
      total: curr.total + Number(d.value || 0),
    });
  });

  const topSellers = Array.from(sellerMap.entries())
    .map(([sellerId, data]) => ({
      sellerId,
      sellerName: data.name,
      wonCount: data.count,
      totalWonValue: data.total,
    }))
    .sort((a, b) => b.totalWonValue - a.totalWonValue);

  // 5. Overdue Tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const taskCondition = user.role === 'salesperson'
    ? and(eq(tasks.isCompleted, false), eq(tasks.assignedTo, user.id), lte(tasks.dueDate, todayStr))
    : and(eq(tasks.isCompleted, false), lte(tasks.dueDate, todayStr));

  const overdueTaskList = await db.query.tasks.findMany({
    where: taskCondition,
    with: {
      assignee: true,
      deal: true,
      company: true,
    },
    orderBy: [asc(tasks.dueDate)],
    limit: 10,
  });

  const overdueTasks = overdueTaskList.map((t: any) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    assigneeName: t.assignee?.name || 'Sin asignar',
    dealTitle: t.deal?.title,
    companyName: t.company?.name,
  }));

  // 6. Cold Deals (deals with no activities in > 7 days or > 14 days)
  const openDeals = allDeals.filter((d: any) => !d.stage?.isTerminal);
  const coldDeals: DashboardMetrics['coldDeals'] = [];

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  for (const deal of openDeals) {
    // Find latest activity for this deal
    const latestActivity = await db.query.activities.findFirst({
      where: eq(activities.dealId, deal.id),
      orderBy: [desc(activities.createdAt)],
    });

    const lastTimeStr = latestActivity?.createdAt || deal.createdAt;
    if (lastTimeStr < sevenDaysAgo) {
      const daysDiff = Math.floor((now.getTime() - new Date(lastTimeStr).getTime()) / (1000 * 3600 * 24));
      coldDeals.push({
        id: deal.id,
        title: deal.title,
        companyName: deal.company?.name || null,
        ownerName: deal.owner?.name || 'Sin asignar',
        stageName: deal.stage?.name || 'Sin etapa',
        daysInactive: daysDiff,
        status: lastTimeStr < fourteenDaysAgo ? 'critical' : 'warning',
      });
    }
  }

  coldDeals.sort((a, b) => b.daysInactive - a.daysInactive);

  return {
    mrrActive,
    monthlyRevenueWon,
    conversionRate,
    totalDealsCount,
    wonDealsCount,
    overdueTasksCount: overdueTasks.length,
    coldDealsCount: coldDeals.length,
    dealsByStage,
    leadsBySource,
    topSellers,
    overdueTasks,
    coldDeals: coldDeals.slice(0, 10),
  };
}
