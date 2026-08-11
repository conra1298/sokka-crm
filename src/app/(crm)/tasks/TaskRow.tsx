'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/normalization';
import { toggleTaskAction } from './actions';
import { CheckCircle2, Circle, AlertTriangle, Calendar, User, Building2, Kanban } from 'lucide-react';

interface TaskRowProps {
  task: {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate?: string | Date | null;
    isOverdue?: boolean;
    contact?: { id: string; firstName: string; lastName: string } | null;
    company?: { id: string; name: string } | null;
    deal?: { id: string; title: string } | null;
    assignee?: { name: string } | null;
  };
}

export default function TaskRow({ task }: TaskRowProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    setIsSubmitting(true);

    const result = await toggleTaskAction(task.id, nextState);
    if (!result.success) {
      setIsCompleted(!nextState); // rollback
    } else {
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isCompleted
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : task.isOverdue
          ? 'bg-rose-50/70 border-rose-200 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className="mt-0.5 text-slate-400 hover:text-[#274283] transition"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="min-w-0">
          <h3
            className={`font-semibold text-sm text-slate-900 ${
              isCompleted ? 'line-through text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 mt-1">
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 font-mono font-medium ${
                  task.isOverdue && !isCompleted ? 'text-rose-700 font-bold' : ''
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Vence: {formatDate(task.dueDate)}</span>
              </span>
            )}

            {task.contact && (
              <Link
                href={`/contacts/${task.contact.id}`}
                className="flex items-center gap-1 text-[#274283] hover:underline"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {task.contact.firstName} {task.contact.lastName}
                </span>
              </Link>
            )}

            {task.company && (
              <Link
                href={`/companies/${task.company.id}`}
                className="flex items-center gap-1 text-[#274283] hover:underline"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.company.name}</span>
              </Link>
            )}

            {task.deal && (
              <Link
                href={`/deals/${task.deal.id}`}
                className="flex items-center gap-1 text-[#274283] hover:underline font-semibold"
              >
                <Kanban className="w-3.5 h-3.5 text-slate-400" />
                <span>Oportunidad: {task.deal.title}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        {task.isOverdue && !isCompleted && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-600 text-white flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            VENCIDA
          </span>
        )}

        {task.assignee && (
          <span className="text-xs text-slate-500 font-medium">{task.assignee.name}</span>
        )}
      </div>
    </div>
  );
}
