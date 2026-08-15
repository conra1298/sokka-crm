import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { getCompanyDetail } from '@/lib/services/company.service';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import Timeline from '@/components/Timeline';
import ActivityComposer from '@/components/ActivityComposer';
import TaskComposer from '@/components/TaskComposer';
import TaskRow from '@/app/(crm)/tasks/TaskRow';
import { formatDate, formatCurrency } from '@/lib/utils/normalization';
import {
  Globe,
  Building2,
  User,
  Users,
  Kanban,
  CheckSquare,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { listTags, getCompanyTags } from '@/lib/services/tag.service';
import CompanyBriefSection from './CompanyBriefSection';
import CompanyTagsSection from './CompanyTagsSection';
import CompanyHeaderActions from './CompanyHeaderActions';
import { db } from '@/db';

export default async function CompanyDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await requireAuth();

  const company = await getCompanyDetail(params.id, user);
  if (!company) {
    notFound();
  }

  const allTags = await listTags();
  const assignedCompanyTags = await getCompanyTags(company.id);
  const assignedTagIds = assignedCompanyTags.map((t: any) => t.id);

  const usersList = await db.query.users.findMany({
    where: (u: any, { eq }: any) => eq(u.isActive, true),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active_client':
        return <Badge variant="success">⭐ Cliente Activo</Badge>;
      case 'ex_client':
        return <Badge variant="secondary">💤 Ex Cliente</Badge>;
      case 'lost':
        return <Badge variant="danger">❌ Perdido</Badge>;
      default:
        return <Badge variant="primary">🎯 Prospecto</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#274283] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Empresas</span>
        </Link>
      </div>

      <PageHeader
        title={company.name}
        subtitle={company.industry ? `Industria: ${company.industry}` : 'Ficha de Detalle de Empresa'}
      >
        <CompanyHeaderActions company={company} users={usersList} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details & Linked Contacts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Información Corporativa
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Dominio Web / Sitio</p>
                  {company.domain || company.website ? (
                    <a
                      href={company.website || `https://${company.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#5CB2D4] font-medium hover:underline"
                    >
                      {company.website || company.domain}
                    </a>
                  ) : (
                    <p className="text-slate-400 italic">Sin dominio</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Industria</p>
                  <p className="text-slate-800 font-medium">{company.industry || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Propietario de la Cuenta</p>
                  <p className="text-slate-800 font-medium">{company.owner?.name || 'Sin asignar'}</p>
                </div>
              </div>
            </div>

            {/* Social Media & Digital Marketing Channels */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#274283]">
                Redes Sociales & Canales
              </h3>
              <div className="flex flex-wrap gap-2">
                {company.instagramUrl && (
                  <a
                    href={company.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition"
                  >
                    <span>Instagram</span>
                  </a>
                )}
                {company.linkedinUrl && (
                  <a
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                  >
                    <span>LinkedIn</span>
                  </a>
                )}
                {company.facebookUrl && (
                  <a
                    href={company.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                  >
                    <span>Facebook</span>
                  </a>
                )}
                {company.tiktokUrl && (
                  <a
                    href={company.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    <span>TikTok</span>
                  </a>
                )}
                {!company.instagramUrl && !company.linkedinUrl && !company.facebookUrl && !company.tiktokUrl && (
                  <p className="text-xs text-slate-400 italic">No hay redes sociales registradas aún.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1 font-mono">
              <p>ID: {company.id}</p>
              <p>Creada el: {formatDate(company.createdAt)}</p>
            </div>
          </div>

          {/* Company Tags Section */}
          <CompanyTagsSection
            companyId={company.id}
            allTags={allTags}
            initialSelectedTagIds={assignedTagIds}
          />

          {/* Linked Contacts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#274283]" />
                <span>Contactos de la Empresa ({company.contacts?.length || 0})</span>
              </h2>
              <Link
                href={`/contacts?action=new&companyId=${company.id}`}
                className="text-xs font-semibold text-[#274283] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo</span>
              </Link>
            </div>

            {company.contacts?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay contactos vinculados aún.</p>
            ) : (
              <div className="space-y-3">
                {company.contacts.map((contact: any) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="block p-3 rounded-xl border border-slate-200 hover:border-[#5CB2D4] transition bg-slate-50/50"
                  >
                    <p className="font-semibold text-sm text-[#274283]">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{contact.jobTitle || contact.email}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Linked Open Deals */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Kanban className="w-4 h-4 text-[#274283]" />
                <span>Oportunidades Abiertas ({company.deals?.length || 0})</span>
              </h2>
              <Link
                href={`/deals?action=new&companyId=${company.id}`}
                className="text-xs font-semibold text-[#274283] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva</span>
              </Link>
            </div>

            {company.deals?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay oportunidades abiertas vinculadas a esta empresa.</p>
            ) : (
              <div className="space-y-3">
                {company.deals.map((deal: any) => (
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

        {/* Right Column: Brief Editor, Activity Composer & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <CompanyBriefSection companyId={company.id} initialBriefNotes={company.briefNotes} />

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900">Registrar Nueva Actividad</h2>
            <ActivityComposer companyId={company.id} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-base text-slate-900">
              Historial de Actividades y Conversaciones
            </h2>
            <Timeline activities={company.activities as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
