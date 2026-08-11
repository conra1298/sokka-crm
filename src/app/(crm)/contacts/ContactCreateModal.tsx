'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus, AlertTriangle } from 'lucide-react';
import { createContactAction } from './actions';

interface ContactCreateModalProps {
  companies: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
}

export default function ContactCreateModal({ companies, users }: ContactCreateModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const closeModal = () => {
    router.push('/contacts');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setDuplicateWarning(null);

    const formData = new FormData(e.currentTarget);
    const result = await createContactAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result?.duplicatesFound && result.duplicateMatches && result.duplicateMatches.length > 0) {
      setDuplicateWarning(
        `Contacto creado exitosamente. Atención: se detectaron ${result.duplicateMatches.length} contacto(s) existente(s) con un correo similar.`
      );
      setTimeout(() => {
        closeModal();
      }, 2500);
      return;
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#274283]" />
            <h2 className="font-display font-bold text-lg text-slate-800">Crear Nuevo Contacto</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="ej. María"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="ej. González"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="maria.gonzalez@empresa.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+54 11 5555 1234"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Cargo / Puesto
              </label>
              <input
                type="text"
                name="jobTitle"
                placeholder="ej. Directora de Operaciones"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
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
                Empresa
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
                Propietario del Registro
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
              {isSubmitting ? 'Guardando...' : 'Crear Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
