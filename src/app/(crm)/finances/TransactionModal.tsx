'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function TransactionModal({ transaction, companies, categories, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'income',
    amount: transaction?.amount || '',
    date: transaction?.date || '',
    periodMonth: transaction?.periodMonth || new Date().getMonth() + 1,
    periodYear: transaction?.periodYear || new Date().getFullYear(),
    status: transaction?.status || 'pending',
    billingStatus: transaction?.billingStatus || 'unbilled',
    notes: transaction?.notes || '',
    companyId: transaction?.companyId || '',
    categoryId: transaction?.categoryId || '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setLoading(false);
  };

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction?.id ? 'Editar' : 'Nuevo'} {formData.type === 'income' ? 'Ingreso' : 'Gasto'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.type === 'income' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue focus:ring-1 focus:ring-sokka-blue"
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                required
              >
                <option value="">Seleccione un cliente</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {formData.type === 'expense' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue focus:ring-1 focus:ring-sokka-blue"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Sin categoría</option>
                {categories.filter((c: any) => c.type === 'expense').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mes</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
                value={formData.periodMonth}
                onChange={(e) => setFormData({ ...formData, periodMonth: parseInt(e.target.value) })}
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Año</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
                value={formData.periodYear}
                onChange={(e) => setFormData({ ...formData, periodYear: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Monto ($ ARS)</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado de Pago</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="cancelled">Suspendido</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de Pago</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {formData.type === 'income' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado de Facturación</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
                value={formData.billingStatus}
                onChange={(e) => setFormData({ ...formData, billingStatus: e.target.value })}
              >
                <option value="unbilled">No Facturado</option>
                <option value="billed">Facturado</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sokka-blue px-4 py-2 text-sm font-medium text-white hover:bg-sokka-blue/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
