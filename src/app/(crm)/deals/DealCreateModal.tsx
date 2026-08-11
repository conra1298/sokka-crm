'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Kanban } from 'lucide-react';
import { createDealAction } from './actions';

interface DealCreateModalProps {
  stages: Array<{ id: string; name: string }>;
  companies: Array<{ id: string; name: string }>;
  contacts: Array<{ id: string; firstName: string; lastName: string }>;
  users: Array<{ id: string; name: string }>;
}

export default function DealCreateModal({
  stages,
  companies,
  contacts,
  users,
}: DealCreateModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dealType, setDealType] = useState<'project' | 'retainer'>('project');

  const closeModal = () => {
    router.push('/deals');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createDealAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-[#274283]" />
            <h2 className="font-display font-bold text-lg text-slate-800">Crear Nueva Oportunidad</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la Oportunidad *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="ej. Campaña Social Media & Ads - Cliente X"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          {/* Tipo de Deal: Proyecto vs Retainer */}
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
            <input type="hidden" name="dealType" value={dealType} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {dealType === 'retainer' ? 'Monto Mensual ($ ARS) *' : 'Monto Total ($ ARS)'}
              </label>
              <input
                type="number"
                step="0.01"
                name={dealType === 'retainer' ? 'monthlyValue' : 'value'}
                required
                placeholder="150000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Etapa del Embudo *
              </label>
              <select
                name="stageId"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Fuente del Lead (Origen)
            </label>
            <select
              name="leadSource"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
            >
              <option value="">Seleccionar Origen...</option>
              <option value="instagram">📸 Instagram</option>
              <option value="linkedin">💼 LinkedIn</option>
              <option value="facebook">👍 Facebook</option>
              <option value="referido">🤝 Referido / Recomendación</option>
              <option value="sitio_web">🌐 Sitio Web Orgánico</option>
              <option value="google_ads">🎯 Google Ads / Sem</option>
              <option value="evento">🎪 Evento / Ferias</option>
              <option value="directo">📞 Outreach / Venta Directa</option>
              <option value="otro">📌 Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Empresa Vinculada
              </label>
              <select
                name="companyId"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
              >
                <option value="">Ninguna / Sin Empresa</option>
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
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
              >
                <option value="">Ninguno / Sin Contacto</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Vendedor / Responsable
              </label>
              <select
                name="ownerId"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
              >
                <option value="">Asignar a Mí</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fecha Estimada de Cierre
              </label>
              <input
                type="date"
                name="expectedCloseDate"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary py-2.5 px-5 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2.5 px-5 text-xs shadow-md"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Oportunidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
