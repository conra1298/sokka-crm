import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { getContactDetail } from '@/lib/services/contact.service';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import Timeline from '@/components/Timeline';
import ActivityComposer from '@/components/ActivityComposer';
import TaskComposer from '@/components/TaskComposer';
import TaskRow from '@/app/(crm)/tasks/TaskRow';
import { formatDate, formatCurrency } from '@/lib/utils/normalization';
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  User,
  Kanban,
  CheckSquare,
  AlertTriangle,
  GitMerge,
  ArrowLeft,
  Plus,
} from 'lucide-react';

import { listTags, getContactTags } from '@/lib/services/tag.service';
import ContactTagsSection from './ContactTagsSection';

export default async function ContactDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await requireAuth();

  const contact = await getContactDetail(params.id, user);
  if (!contact) {
    notFound();
  }

  const allTags = await listTags();
  const assignedContactTags = await getContactTags(contact.id);
  const assignedTagIds = assignedContactTags.map((t: any) => t.id);

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#274283] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Contactos</span>
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.jobTitle ? `${contact.jobTitle} ${contact.company ? `en ${contact.company.name}` : ''}` : 'Ficha de Detalle del Contacto'}
      >
        {contact.duplicates && contact.duplicates.length > 0 && user.role === 'admin' && (
          <Link
            href={`/contacts/merge?targetId=${contact.id}`}
            className="btn-primary bg-[#EB7638] hover:bg-[#d46529] text-white flex items-center gap-2 text-sm shadow-md"
          >
            <GitMerge className="w-4 h-4" />
            <span>Fusionar Registros Duplicados</span>
          </Link>
        )}
      </PageHeader>

      {/* Duplicate Alert Banner */}
      {contact.duplicates && contact.duplicates.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Registro Duplicado Detectado</p>
              <p className="text-xs text-amber-800">
                Existe un contacto registrado con un correo electrónico equivalente ({contact.email}).
              </p>
            </div>
          </div>
          {user.role === 'admin' && (
            <Link
              href={`/contacts/merge?targetId=${contact.id}`}
              className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition whitespace-nowrap"
            >
              Iniciar Fusión →
            </Link>
          )}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Info Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Información de la Cuenta
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Correo</p>
                  <a href={`mailto:${contact.email}`} className="text-[#274283] font-medium hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Teléfono</p>
                    <p className="text-slate-800 font-medium">{contact.phone}</p>
                  </div>
                </div>
              )}

              {contact.jobTitle && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Cargo</p>
                    <p className="text-slate-800 font-medium">{contact.jobTitle}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Empresa</p>
                  {contact.company ? (
                    <Link
                      href={`/companies/${contact.company.id}`}
                      className="text-[#274283] font-medium hover:underline"
                    >
                      {contact.company.name}
                    </Link>
                  ) : (
                    <p className="text-slate-400 italic">Sin empresa</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Propietario del Registro</p>
                  <p className="text-slate-800 font-medium">{contact.owner?.name || 'Sin asignar'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1 font-mono">
              <p>ID: {contact.id}</p>
              <p>Creado el: {formatDate(contact.createdAt)}</p>
            </div>
          </div>

          {/* Contact Tags Section */}
          <ContactTagsSection
            contactId={contact.id}
            allTags={allTags}
            initialSelectedTagIds={assignedTagIds}
          />

          {/* Linked Open Deals */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Kanban className="w-4 h-4 text-[#274283]" />
                <span>Oportunidades Vinculadas ({contact.deals?.length || 0})</span>
              </h2>
              <Link
                href={`/deals?action=new&contactId=${contact.id}`}
                className="text-xs font-semibold text-[#274283] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Oportunidad</span>
              </Link>
            </div>

            {contact.deals?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay oportunidades abiertas vinculadas a este contacto.</p>
            ) : (
              <div className="space-y-3">
                {contact.deals.map((deal: any) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="block p-3 rounded-xl border border-slate-200 hover:border-[#5CB2D4] transition bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#274283]">{deal.title}</span>
                      <span className="font-bold text-sm text-slate-900">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <Badge variant="secondary">{deal.stage?.name}</Badge>
                      <span>{deal.owner?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tasks & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Composer Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900">Registrar Nueva Actividad</h2>
            <ActivityComposer contactId={contact.id} />
          </div>

          {/* Task Composer & List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#274283]" />
                <span>Tareas Pendientes y de Seguimiento ({contact.tasks?.length || 0})</span>
              </h2>
            </div>

            <TaskComposer contactId={contact.id} />

            {contact.tasks?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {contact.tasks.map((task: any) => (
                  <TaskRow key={task.id} task={task as any} />
                ))}
              </div>
            )}
          </div>

          {/* Timeline History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900">
              Historial de Actividades y Auditoría
            </h2>
            <Timeline activities={contact.activities as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
