import { db } from '@/db';
import { transactionCategories, transactions, companies, deals } from '@/db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { SessionUser } from './auth.service';

export interface CreateTransactionCategoryInput {
  name: string;
  type: 'income' | 'expense';
  color?: string;
}

export interface CreateTransactionInput {
  type: 'income' | 'expense';
  amount: number;
  date?: string;
  periodMonth?: number;
  periodYear?: number;
  status?: 'pending' | 'paid' | 'cancelled';
  billingStatus?: 'unbilled' | 'billed';
  notes?: string;
  companyId?: string;
  dealId?: string;
  categoryId?: string;
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense';
  amount?: number;
  date?: string;
  periodMonth?: number;
  periodYear?: number;
  status?: 'pending' | 'paid' | 'cancelled';
  billingStatus?: 'unbilled' | 'billed';
  notes?: string;
  companyId?: string;
  dealId?: string;
  categoryId?: string;
}

export async function listTransactionCategories(user: SessionUser) {
  if (user.role !== 'admin') throw new Error('Forbidden: Only admins can view finances');
  
  return db.query.transactionCategories.findMany({
    orderBy: [desc(transactionCategories.createdAt)],
  });
}

export async function createTransactionCategory(input: CreateTransactionCategoryInput, user: SessionUser) {
  if (user.role !== 'admin') throw new Error('Forbidden: Only admins can manage finances');
  
  const [newCategory] = await db
    .insert(transactionCategories)
    .values({
      name: input.name,
      type: input.type,
      color: input.color || '#5CB2D4',
    })
    .returning();
    
  return newCategory;
}

export async function listTransactions(user: SessionUser, options?: { type?: 'income' | 'expense', month?: number, year?: number }) {
  if (user.role !== 'admin') throw new Error('Forbidden: Only admins can view finances');
  
  const conditions = [];
  
  if (options?.type) {
    conditions.push(eq(transactions.type, options.type));
  }
  
  if (options?.month !== undefined) {
    conditions.push(eq(transactions.periodMonth, options.month));
  }
  
  if (options?.year !== undefined) {
    conditions.push(eq(transactions.periodYear, options.year));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.transactions.findMany({
    where: whereClause,
    with: {
      company: true,
      deal: true,
      category: true,
    },
    orderBy: [desc(transactions.periodYear), desc(transactions.periodMonth), desc(transactions.createdAt)],
  });
}

export async function createTransaction(input: CreateTransactionInput, user: SessionUser) {
  if (user.role !== 'admin') throw new Error('Forbidden: Only admins can manage finances');
  
  const [newTransaction] = await db
    .insert(transactions)
    .values({
      type: input.type,
      amount: input.amount,
      date: input.date || null,
      periodMonth: input.periodMonth || null,
      periodYear: input.periodYear || null,
      status: input.status || 'pending',
      billingStatus: input.billingStatus || 'unbilled',
      notes: input.notes || null,
      companyId: input.companyId || null,
      dealId: input.dealId || null,
      categoryId: input.categoryId || null,
    })
    .returning();
    
  return newTransaction;
}

export async function updateTransaction(id: string, input: UpdateTransactionInput, user: SessionUser) {
  if (user.role !== 'admin') throw new Error('Forbidden: Only admins can manage finances');
  
  const existing = await db.query.transactions.findFirst({ where: eq(transactions.id, id) });
  if (!existing) throw new Error('Transaction not found');
  
  const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };
  
  if (input.type !== undefined) updateData.type = input.type;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.date !== undefined) updateData.date = input.date || null;
  if (input.periodMonth !== undefined) updateData.periodMonth = input.periodMonth || null;
  if (input.periodYear !== undefined) updateData.periodYear = input.periodYear || null;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.billingStatus !== undefined) updateData.billingStatus = input.billingStatus;
  if (input.notes !== undefined) updateData.notes = input.notes || null;
  if (input.companyId !== undefined) updateData.companyId = input.companyId || null;
  if (input.dealId !== undefined) updateData.dealId = input.dealId || null;
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId || null;
  
  const [updated] = await db
    .update(transactions)
    .set(updateData)
    .where(eq(transactions.id, id))
    .returning();
    
  return updated;
}

export async function deleteTransaction(id: string, user: SessionUser) {
  if (user.role !== 'admin') throw new Error('Forbidden: Only admins can manage finances');
  
  const [deleted] = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning();
    
  return deleted;
}
