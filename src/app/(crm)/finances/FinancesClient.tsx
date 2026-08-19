'use client';

import { useState } from 'react';
import { formatArs } from '@/lib/utils/normalization';
import { createTransactionAction, updateTransactionAction, deleteTransactionAction } from './actions';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import TransactionModal from './TransactionModal';

export default function FinancesClient({ initialTransactions, categories, companies }: any) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expense'>('dashboard');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  
  const incomes = transactions.filter((t: any) => t.type === 'income');
  const expenses = transactions.filter((t: any) => t.type === 'expense');

  const totalIncome = incomes.reduce((sum: number, t: any) => sum + (t.status === 'paid' ? t.amount : 0), 0);
  const totalExpense = expenses.reduce((sum: number, t: any) => sum + (t.status === 'paid' ? t.amount : 0), 0);
  const netProfit = totalIncome - totalExpense;

  const handleOpenNew = (type: 'income' | 'expense') => {
    setEditingTransaction({ type, status: 'pending', billingStatus: 'unbilled', periodMonth: new Date().getMonth() + 1, periodYear: new Date().getFullYear() });
    setIsModalOpen(true);
  };

  const handleEdit = (tx: any) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      await deleteTransactionAction(id);
      setTransactions((prev: any) => prev.filter((t: any) => t.id !== id));
    }
  };

  const onSave = async (data: any) => {
    if (editingTransaction?.id) {
      const updated = await updateTransactionAction(editingTransaction.id, data);
      setTransactions((prev: any) => prev.map((t: any) => t.id === updated.id ? { ...t, ...updated } : t));
    } else {
      const created = await createTransactionAction(data);
      setTransactions((prev: any) => [created, ...prev]);
    }
    setIsModalOpen(false);
  };

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'dashboard'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'income'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Ingresos (Cobranza)
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'expense'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Egresos (Gastos)
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ingresos Cobrados</p>
                <p className="text-2xl font-bold text-gray-900">{formatArs(totalIncome)}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-100 p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatArs(totalExpense)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3">
                <Wallet className="h-6 w-6 text-sokka-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatArs(netProfit)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'income' || activeTab === 'expense') && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'income' ? 'Registro de Cobranzas' : 'Registro de Gastos'}
            </h2>
            <button
              onClick={() => handleOpenNew(activeTab)}
              className="inline-flex items-center gap-2 rounded-lg bg-sokka-blue px-4 py-2 text-sm font-medium text-white hover:bg-sokka-blue/90"
            >
              <Plus className="h-4 w-4" />
              Nuevo {activeTab === 'income' ? 'Ingreso' : 'Gasto'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">{activeTab === 'income' ? 'Cliente' : 'Concepto/Categoría'}</th>
                  <th className="px-6 py-3">Período</th>
                  <th className="px-6 py-3">Fecha Pago</th>
                  <th className="px-6 py-3">Monto</th>
                  <th className="px-6 py-3">Estado</th>
                  {activeTab === 'income' && <th className="px-6 py-3">Facturación</th>}
                  <th className="px-6 py-3">Observaciones</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'income' ? incomes : expenses).map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {activeTab === 'income' ? (
                         companies.find((c: any) => c.id === t.companyId)?.name || 'Sin Cliente'
                      ) : (
                         categories.find((c: any) => c.id === t.categoryId)?.name || 'Sin Categoría'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {t.periodMonth ? months[t.periodMonth - 1] : ''} {t.periodYear}
                    </td>
                    <td className="px-6 py-4">{t.date || '-'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatArs(t.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        t.status === 'paid' ? 'bg-green-100 text-green-700' :
                        t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status === 'paid' ? 'Pagado' : t.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </td>
                    {activeTab === 'income' && (
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          t.billingStatus === 'billed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.billingStatus === 'billed' ? 'Facturado' : 'No Facturado'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 truncate max-w-[200px]" title={t.notes || ''}>
                      {t.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-900 mr-3">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'income' ? incomes : expenses).length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No hay registros para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          companies={companies}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
