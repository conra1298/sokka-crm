import { requireAuth } from '@/lib/services/auth.service';
import { redirect } from 'next/navigation';
import { listTransactions, listTransactionCategories } from '@/lib/services/finance.service';
import FinancesClient from './FinancesClient';
import { getCompanies } from '@/lib/services/company.service';

export const metadata = {
  title: 'Finanzas | Sokka CRM',
};

export default async function FinancesPage() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const transactions = await listTransactions(user);
  const categories = await listTransactionCategories(user);
  const companies = await getCompanies(user);

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6">
        <h1 className="text-lg font-semibold text-gray-900">Finanzas</h1>
      </header>

      <main className="flex-1 overflow-auto bg-gray-50/50 p-6">
        <div className="mx-auto max-w-7xl">
          <FinancesClient 
            initialTransactions={transactions}
            categories={categories}
            companies={companies}
          />
        </div>
      </main>
    </div>
  );
}
