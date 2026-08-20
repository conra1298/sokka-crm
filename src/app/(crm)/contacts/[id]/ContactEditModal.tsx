'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Save, Trash2 } from 'lucide-react';
import { updateContactAction, archiveContactAction } from '../actions';

interface ContactEditModalProps {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    jobTitle?: string | null;
    leadSource?: string | null;
    companyId?: string | null;
    ownerId?: string | null;
  };
  companies: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
}

export default function ContactEditModal({
  contact,
  companies,
  users,
  onClose,
}: ContactEditModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('id', contact.id);
    const result = await updateContactAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onClose();
    router.refresh();
  };

  const handleArchive = async () => {
    if (!confirm('¿Estás seguro de que deseas archivar/eliminar este contacto?')) return;
    setIsArchiving(true);
    const res = await archiveContactAction(contact.id);
    if (res?.error) {
      setError(res.error);
      setIsArchiving(false);
      return;
    }
    onClose();
    router.push('/contacts');
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#274283]/10 text-[#274283]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">Editar Contacto</h2>
              <p className="text-xs text-slate-500">Actualizar información personal y profesional</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="firstName"
                required
                defaultValue={contact.firstName}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-semibold"
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
                defaultValue={contact.lastName}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue={contact.email}
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
                defaultValue={contact.phone || ''}
                placeholder="+54 9 11 1234-5678"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Empresa Vinculada
              </label>
              <select
                name="companyId"
                defaultValue={contact.companyId || ''}
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
                Cargo / Puesto
              </label>
              <input
                type="text"
                name="jobTitle"
                defaultValue={contact.jobTitle || ''}
                placeholder="ej. Director de Marketing, CEO..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Responsable / Vendedor Asignado
            </label>
            <select
              name="ownerId"
              defaultValue={contact.ownerId || ''}
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
              <span>{isArchiving ? 'Archivando...' : 'Archivar Contacto'}</span>
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
