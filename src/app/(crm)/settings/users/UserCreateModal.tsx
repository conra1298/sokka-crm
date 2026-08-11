'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus } from 'lucide-react';
import { createUserAction } from './actions';

export default function UserCreateModal() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const closeModal = () => {
    router.push('/settings/users');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createUserAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#274283]" />
            <h2 className="font-display font-bold text-lg text-slate-800">Agregar Nuevo Usuario</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="ej. Mateo Rossi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="ej. mateo@sokka.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contraseña de Acceso *
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Rol de Acceso *
            </label>
            <select
              name="role"
              required
              defaultValue="salesperson"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
            >
              <option value="salesperson">Vendedor / Ejecutivo</option>
              <option value="manager">Gerente Comercial</option>
              <option value="admin">Administrador del Sistema</option>
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
              {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
