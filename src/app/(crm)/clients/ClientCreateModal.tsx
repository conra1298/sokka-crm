'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, RefreshCcw, Building2, Plus, Sparkles, UserCheck, Calendar } from 'lucide-react';
import { createActiveClientAction } from './actions';

interface ClientCreateModalProps {
  companies: Array<{ id: string; name: string }>;
  contacts: Array<{ id: string; firstName: string; lastName: string; companyId?: string | null }>;
  users: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; suggestedPrice: number | null; category: string }>;
}

export default function ClientCreateModal({
  companies,
  contacts,
  users,
  services,
}: ClientCreateModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Mode: existing company vs new company
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');

  const closeModal = () => {
    router.push('/clients');
  };

  const handleSelectService = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    if (s) {
      setTitle(s.name);
      if (s.suggestedPrice) {
        setMonthlyValue(s.suggestedPrice.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createActiveClientAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    closeModal();
  };

  const filteredContacts = selectedCompanyId
    ? contacts.filter((c) => !c.companyId || c.companyId === selectedCompanyId)
    : contacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5CB2D4]/15 text-[#274283]">
              <RefreshCcw className="w-5 h-5 text-[#274283]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">Cargar Cliente Activo</h2>
              <p className="text-xs text-slate-500">Alta de servicio mensual recurrente (Retainer)</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* 1. Empresa o Marca */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Empresa / Marca del Cliente *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewCompany(!isNewCompany);
                  setSelectedCompanyId('');
                }}
                className="text-xs text-[#274283] font-semibold hover:underline flex items-center gap-1"
              >
                {isNewCompany ? '← Elegir de existentes' : '+ Crear Nueva Empresa'}
              </button>
            </div>

            {isNewCompany ? (
              <input
                type="text"
                name="newCompanyName"
                required
                placeholder="Nombre de la nueva empresa (ej. Eco Donato SRL)"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#5CB2D4] bg-[#5CB2D4]/5 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            ) : (
              <select
                name="companyId"
                required
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
              >
                <option value="">Seleccionar Empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Contacto Principal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contacto Principal (Opcional)
            </label>
            <select
              name="contactId"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
            >
              <option value="">Ninguno / Asignar más tarde</option>
              {filteredContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Catálogo Rápido de Servicios */}
          {services.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#EDA143]" />
                <span>Autocompletar desde el Catálogo de Sokka:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {services.slice(0, 5).map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleSelectService(srv.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white text-slate-700 transition font-medium border border-slate-200"
                  >
                    {srv.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Nombre del Servicio Continuo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre del Servicio / Plan Mensual *
            </label>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Gestión Integral de Paid Media & Ads"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          {/* 5. Fee Mensual y Día de Cobro */}
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
                  value={monthlyValue}
                  onChange={(e) => setMonthlyValue(e.target.value)}
                  placeholder="300000"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Día de Cobro / Factura
              </label>
              <select
                name="renewalDay"
                defaultValue="10"
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

          {/* 6. Account Manager y Fecha de Inicio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Manager
              </label>
              <select
                name="ownerId"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white text-slate-700"
              />
            </div>
          </div>

          {/* 7. Notas / Observaciones */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notas u Observaciones
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Detalles sobre entregables, canales o condiciones del fee..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shadow-md"
            >
              <RefreshCcw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Guardando Cliente...' : 'Guardar Cliente Activo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
