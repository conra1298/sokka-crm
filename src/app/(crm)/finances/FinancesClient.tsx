'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/normalization';
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
  X,
} from 'lucide-react';
import FinancesDashboard from './FinancesDashboard';
import TransactionModal from './TransactionModal';

export default function FinancesClient({ initialTransactions, categories, companies }: any) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expense' | 'categories'>('dashboard');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  
  const incomes = transactions.filter((t: any) => t.type === 'income');
  const expenses = transactions.filter((t: any) => t.type === 'expense');

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

  const [selectedNote, setSelectedNote] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'dashboard'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'income'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'expense'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
              activeTab === 'categories'
                ? 'border-sokka-blue text-sokka-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Categorías (Etiquetas)
          </button>
        </nav>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenNew('income')}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Ingreso
          </button>
          <button
            onClick={() => handleOpenNew('expense')}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Gasto
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <FinancesDashboard
          transactions={transactions}
          categories={categories}
          companies={companies}
        />
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
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4">
                      {t.status === 'paid' && (
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Pagado
                        </span>
                      )}
                      {t.status === 'partial' && (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            Parcial: {formatCurrency(t.paidAmount || 0)}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Resta: {formatCurrency(Math.max(0, (t.amount || 0) - (t.paidAmount || 0)))}
                          </span>
                        </div>
                      )}
                      {t.status === 'pending' && (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                          Pendiente
                        </span>
                      )}
                      {t.status === 'cancelled' && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          Suspendido
                        </span>
                      )}
                    </td>
                    {activeTab === 'income' && (
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          t.billingStatus === 'billed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.billingStatus === 'billed' ? 'Facturado' : 'No Facturado'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 max-w-[220px]">
                      {t.notes ? (
                        <button
                          type="button"
                          onClick={() => setSelectedNote(t)}
                          title="Clic para ver nota completa"
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-sokka-blue hover:bg-blue-50/50 hover:text-sokka-blue transition max-w-full"
                        >
                          <span className="truncate">{t.notes}</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
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

      {activeTab === 'categories' && (
        <div className="rounded-xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Etiquetas de Gastos / Categorías</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((c: any) => (
              <div key={c.id} className="rounded-lg border p-4 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color || '#ccc' }}></div>
                <span className="font-medium text-gray-800">{c.name}</span>
                <span className="text-xs text-gray-500 ml-auto capitalize">{c.type}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t pt-6 max-w-md">
            <h3 className="text-md font-medium text-gray-900 mb-3">Agregar Nueva Etiqueta</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const color = (form.elements.namedItem('color') as HTMLInputElement).value;
              
              // Only call action if we have it, wait, we need to import it.
              // We'll reload the page for now to get the new category, since it's simpler.
              const { createTransactionCategoryAction } = await import('./actions');
              await createTransactionCategoryAction({ name, color, type: 'expense' });
              window.location.reload();
            }} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de la Etiqueta</label>
                <input type="text" name="name" required className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Ej: Herramientas, Sueldos..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
                <input type="color" name="color" defaultValue="#5CB2D4" className="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <button type="submit" className="rounded-lg bg-sokka-blue px-4 py-2 text-sm font-medium text-white hover:bg-sokka-blue/90">
                Guardar Etiqueta
              </button>
            </form>
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

      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Observaciones y Aclaraciones
              </h3>
              <button
                onClick={() => setSelectedNote(null)}
                className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-700">Registro:</span>{' '}
                {selectedNote.type === 'income'
                  ? companies.find((c: any) => c.id === selectedNote.companyId)?.name || 'Cliente'
                  : categories.find((c: any) => c.id === selectedNote.categoryId)?.name || 'Gasto'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Período:</span>{' '}
                {selectedNote.periodMonth ? months[selectedNote.periodMonth - 1] : ''} {selectedNote.periodYear} |{' '}
                <span className="font-medium text-gray-700">Monto:</span> {formatCurrency(selectedNote.amount)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-200/80 text-sm text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {selectedNote.notes}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNote(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
