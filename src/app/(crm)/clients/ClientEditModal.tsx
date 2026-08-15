'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, RefreshCcw, Save, Trash2, Building2 } from 'lucide-react';
import { updateDealAction } from '@/app/(crm)/deals/actions';
import { cancelRetainerAction } from './actions';

interface ClientEditModalProps {
  deal: {
    id: string;
    title: string;
    value?: number | null;
    monthlyValue?: number | null;
    retainerRenewalDate?: string | null;
    retainerStartDate?: string | null;
    briefNotes?: string | null;
    companyId?: string | null;
    contactId?: string | null;
    ownerId?: string | null;
  };
  companies: Array<{ id: string; name: string }>;
  contacts: Array<{ id: string; firstName: string; lastName: string; companyId?: string | null }>;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
}

export default function ClientEditModal({
  deal,
  companies,
  contacts,
  users,
  onClose,
}: ClientEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(deal.companyId || '');

  // Extract current renewal day if format is "Día X de cada mes" or "Día X"
  const extractRenewalDay = (val?: string | null) => {
    if (!val) return '10';
    const match = val.match(/\d+/);
    return match ? match[0] : '10';
  };

  const [renewalDay, setRenewalDay] = useState(extractRenewalDay(deal.retainerRenewalDate));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('id', deal.id);
    formData.append('retainerRenewalDate', `Día ${renewalDay} de cada mes`);

    const result = await updateDealAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onClose();
    router.refresh();
  };

  const handleCancelService = async () => {
    if (!confirm('¿Estás seguro de dar de baja o pausar este servicio mensual?')) return;
    setIsCanceling(true);
    const res = await cancelRetainerAction(deal.id);
    if (res?.error) {
      setError(res.error);
      setIsCanceling(false);
      return;
    }
    onClose();
    router.refresh();
  };

  const filteredContacts = selectedCompanyId
    ? contacts.filter((c) => !c.companyId || c.companyId === selectedCompanyId)
    : contacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#274283]/10 text-[#274283]">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">Editar Cliente / Servicio</h2>
              <p className="text-xs text-slate-500">Modificar empresa, fee mensual o responsable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Empresa Vinculada */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Empresa / Marca del Cliente
            </label>
            <select
              name="companyId"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-semibold text-slate-800"
            >
              <option value="">Sin Empresa (Cliente Particular / Desvinculado)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Nombre del Servicio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre del Servicio / Plan Mensual *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={deal.title}
              placeholder="ej. Paid Media & Meta Ads"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-medium"
            />
          </div>

          {/* 3. Fee Mensual y Día de Cobro */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fee Mensual ($ ARS) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="monthlyValue"
                  required
                  defaultValue={deal.monthlyValue || deal.value || 0}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Día de Cobro / Factura
              </label>
              <select
                value={renewalDay}
                onChange={(e) => setRenewalDay(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Día {i + 1} de cada mes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Contacto y Account Manager */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contacto Principal
              </label>
              <select
                name="contactId"
                defaultValue={deal.contactId || ''}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                <option value="">Sin Contacto</option>
                {filteredContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Manager
              </label>
              <select
                name="ownerId"
                defaultValue={deal.ownerId || ''}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Fecha de Inicio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              name="retainerStartDate"
              defaultValue={deal.retainerStartDate || ''}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white text-slate-700"
            />
          </div>

          {/* 6. Observaciones */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notas u Observaciones
            </label>
            <textarea
              name="briefNotes"
              rows={2}
              defaultValue={deal.briefNotes || ''}
              placeholder="Detalles sobre entregables, canales o condiciones del fee..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancelService}
              disabled={isCanceling}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isCanceling ? 'Dando de baja...' : 'Dar de Baja Servicio'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
