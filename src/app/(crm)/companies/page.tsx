import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { listCompanies } from '@/lib/services/company.service';
import { db } from '@/db';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/normalization';
import { Building2, Search, Plus, Globe, Users, Kanban, ChevronRight } from 'lucide-react';
import CompanyCreateModal from './CompanyCreateModal';
import { FilterSelect } from '@/components/FilterSelect';

export default async function CompaniesPage(props: {
  searchParams?: Promise<{ search?: string; ownerId?: string; action?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth();

  const search = searchParams?.search || '';
  const ownerId = searchParams?.ownerId || '';
  const showCreateModal = searchParams?.action === 'new';

  const companiesList = await listCompanies(user, { search, ownerId });
  const usersList =
    user.role !== 'salesperson'
      ? await db.query.users.findMany({ where: (u: any, { eq }: any) => eq(u.isActive, true) })
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio de Empresas"
        subtitle="Gestiona cuentas B2B, dominios, contactos y volumen de oportunidades comerciales."
      >
        <Link href="/companies?action=new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Nueva Empresa</span>
        </Link>
      </PageHeader>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <form method="GET" className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre de empresa, dominio o industria..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>
          <button type="submit" className="btn-secondary py-2 px-4 text-xs font-semibold">
            Buscar
          </button>
        </form>

        {user.role !== 'salesperson' && usersList.length > 0 && (
          <FilterSelect
            name="ownerId"
            defaultValue={ownerId}
            placeholder="Todos los Propietarios"
            options={usersList.map((u: any) => ({ label: u.name, value: u.id }))}
          />
        )}
      </div>

      {/* Directory Table */}
      {companiesList.length === 0 ? (
        <EmptyState
          title="No se encontraron empresas"
          description="Tu directorio de empresas está vacío o ningún registro coincide con tu búsqueda."
          icon={Building2}
          action={
            <Link href="/companies?action=new" className="btn-primary text-sm">
              Crear Primera Empresa
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6">Nombre de la Empresa</th>
                  <th className="p-4">Dominio Web</th>
                  <th className="p-4">Industria</th>
                  <th className="p-4">Propietario</th>
                  <th className="p-4 text-center">Contactos</th>
                  <th className="p-4 text-center">Oportunidades</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {companiesList.map((company: any) => (
                  <tr key={company.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 pl-6">
                      <Link
                        href={`/companies/${company.id}`}
                        className="font-semibold text-[#274283] hover:underline flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{company.name}</span>
                      </Link>
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-600">
                      {company.domain ? (
                        <a
                          href={`https://${company.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 text-[#5CB2D4]"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{company.domain}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Sin dominio</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-700">
                      {company.industry || <span className="text-slate-400 italic">No especificada</span>}
                    </td>

                    <td className="p-4 font-medium text-slate-700">
                      {company.owner?.name || 'Sin asignar'}
                    </td>

                    <td className="p-4 text-center">
                      <Badge variant="secondary">{company.contacts?.length || 0}</Badge>
                    </td>

                    <td className="p-4 text-center">
                      <Badge variant="secondary">{company.deals?.length || 0}</Badge>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/companies/${company.id}`}
                        className="inline-flex items-center text-xs font-semibold text-[#274283] hover:underline"
                      >
                        <span>Ver Ficha</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && <CompanyCreateModal users={usersList} />}
    </div>
  );
}
