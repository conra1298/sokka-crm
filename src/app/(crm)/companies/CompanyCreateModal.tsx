'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2, Globe, Linkedin, Instagram, Facebook, Share2 } from 'lucide-react';
import { createCompanyAction } from './actions';

interface CompanyCreateModalProps {
  users: Array<{ id: string; name: string }>;
}

export default function CompanyCreateModal({ users }: CompanyCreateModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const closeModal = () => {
    router.push('/companies');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createCompanyAction(null, formData);

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
            <Building2 className="w-5 h-5 text-[#274283]" />
            <h2 className="font-display font-bold text-lg text-slate-800">Crear Nueva Empresa</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="ej. Sokka Estudio Creativo"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Dominio Web
              </label>
              <input
                type="text"
                name="domain"
                placeholder="sokkaestudio.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Industria / Rubro
              </label>
              <input
                type="text"
                name="industry"
                placeholder="ej. Agencia de Marketing Digital"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Estado del Cliente
            </label>
            <select
              name="clientStatus"
              defaultValue="prospect"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
            >
              <option value="prospect">🎯 Prospecto (Lead en negociación)</option>
              <option value="active_client">⭐ Cliente Activo (Facturando)</option>
              <option value="ex_client">💤 Ex Cliente (Baja / Inactivo)</option>
              <option value="lost">❌ Perdido (Desestimado)</option>
            </select>
          </div>

          {/* Social Media Section for Marketing Agency */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#274283] flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#5CB2D4]" />
              <span>Redes Sociales & Canales Digitales</span>
            </h3>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram</span>
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  placeholder="https://instagram.com/sokkaestudio"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LinkedIn</span>
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/company/sokkaestudio"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Facebook className="w-3.5 h-3.5 text-blue-700" />
                    <span>Facebook</span>
                  </label>
                  <input
                    type="url"
                    name="facebookUrl"
                    placeholder="https://facebook.com/sokkaestudio"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sitio Web / TikTok</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://sokkaestudio.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Propietario de la Cuenta
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
              {isSubmitting ? 'Guardando...' : 'Crear Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
