import { db } from '@/db';
import { tasks, users, deals, contacts, companies } from '@/db/schema';
import { eq, and, or, sql, desc, asc, lt } from 'drizzle-orm';
import { SessionUser } from './auth.service';
import { isOverdue } from '@/lib/utils/normalization';

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export async function listTasks(
  user: SessionUser,
  options?: {
    assignedToId?: string;
    isCompleted?: boolean;
    overdueOnly?: boolean;
    dealId?: string;
    contactId?: string;
    companyId?: string;
  }
) {
  const conditions = [];

  if (user.role === 'salesperson') {
    conditions.push(eq(tasks.assignedTo, user.id));
  } else if (options?.assignedToId) {
    conditions.push(eq(tasks.assignedTo, options.assignedToId));
  }

  if (options?.isCompleted !== undefined) {
    conditions.push(eq(tasks.isCompleted, options.isCompleted));
  }

  if (options?.dealId) conditions.push(eq(tasks.dealId, options.dealId));
  if (options?.contactId) conditions.push(eq(tasks.contactId, options.contactId));
  if (options?.companyId) conditions.push(eq(tasks.companyId, options.companyId));

  const todayStr = new Date().toISOString().split('T')[0];
  if (options?.overdueOnly) {
    conditions.push(eq(tasks.isCompleted, false));
    conditions.push(lt(tasks.dueDate, todayStr));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db.query.tasks.findMany({
    where: whereClause,
    with: {
      assignee: true,
      creator: true,
      deal: true,
      contact: true,
      company: true,
    },
    orderBy: [asc(tasks.isCompleted), asc(tasks.dueDate), desc(tasks.createdAt)],
  });

  return result.map((task: any) => ({
    ...task,
    isOverdue: isOverdue(task.dueDate, task.isCompleted),
  }));
}

export async function getOverdueTasks(user: SessionUser) {
  return listTasks(user, { overdueOnly: true });
}

export async function createTask(input: CreateTaskInput, user: SessionUser) {
  const [newTask] = await db
    .insert(tasks)
    .values({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      dueDate: input.dueDate || null,
      assignedTo: input.assignedTo || user.id,
      createdBy: user.id,
      contactId: input.contactId || null,
      dealId: input.dealId || null,
      companyId: input.companyId || null,
    })
    .returning();

  return newTask;
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean, user: SessionUser) {
  const existing = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
  if (!existing) throw new Error('Task not found');

  if (user.role === 'salesperson' && existing.assignedTo !== user.id) {
    throw new Error('Forbidden: You can only complete tasks assigned to you.');
  }

  const [updated] = await db
    .update(tasks)
    .set({
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return updated;
}

export async function getEligibleAssignees(user: SessionUser) {
  if (user.role === 'admin') {
    return db.query.users.findMany({
      where: eq(users.isActive, true),
      orderBy: (u: any, { asc }: any) => [asc(u.name)],
    });
  }

  if (user.role === 'manager') {
    return db.query.users.findMany({
      where: and(eq(users.isActive, true), or(eq(users.role, 'manager'), eq(users.role, 'salesperson'))),
      orderBy: (u: any, { asc }: any) => [asc(u.name)],
    });
  }

  return db.query.users.findMany({
    where: eq(users.id, user.id),
  });
}
