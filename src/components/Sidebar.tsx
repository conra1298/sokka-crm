'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  Sliders,
  UserCog,
  LogOut,
  FileSpreadsheet,
  Tag,
  Package,
  RefreshCcw,
} from 'lucide-react';
import { logoutAction } from '@/app/(auth)/login/actions';
import { SessionUser } from '@/lib/services/auth.service';

interface SidebarProps {
  user: SessionUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Contactos', href: '/contacts', icon: Users },
    { label: 'Empresas', href: '/companies', icon: Building2 },
    { label: 'Embudo de Ventas', href: '/deals', icon: Kanban },
    { label: 'Clientes Activos', href: '/clients', icon: RefreshCcw },
    { label: 'Tareas', href: '/tasks', icon: CheckSquare },
  ];

  const adminItems = [
    { label: 'Importar CSV', href: '/contacts/import', icon: FileSpreadsheet },
    { label: 'Catálogo Servicios', href: '/settings/services', icon: Package },
    { label: 'Etiquetas Globales', href: '/settings/tags', icon: Tag },
    { label: 'Etapas del Embudo', href: '/settings/pipeline', icon: Sliders },
    { label: 'Gestión de Usuarios', href: '/settings/users', icon: UserCog },
  ];

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    salesperson: 'Vendedor',
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#274283] text-white z-30 shadow-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <img src="/logo-app.svg" alt="Sokka Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-white leading-none">
              SOKKA CRM
            </h1>
            <p className="text-xs text-white/70 mt-0.5 font-sans">Gestión de Ventas B2B</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <div>
            <p className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Flujo Principal
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold shadow-inner'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#5CB2D4]' : 'text-white/70'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {user.role === 'admin' && (
            <div>
              <p className="px-3 text-xs font-semibold text-[#EDA143] uppercase tracking-wider mb-3">
                Administración
              </p>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#EDA143]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-semibold truncate text-white">{user.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#5CB2D4] text-[#0f172a]">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => logoutAction()}
              title="Cerrar Sesión"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#274283] text-white z-40 border-t border-white/10 px-2 py-2 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium ${
                isActive ? 'text-[#5CB2D4] font-bold' : 'text-white/70'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="mt-1 text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
