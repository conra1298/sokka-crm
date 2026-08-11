import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { db } from '@/db';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import { formatDate } from '@/lib/utils/normalization';
import UserCreateModal from './UserCreateModal';
import { UserCog, ShieldCheck, UserPlus } from 'lucide-react';

export default async function UserSettingsPage(props: {
  searchParams?: Promise<{ action?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentUser = await requireAuth('admin');
  const showCreateModal = searchParams?.action === 'new';

  const usersList = await db.query.users.findMany({
    orderBy: (u: any, { asc }: any) => [asc(u.name)],
  });

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente Comercial',
    salesperson: 'Vendedor / Ejecutivo',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Gestión de Usuarios y Permisos"
        subtitle="Administra los miembros del equipo, sus roles de acceso (Admin, Gerente, Vendedor) y permisos en el CRM."
      >
        <Link href="/settings/users?action=new" className="btn-primary flex items-center gap-2 text-sm">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </Link>
      </PageHeader>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#274283]" />
            <span>Usuarios de la Cuenta ({usersList.length})</span>
          </h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/70 border-b text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="p-4 pl-6">Nombre del Usuario</th>
              <th className="p-4">Correo Electrónico</th>
              <th className="p-4">Rol Asignado</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4">Fecha de Alta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usersList.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#274283]" />
                  <span>{user.name}</span>
                </td>
                <td className="p-4 font-mono text-xs text-slate-600">{user.email}</td>
                <td className="p-4">
                  <Badge variant={user.role === 'admin' ? 'accent1' : user.role === 'manager' ? 'secondary' : 'slate'}>
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </td>
                <td className="p-4 text-center">
                  {user.isActive ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Activo
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs font-mono text-slate-400">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && <UserCreateModal />}
    </div>
  );
}
