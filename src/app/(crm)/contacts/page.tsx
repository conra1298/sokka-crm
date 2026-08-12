import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { listContacts } from '@/lib/services/contact.service';
import { db } from '@/db';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { FilterSelect } from '@/components/FilterSelect';
import { formatDate } from '@/lib/utils/normalization';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  GitMerge,
  Building2,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import ContactCreateModal from './ContactCreateModal';

export default async function ContactsPage(props: {
  searchParams?: Promise<{
    search?: string;
    ownerId?: string;
    companyId?: string;
    hasDuplicatesOnly?: string;
    action?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth();

  const search = searchParams?.search || '';
  const ownerId = searchParams?.ownerId || '';
  const companyId = searchParams?.companyId || '';
  const hasDuplicatesOnly = searchParams?.hasDuplicatesOnly === 'true';
  const showCreateModal = searchParams?.action === 'new';

  const contactsList = await listContacts(user, {
    search,
    ownerId,
    companyId,
    hasDuplicatesOnly,
  });

  const companiesList = await db.query.companies.findMany({
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
        title="Directorio de Contactos"
        subtitle="Gestiona personas, relaciones, registros duplicados y oportunidades de venta."
      >
        <Link href="/contacts?action=new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Nuevo Contacto</span>
        </Link>
        {user.role === 'admin' && (
          <>
            <a
              href="/api/export/contacts"
              download="export-contactos.csv"
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#EDA143]" />
              <span>Exportar CSV</span>
            </a>
            <Link href="/contacts/import" className="btn-secondary flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-[#5CB2D4]" />
              <span>Importar CSV</span>
            </Link>
            <Link href="/contacts?hasDuplicatesOnly=true" className="btn-secondary flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-[#EB7638]" />
              <span>Revisar Duplicados</span>
            </Link>
          </>
        )}
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
              placeholder="Buscar por nombre, correo o cargo..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
            />
          </div>
          <button type="submit" className="btn-secondary py-2 px-4 text-xs font-semibold">
            Buscar
          </button>
        </form>

        <div className="flex gap-2 flex-wrap items-center">
          {user.role !== 'salesperson' && usersList.length > 0 && (
            <FilterSelect
              name="ownerId"
              defaultValue={ownerId}
              placeholder="Todos los Propietarios"
              options={usersList.map((u: any) => ({ label: u.name, value: u.id }))}
            />
          )}

          <FilterSelect
            name="companyId"
            defaultValue={companyId}
            placeholder="Todas las Empresas"
            options={companiesList.map((c: any) => ({ label: c.name, value: c.id }))}
          />
        </div>
      </div>

      {/* Directory Table */}
      {contactsList.length === 0 ? (
        <EmptyState
          title="No se encontraron contactos"
          description={
            search || ownerId || companyId
              ? 'No hay contactos que coincidan con los filtros de búsqueda.'
              : 'Tu directorio de contactos está vacío. Importa contactos desde CSV o crea tu primer contacto.'
          }
          icon={Users}
          action={
            <Link href="/contacts?action=new" className="btn-primary text-sm">
              Crear Primer Contacto
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6">Nombre del Contacto</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Propietario</th>
                  <th className="p-4 text-center">Oportunidades</th>
                  <th className="p-4">Duplicados</th>
                  <th className="p-4">Fecha de Creación</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {contactsList.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 pl-6">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-semibold text-[#274283] hover:underline flex items-center gap-2"
                      >
                        <span>
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.jobTitle && (
                          <span className="text-xs text-slate-400 font-normal">
                            ({contact.jobTitle})
                          </span>
                        )}
                      </Link>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.contactTags && contact.contactTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {contact.contactTags.map((ct: any) => (
                            <span
                              key={ct.tag.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-sm truncate max-w-[100px]"
                              style={{ backgroundColor: ct.tag.color }}
                              title={ct.tag.name}
                            >
                              {ct.tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {contact.company ? (
                        <Link
                          href={`/companies/${contact.company.id}`}
                          className="font-medium text-slate-800 hover:text-[#274283] flex items-center gap-1.5"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{contact.company.name}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sin empresa</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="text-slate-700 font-medium">
                        {contact.owner?.name || 'Sin asignar'}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <Badge variant={contact.deals?.length > 0 ? 'secondary' : 'slate'}>
                        {contact.deals?.length || 0}
                      </Badge>
                    </td>

                    <td className="p-4">
                      {contact.hasDuplicates ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="accent2">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{contact.duplicateCount} coincidencia</span>
                          </Badge>
                          {user.role === 'admin' && (
                            <Link
                              href={`/contacts/merge?targetId=${contact.id}`}
                              className="text-xs font-semibold text-[#EB7638] hover:underline flex items-center"
                              title="Fusionar registros duplicados"
                            >
                              <GitMerge className="w-3.5 h-3.5 mr-0.5" />
                              Fusionar
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-700 font-medium">✓ Limpio</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 text-xs font-mono">
                      {formatDate(contact.createdAt)}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="inline-flex items-center text-xs font-semibold text-[#274283] hover:underline"
                      >
                        <span>Ver</span>
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

      {showCreateModal && <ContactCreateModal companies={companiesList} users={usersList} />}
    </div>
  );
}
