'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Calendar } from 'lucide-react';

interface TaskComposerProps {
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export default function TaskComposer({ contactId, dealId, companyId }: TaskComposerProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dueDate: dueDate || null,
          contactId,
          dealId,
          companyId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear la tarea');
      }

      setTitle('');
      setDueDate('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la tarea (ej. Dar seguimiento a propuesta)..."
          required
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
        />

        <div className="relative">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white text-slate-700"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="btn-primary py-2 px-4 text-xs shadow-sm flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isSubmitting ? 'Agregando...' : 'Agregar Tarea'}</span>
        </button>
      </div>
    </form>
  );
}
