'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import * as financeService from '@/lib/services/finance.service';

export async function getTransactionsAction(type?: 'income' | 'expense', month?: number, year?: number) {
  const user = await requireAuth();
  return financeService.listTransactions(user, { type, month, year });
}

export async function createTransactionAction(input: financeService.CreateTransactionInput) {
  const user = await requireAuth();
  const res = await financeService.createTransaction(input, user);
  revalidatePath('/finances');
  return res;
}

export async function updateTransactionAction(id: string, input: financeService.UpdateTransactionInput) {
  const user = await requireAuth();
  const res = await financeService.updateTransaction(id, input, user);
  revalidatePath('/finances');
  return res;
}

export async function deleteTransactionAction(id: string) {
  const user = await requireAuth();
  const res = await financeService.deleteTransaction(id, user);
  revalidatePath('/finances');
  return res;
}

export async function getTransactionCategoriesAction() {
  const user = await requireAuth();
  return financeService.listTransactionCategories(user);
}

export async function createTransactionCategoryAction(input: financeService.CreateTransactionCategoryInput) {
  const user = await requireAuth();
  const res = await financeService.createTransactionCategory(input, user);
  revalidatePath('/finances');
  return res;
}
