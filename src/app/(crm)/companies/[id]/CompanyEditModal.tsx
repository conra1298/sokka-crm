'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2, Save, Trash2 } from 'lucide-react';
import { updateCompanyAction, archiveCompanyAction } from '../actions';

interface CompanyEditModalProps {
  company: {
    id: string;
    name: string;
    domain?: string | null;
    industry?: string | null;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    linkedinUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    tiktokUrl?: string | null;
    clientStatus?: string | null;
    ownerId?: string | null;
  };
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
}

export default function CompanyEditModal({ company, users, onClose }: CompanyEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await updateCompanyAction(company.id, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onClose();
    router.refresh();
  };

  const handleArchive = async () => {
    if (!confirm('¿Estás seguro de que deseas archivar/eliminar esta empresa?')) return;
    setIsArchiving(true);
    const res = await archiveCompanyAction(company.id);
    if (res?.error) {
      setError(res.error);
      setIsArchiving(false);
      return;
    }
    onClose();
    router.push('/companies');
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#274283]/10 text-[#274283]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">Editar Empresa</h2>
              <p className="text-xs text-slate-500">Actualizar datos de la cuenta corporativa</p>
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={company.name}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Estado del Cliente
              </label>
              <select
                name="clientStatus"
                defaultValue={company.clientStatus || 'prospect'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
              >
                <option value="prospect">🎯 Prospecto / En Negociación</option>
                <option value="active_client">⭐ Cliente Activo</option>
                <option value="ex_client">💤 Ex Cliente / Pausado</option>
                <option value="lost">❌ Perdido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Industria / Rubro
              </label>
              <input
                type="text"
                name="industry"
                defaultValue={company.industry || ''}
                placeholder="ej. E-commerce, Salud, Tecnología..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Sitio Web / URL
              </label>
              <input
                type="text"
                name="website"
                defaultValue={company.website || company.domain || ''}
                placeholder="https://empresa.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={company.phone || ''}
                placeholder="+54 9 11 1234-5678"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                name="instagramUrl"
                defaultValue={company.instagramUrl || ''}
                placeholder="https://instagram.com/empresa"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                LinkedIn URL
              </label>
              <input
                type="text"
                name="linkedinUrl"
                defaultValue={company.linkedinUrl || ''}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Responsable / Propietario de la Cuenta
            </label>
            <select
              name="ownerId"
              defaultValue={company.ownerId || ''}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white font-medium"
            >
              <option value="">Sin Asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isArchiving ? 'Archivando...' : 'Archivar Empresa'}</span>
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
