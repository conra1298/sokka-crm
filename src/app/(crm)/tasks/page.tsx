import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { listTasks, getEligibleAssignees } from '@/lib/services/task.service';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import TaskRow from './TaskRow';
import TaskCreateModal from './TaskCreateModal';
import { CheckSquare, Plus, AlertTriangle } from 'lucide-react';

export default async function TasksPage(props: {
  searchParams?: Promise<{ filter?: 'all' | 'overdue' | 'open' | 'completed'; action?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth();

  const filter = searchParams?.filter || 'all';
  const showCreateModal = searchParams?.action === 'new';

  const listOptions: any = {};
  if (filter === 'overdue') listOptions.overdueOnly = true;
  else if (filter === 'open') listOptions.isCompleted = false;
  else if (filter === 'completed') listOptions.isCompleted = true;

  const tasksList = await listTasks(user, listOptions);
  const assignableUsers = await getEligibleAssignees(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tareas y Seguimientos Comerciales"
        subtitle="Organiza tus llamadas, reuniones, correos y recordatorios prioritarios."
      >
        <Link href="/tasks?action=new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </Link>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/tasks?filter=all"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-[#274283] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas las Tareas
          </Link>
          <Link
            href="/tasks?filter=overdue"
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              filter === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tareas Vencidas</span>
          </Link>
          <Link
            href="/tasks?filter=open"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === 'open'
                ? 'bg-[#274283] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tareas Abiertas
          </Link>
          <Link
            href="/tasks?filter=completed"
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === 'completed'
                ? 'bg-[#274283] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Completadas
          </Link>
        </div>
      </div>

      {/* Tasks List Container */}
      {tasksList.length === 0 ? (
        <EmptyState
          title="No hay tareas registradas"
          description={
            filter === 'overdue'
              ? '🎉 ¡Excelente! No tienes tareas pendientes vencidas.'
              : 'Tu lista de tareas está limpia. Crea una nueva tarea de seguimiento.'
          }
          icon={CheckSquare}
          action={
            <Link href="/tasks?action=new" className="btn-primary text-sm">
              Crear Primera Tarea
            </Link>
          }
        />
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          {tasksList.map((task: any) => (
            <TaskRow key={task.id} task={task as any} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <TaskCreateModal assignableUsers={assignableUsers} currentUserId={user.id} />
      )}
    </div>
  );
}
