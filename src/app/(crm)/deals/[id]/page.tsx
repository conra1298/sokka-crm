import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { getDealDetail } from '@/lib/services/deal.service';
import { db } from '@/db';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import Timeline from '@/components/Timeline';
import ActivityComposer from '@/components/ActivityComposer';
import TaskComposer from '@/components/TaskComposer';
import TaskRow from '@/app/(crm)/tasks/TaskRow';
import StageSelectForm from './StageSelectForm';
import { formatDate, formatCurrency } from '@/lib/utils/normalization';
import {
  DollarSign,
  Building2,
  User,
  Calendar,
  CheckSquare,
  ArrowLeft,
  Kanban,
} from 'lucide-react';

import DealBriefSection from './DealBriefSection';
import DealServiceItemsSection from './DealServiceItemsSection';
import { listServices, getDealServiceItems } from '@/lib/services/service-catalog.service';

export default async function DealDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await requireAuth();

  const deal = await getDealDetail(params.id, user);
  if (!deal) {
    notFound();
  }

  const allStages = await db.query.pipelineStages.findMany({
    orderBy: (s: any, { asc }: any) => [asc(s.displayOrder)],
  });

  const catalogServices = await listServices({ activeOnly: true });
  const proposalItems = await getDealServiceItems(deal.id);

  const getLeadSourceLabel = (source: string | null) => {
    switch (source) {
      case 'instagram': return '📸 Instagram';
      case 'linkedin': return '💼 LinkedIn';
      case 'facebook': return '👍 Facebook';
      case 'referido': return '🤝 Referido';
      case 'sitio_web': return '🌐 Sitio Web';
      case 'google_ads': return '🎯 Google Ads';
      case 'evento': return '🎪 Evento';
      case 'directo': return '📞 Outreach';
      default: return source ? `📌 ${source}` : null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#274283] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Tablero de Oportunidades</span>
        </Link>
      </div>

      <PageHeader
        title={deal.title}
        subtitle={`${deal.dealType === 'retainer' ? `Retainer Mensual: ${formatCurrency(deal.monthlyValue || deal.value)}/mes` : `Proyecto Único: ${formatCurrency(deal.value)}`}${deal.leadSource ? ` · Origen: ${getLeadSourceLabel(deal.leadSource)}` : ''}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Deal Metadata Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Detalle de la Oportunidad
            </h2>

            {/* Stage Selector Transition Control */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Etapa Actual del Embudo
              </label>
              <StageSelectForm
                dealId={deal.id}
                currentStageId={deal.stageId}
                stages={allStages}
                userRole={user.role}
              />
            </div>

            <div className="space-y-4 text-sm pt-2">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-[#274283] flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Monto Estimado</p>
                  <p className="font-display font-extrabold text-lg text-slate-900">
                    {formatCurrency(deal.value)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Empresa Vinculada</p>
                  {deal.company ? (
                    <Link
                      href={`/companies/${deal.company.id}`}
                      className="text-[#274283] font-medium hover:underline"
                    >
                      {deal.company.name}
                    </Link>
                  ) : (
                    <p className="text-slate-400 italic">Sin empresa</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Contacto Principal</p>
                  {deal.contact ? (
                    <Link
                      href={`/contacts/${deal.contact.id}`}
                      className="text-[#274283] font-medium hover:underline"
                    >
                      {deal.contact.firstName} {deal.contact.lastName}
                    </Link>
                  ) : (
                    <p className="text-slate-400 italic">Sin contacto</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Propietario / Vendedor</p>
                  <p className="text-slate-800 font-medium">{deal.owner?.name || 'Sin asignar'}</p>
                </div>
              </div>

              {deal.expectedCloseDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Fecha Estimada de Cierre</p>
                    <p className="text-slate-800 font-medium">{formatDate(deal.expectedCloseDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Channels of Linked Company / Deal */}
            {(deal.company?.instagramUrl || deal.company?.linkedinUrl || deal.company?.facebookUrl || deal.company?.tiktokUrl || deal.company?.website || deal.website || deal.instagramUrl || deal.linkedinUrl) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#274283]">
                  Redes Sociales de la Empresa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(deal.company?.instagramUrl || deal.instagramUrl) && (
                    <a
                      href={deal.company?.instagramUrl || deal.instagramUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition"
                    >
                      <span>Instagram</span>
                    </a>
                  )}
                  {(deal.company?.linkedinUrl || deal.linkedinUrl) && (
                    <a
                      href={deal.company?.linkedinUrl || deal.linkedinUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                    >
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {(deal.company?.facebookUrl || deal.facebookUrl) && (
                    <a
                      href={deal.company?.facebookUrl || deal.facebookUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                    >
                      <span>Facebook</span>
                    </a>
                  )}
                  {(deal.company?.tiktokUrl || deal.tiktokUrl) && (
                    <a
                      href={deal.company?.tiktokUrl || deal.tiktokUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                    >
                      <span>TikTok</span>
                    </a>
                  )}
                  {(deal.company?.website || deal.website) && (
                    <a
                      href={deal.company?.website || deal.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      <span>Sitio Web</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1 font-mono">
              <p>ID: {deal.id}</p>
              <p>Creada el: {formatDate(deal.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Service Items & Proposal, Brief Editor, Tasks & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <DealServiceItemsSection
            dealId={deal.id}
            catalogServices={catalogServices}
            initialItems={proposalItems}
          />

          <DealBriefSection dealId={deal.id} initialBriefNotes={deal.briefNotes} />

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900">Registrar Nueva Actividad en Oportunidad</h2>
            <ActivityComposer dealId={deal.id} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#274283]" />
              <span>Tareas Pendientes de la Oportunidad ({deal.tasks?.length || 0})</span>
            </h2>

            <TaskComposer dealId={deal.id} />

            {deal.tasks?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {deal.tasks.map((task: any) => (
                  <TaskRow key={task.id} task={task as any} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900">
              Historial de Etapas y Auditoría
            </h2>
            <Timeline activities={deal.activities as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
