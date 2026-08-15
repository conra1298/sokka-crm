import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { db } from '@/db';
import { deals, companies, contacts, users, services, pipelineStages } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { FilterSelect } from '@/components/FilterSelect';
import { formatCurrency, formatDate } from '@/lib/utils/normalization';
import ClientCreateModal from './ClientCreateModal';
import {
  RefreshCcw,
  Plus,
  Search,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default async function ClientsPage(props: {
  searchParams?: Promise<{
    search?: string;
    ownerId?: string;
    action?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth();

  const search = searchParams?.search?.toLowerCase() || '';
  const ownerId = searchParams?.ownerId || '';
  const showCreateModal = searchParams?.action === 'new';

  // 1. Fetch active retainer deals
  const allDeals = await db.query.deals.findMany({
    where: (d: any, { and, eq }: any) => and(eq(d.isArchived, false), eq(d.dealType, 'retainer')),
    with: {
      company: {
        with: {
          companyTags: {
            with: {
              tag: true,
            },
          },
        },
      },
      contact: true,
      owner: true,
      stage: true,
    },
    orderBy: [desc(deals.createdAt)],
  });

  // Filter only won or active retainers
  let activeClients = allDeals.filter((d: any) => {
    // If it has stage, consider active if isWon or not lost terminal
    return d.stage?.isWon || !d.stage?.isTerminal;
  });

  if (search) {
    activeClients = activeClients.filter((d: any) => {
      const matchTitle = d.title?.toLowerCase().includes(search);
      const matchComp = d.company?.name?.toLowerCase().includes(search);
      const matchContact = d.contact ? `${d.contact.firstName} ${d.contact.lastName}`.toLowerCase().includes(search) : false;
      return matchTitle || matchComp || matchContact;
    });
  }

  if (ownerId) {
    activeClients = activeClients.filter((d: any) => d.ownerId === ownerId);
  }

  // Calculate Metrics
  const totalMRR = activeClients.reduce(
    (sum: number, d: any) => sum + Number(d.monthlyValue || d.value || 0),
    0
  );
  const totalCount = activeClients.length;
  const avgFee = totalCount > 0 ? Math.round(totalMRR / totalCount) : 0;

  // Companies, Contacts, Services and Users for the creation modal
  const companiesList = await db.query.companies.findMany({
    where: (c: any, { eq }: any) => eq(c.isArchived, false),
    orderBy: [asc(companies.name)],
  });

  const contactsList = await db.query.contacts.findMany({
    where: (c: any, { eq }: any) => eq(c.isArchived, false),
    orderBy: [asc(contacts.firstName)],
  });

  const servicesList = await db.query.services.findMany({
    where: (s: any, { eq }: any) => eq(s.isActive, true),
    orderBy: [asc(services.name)],
  });

  const usersList = await db.query.users.findMany({
    where: (u: any, { eq }: any) => eq(u.isActive, true),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Clientes Activos"
        subtitle="Gestión ejecutiva de clientes fijos, servicios continuos (retainers) y facturación mensual de Sokka Estudio."
      >
        <Link href="/clients?action=new" className="btn-primary flex items-center gap-2 text-sm shadow-md">
          <Plus className="w-4 h-4" />
          <span>Cargar Cliente Activo</span>
        </Link>
      </PageHeader>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              MRR Activo Total
            </p>
            <h3 className="text-2xl font-black text-[#274283]">{formatCurrency(totalMRR)}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Ingresos mensuales recurrentes</span>
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#5CB2D4]/15 text-[#274283]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cuentas / Clientes Activos
            </p>
            <h3 className="text-2xl font-black text-slate-900">{totalCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Servicios mensuales en ejecución</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Ticket Promedio (ARPU)
            </p>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(avgFee)}</h3>
            <p className="text-xs text-slate-500 mt-1">Promedio mensual por cuenta</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-[#EDA143]">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <form method="GET" className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por cliente, empresa o servicio..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>
          <button type="submit" className="btn-secondary py-2 px-4 text-xs font-semibold">
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-3">
          {user.role !== 'salesperson' && usersList.length > 0 && (
            <FilterSelect
              name="ownerId"
              defaultValue={ownerId}
              placeholder="Todos los Account Managers"
              options={usersList.map((u: any) => ({ label: u.name, value: u.id }))}
            />
          )}
        </div>
      </div>

      {/* Main Table */}
      {activeClients.length === 0 ? (
        <EmptyState
          icon={RefreshCcw}
          title="No hay clientes activos cargados"
          description="Comienza cargando las empresas y servicios mensuales fijos con los que trabaja Sokka Estudio."
          action={
            <Link href="/clients?action=new" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              <span>Cargar Primer Cliente Activo</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Empresa / Cliente</th>
                  <th className="p-4">Servicio Contratado</th>
                  <th className="p-4 text-right">Fee Mensual (MRR)</th>
                  <th className="p-4">Día de Cobro</th>
                  <th className="p-4">Account Manager</th>
                  <th className="p-4">Inicio</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeClients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Empresa */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#274283]/10 text-[#274283] font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {client.company?.name ? client.company.name.substring(0, 2).toUpperCase() : 'SK'}
                        </div>
                        <div>
                          {client.company ? (
                            <Link
                              href={`/companies/${client.company.id}`}
                              className="font-bold text-[#274283] hover:underline block leading-tight"
                            >
                              {client.company.name}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-800 block leading-tight">
                              {client.contact ? `${client.contact.firstName} ${client.contact.lastName}` : 'Cliente Sin Empresa'}
                            </span>
                          )}
                          {client.contact && client.company && (
                            <span className="text-xs text-slate-500">
                              Contacto: {client.contact.firstName} {client.contact.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Servicio */}
                    <td className="p-4">
                      <Link
                        href={`/deals/${client.id}`}
                        className="font-semibold text-slate-900 hover:text-[#5CB2D4] transition"
                      >
                        {client.title}
                      </Link>
                      <span className="block text-[11px] text-slate-400">Servicio Mensual Fijo</span>
                    </td>

                    {/* Fee Mensual */}
                    <td className="p-4 text-right">
                      <span className="font-extrabold text-[#274283] text-base">
                        {formatCurrency(client.monthlyValue || client.value || 0)}
                      </span>
                      <span className="block text-[10px] uppercase font-bold text-emerald-600">/ mes</span>
                    </td>

                    {/* Día de Cobro */}
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[#EDA143] text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{client.retainerRenewalDate || 'Día 10'}</span>
                      </div>
                    </td>

                    {/* Account Manager */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {client.owner?.name?.substring(0, 1) || 'A'}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{client.owner?.name || 'Sin Asignar'}</span>
                      </div>
                    </td>

                    {/* Inicio */}
                    <td className="p-4 text-xs font-mono text-slate-500">
                      {client.retainerStartDate ? formatDate(client.retainerStartDate) : formatDate(client.createdAt)}
                    </td>

                    {/* Acciones */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/deals/${client.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#274283] hover:text-white text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <span>Ficha</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Carga Rápida */}
      {showCreateModal && (
        <ClientCreateModal
          companies={companiesList}
          contacts={contactsList}
          users={usersList}
          services={servicesList}
        />
      )}
    </div>
  );
}
