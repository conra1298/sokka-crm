import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { getPipelineBoardData } from '@/lib/services/pipeline.service';
import { db } from '@/db';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import PipelineBoard from './PipelineBoard';
import DealCreateModal from './DealCreateModal';
import { FilterSelect } from '@/components/FilterSelect';
import { formatCurrency, formatDate } from '@/lib/utils/normalization';
import {
  Kanban,
  LayoutList,
  Plus,
  Search,
  Building2,
  User,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default async function DealsPage(props: {
  searchParams?: Promise<{
    view?: 'board' | 'table';
    search?: string;
    ownerId?: string;
    action?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth();

  const viewMode = searchParams?.view || 'board';
  const search = searchParams?.search || '';
  const ownerId = searchParams?.ownerId || '';
  const showCreateModal = searchParams?.action === 'new';

  const { stages, dealsList } = await getPipelineBoardData(user, { search, ownerId });

  const companiesList = await db.query.companies.findMany({
    where: (c: any, { eq }: any) => eq(c.isArchived, false),
  });

  const contactsList = await db.query.contacts.findMany({
    where: (c: any, { eq }: any) => eq(c.isArchived, false),
  });

  const usersList =
    user.role !== 'salesperson'
      ? await db.query.users.findMany({ where: (u: any, { eq }: any) => eq(u.isActive, true) })
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Embudo de Ventas y Oportunidades"
        subtitle="Visualiza, arrastra y gestiona el progreso de tus oportunidades comerciales por etapas."
      >
        <Link href="/deals?action=new" className="btn-primary flex items-center gap-2 text-sm shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Nueva Oportunidad</span>
        </Link>
        {user.role === 'admin' && (
          <a
            href="/api/export/deals"
            download="export-oportunidades.csv"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#EDA143]" />
            <span>Exportar CSV</span>
          </a>
        )}
      </PageHeader>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <form method="GET" className="flex-1 flex gap-2">
          <input type="hidden" name="view" value={viewMode} />
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar oportunidad por nombre..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>
          <button type="submit" className="btn-secondary py-2 px-4 text-xs font-semibold">
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-4">
          {user.role !== 'salesperson' && usersList.length > 0 && (
            <FilterSelect
              name="ownerId"
              defaultValue={ownerId}
              placeholder="Todos los Vendedores"
              options={usersList.map((u: any) => ({ label: u.name, value: u.id }))}
            />
          )}

          {/* View Switcher Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Link
              href={`/deals?view=board${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'board' ? 'bg-white text-[#274283] shadow-sm' : 'text-slate-600'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tablero</span>
            </Link>
            <Link
              href={`/deals?view=table${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-white text-[#274283] shadow-sm' : 'text-slate-600'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main View: Board or Table */}
      {viewMode === 'board' ? (
        <PipelineBoard stages={stages} initialDeals={dealsList as any} userRole={user.role} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4 pl-6">Oportunidad</th>
                <th className="p-4">Etapa del Embudo</th>
                <th className="p-4 text-right">Monto ($)</th>
                <th className="p-4">Empresa / Contacto</th>
                <th className="p-4">Propietario</th>
                <th className="p-4">Cierre Estimado</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dealsList.map((deal: any) => (
                <tr key={deal.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-semibold text-[#274283] hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{deal.stage?.name}</Badge>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="p-4 text-slate-700">
                    {deal.company?.name || (deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '—')}
                  </td>
                  <td className="p-4 text-slate-700">{deal.owner?.name}</td>
                  <td className="p-4 text-xs font-mono text-slate-500">
                    {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '—'}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-xs font-semibold text-[#274283] hover:underline"
                    >
                      Ver Detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <DealCreateModal
          stages={stages}
          companies={companiesList}
          contacts={contactsList}
          users={usersList}
        />
      )}
    </div>
  );
}
