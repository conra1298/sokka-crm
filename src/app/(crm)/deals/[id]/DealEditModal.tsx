'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Kanban, Save, Trash2 } from 'lucide-react';
import { updateDealAction, archiveDealAction } from '../actions';

interface DealEditModalProps {
  deal: {
    id: string;
    title: string;
    value?: number | null;
    monthlyValue?: number | null;
    dealType?: 'project' | 'retainer' | null;
    leadSource?: string | null;
    expectedCloseDate?: string | null;
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

export default function DealEditModal({
  deal,
  companies,
  contacts,
  users,
  onClose,
}: DealEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState('');
  const [dealType, setDealType] = useState<'project' | 'retainer'>(
    deal.dealType === 'retainer' ? 'retainer' : 'project'
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState(deal.companyId || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('id', deal.id);
    formData.append('dealType', dealType);

    const result = await updateDealAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onClose();
    router.refresh();
  };

  const handleArchive = async () => {
    if (!confirm('¿Estás seguro de archivar/eliminar esta oportunidad o servicio?')) return;
    setIsArchiving(true);
    await archiveDealAction(deal.id);
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
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">
                {dealType === 'retainer' ? 'Editar Servicio / Retainer' : 'Editar Oportunidad'}
              </h2>
              <p className="text-xs text-slate-500">Modificar datos comerciales y vinculaciones</p>
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

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la Oportunidad / Servicio *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={deal.title}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-semibold"
            />
          </div>

          {/* Tipo de Negocio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tipo de Negocio
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setDealType('project')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  dealType === 'project'
                    ? 'bg-white text-[#274283] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💼 Proyecto Único
              </button>
              <button
                type="button"
                onClick={() => setDealType('retainer')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  dealType === 'retainer'
                    ? 'bg-[#274283] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔄 Retainer Mensual (Fijo)
              </button>
            </div>
          </div>

          {/* Montos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {dealType === 'retainer' ? 'Fee Mensual ($ ARS) *' : 'Monto Total ($ ARS)'}
              </label>
              <input
                type="number"
                step="0.01"
                name={dealType === 'retainer' ? 'monthlyValue' : 'value'}
                required
                defaultValue={dealType === 'retainer' ? (deal.monthlyValue || deal.value || 0) : (deal.value || 0)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fuente del Lead (Origen)
              </label>
              <select
                name="leadSource"
                defaultValue={deal.leadSource || ''}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                <option value="">Seleccionar...</option>
                <option value="instagram">📸 Instagram</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="facebook">👍 Facebook</option>
                <option value="referido">🤝 Referido</option>
                <option value="sitio_web">🌐 Sitio Web</option>
                <option value="google_ads">🎯 Google Ads</option>
                <option value="evento">🎪 Eventos</option>
                <option value="directo">📞 Directo / Outreach</option>
                <option value="otro">📌 Otro</option>
              </select>
            </div>
          </div>

          {/* Empresa y Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Empresa Vinculada
              </label>
              <select
                name="companyId"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                <option value="">Sin Empresa</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Fechas y Responsable */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {dealType === 'retainer' ? 'Día de Cobro / Renovación' : 'Cierre Estimado'}
              </label>
              {dealType === 'retainer' ? (
                <input
                  type="text"
                  name="retainerRenewalDate"
                  defaultValue={deal.retainerRenewalDate || 'Día 10 de cada mes'}
                  placeholder="ej. Día 10 de cada mes"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
                />
              ) : (
                <input
                  type="date"
                  name="expectedCloseDate"
                  defaultValue={deal.expectedCloseDate || ''}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Manager / Responsable
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

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isArchiving ? 'Archivando...' : 'Archivar Oportunidad'}</span>
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
