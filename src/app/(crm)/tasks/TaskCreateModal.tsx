'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckSquare, UserCheck } from 'lucide-react';
import { createTaskAction } from './actions';

interface AssigneeUser {
  id: string;
  name: string;
  role: string;
}

export default function TaskCreateModal({
  assignableUsers = [],
  currentUserId,
}: {
  assignableUsers?: AssigneeUser[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const closeModal = () => {
    router.push('/tasks');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createTaskAction(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    closeModal();
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    manager: 'Gerente',
    salesperson: 'Vendedor',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#274283]" />
            <h2 className="font-display font-bold text-lg text-slate-800">Crear Nueva Tarea</h2>
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
              Título de la Tarea *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="ej. Enviar propuesta técnica ajustada..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Asignar a *
            </label>
            <div className="relative">
              <select
                name="assignedTo"
                defaultValue={currentUserId}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white appearance-none pr-8"
              >
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({roleLabels[u.role] || u.role})
                  </option>
                ))}
              </select>
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="dueDate"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Descripción / Notas Adicionales
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detalles sobre lo que se debe realizar..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
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
              {isSubmitting ? 'Guardando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
