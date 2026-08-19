'use client';

import { useState } from 'react';
import { X, Calculator, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/normalization';

export default function TransactionModal({ transaction, companies, categories, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'income',
    amount: transaction?.amount !== undefined ? String(transaction.amount) : '',
    paidAmount: transaction?.paidAmount !== undefined && transaction?.paidAmount !== null ? String(transaction.paidAmount) : '',
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

  const parsedTotal = parseFloat(formData.amount) || 0;
  const parsedPaid = parseFloat(formData.paidAmount) || 0;
  const remainingBalance = Math.max(0, parsedTotal - parsedPaid);
  const percentPaid = parsedTotal > 0 ? Math.min(100, Math.round((parsedPaid / parsedTotal) * 100)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      paidAmount: formData.status === 'partial' ? parsedPaid : undefined,
    });
    setLoading(false);
  };

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl my-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction?.id ? 'Editar' : 'Nuevo'} {formData.type === 'income' ? 'Ingreso' : 'Gasto'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.type === 'income' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue focus:ring-1 focus:ring-sokka-blue bg-white"
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Categoría / Etiqueta</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue focus:ring-1 focus:ring-sokka-blue bg-white"
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Mes del Período</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue bg-white"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {formData.type === 'income' ? 'Monto Total Acordado ($ ARS)' : 'Monto Total ($ ARS)'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado de Pago</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pendiente</option>
                <option value="partial">Pago Parcial</option>
                <option value="paid">Pagado Total</option>
                <option value="cancelled">Suspendido</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de Pago / Anticipo</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Partial payment details breakdown */}
          {formData.status === 'partial' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase">
                <Calculator className="h-4 w-4" />
                <span>Desglose de Pago Parcial</span>
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-medium text-amber-900">
                  Monto efectivamente cobrado hasta la fecha ($ ARS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-amber-300 bg-white p-2 text-sm outline-none focus:border-sokka-blue"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-amber-200/60">
                <div>
                  <span className="text-gray-500">Cobrado: </span>
                  <span className="font-bold text-green-700">{formatCurrency(parsedPaid)} ({percentPaid}%)</span>
                </div>
                <div>
                  <span className="text-gray-500">Saldo Pendiente: </span>
                  <span className="font-bold text-amber-700">{formatCurrency(remainingBalance)}</span>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'income' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado de Facturación</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue bg-white"
                value={formData.billingStatus}
                onChange={(e) => setFormData({ ...formData, billingStatus: e.target.value })}
              >
                <option value="unbilled">No Facturado</option>
                <option value="billed">Facturado</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Observaciones / Aclaraciones
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-sokka-blue"
              rows={3}
              placeholder="Ej: Anticipo 50% abonado el día 5. Saldo prometido para el 20. Factura A emitida..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sokka-blue px-5 py-2 text-sm font-medium text-white hover:bg-sokka-blue/90 disabled:opacity-50 transition"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
