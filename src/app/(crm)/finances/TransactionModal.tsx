'use client';

import { useState } from 'react';
import { X, Calculator } from 'lucide-react';
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl my-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {transaction?.id ? 'Editar' : 'Nuevo'} {formData.type === 'income' ? 'Ingreso' : 'Gasto'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formData.type === 'income' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Cliente</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue focus:ring-1 focus:ring-sokka-blue bg-white"
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
              <label className="mb-1 block text-xs font-semibold text-gray-700">Categoría / Etiqueta</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue focus:ring-1 focus:ring-sokka-blue bg-white"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Mes del Período</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue bg-white"
                value={formData.periodMonth}
                onChange={(e) => setFormData({ ...formData, periodMonth: parseInt(e.target.value) })}
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Año</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue"
                value={formData.periodYear}
                onChange={(e) => setFormData({ ...formData, periodYear: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              {formData.type === 'income' ? 'Monto Total Acordado ($ ARS)' : 'Monto Total ($ ARS)'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Estado de Pago</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue bg-white"
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
              <label className="mb-1 block text-xs font-semibold text-gray-700">Fecha de Pago</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Partial payment details breakdown */}
          {formData.status === 'partial' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold uppercase text-[11px]">
                <Calculator className="h-3.5 w-3.5" />
                <span>Desglose de Pago Parcial</span>
              </div>
              
              <div>
                <label className="mb-1 block text-[11px] font-medium text-amber-900">
                  Monto efectivamente cobrado ($ ARS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full rounded-lg border border-amber-300 bg-white p-1.5 text-sm outline-none focus:border-sokka-blue"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-200/60">
                <div>
                  <span className="text-gray-500">Cobrado: </span>
                  <span className="font-bold text-green-700">{formatCurrency(parsedPaid)} ({percentPaid}%)</span>
                </div>
                <div>
                  <span className="text-gray-500">Resta: </span>
                  <span className="font-bold text-amber-700">{formatCurrency(remainingBalance)}</span>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'income' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Estado de Facturación</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue bg-white"
                value={formData.billingStatus}
                onChange={(e) => setFormData({ ...formData, billingStatus: e.target.value })}
              >
                <option value="unbilled">No Facturado</option>
                <option value="billed">Facturado</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Observaciones / Aclaraciones
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-sokka-blue"
              rows={2}
              placeholder="Notas, acuerdos de pago, fechas acordadas..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-[#EB7638] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#d15f2a] active:translate-y-0.5 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? 'Guardando...' : (transaction?.id ? 'Guardar Cambios' : 'Confirmar y Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
