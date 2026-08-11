import { requireAuth } from '@/lib/services/auth.service';
import { listServices } from '@/lib/services/service-catalog.service';
import PageHeader from '@/components/PageHeader';
import { ShieldAlert } from 'lucide-react';
import ServiceCatalogClient from './ServiceCatalogClient';

export default async function ServiceCatalogSettingsPage() {
  const user = await requireAuth();

  if (user.role === 'salesperson') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-display font-bold text-lg text-slate-800">Acceso Restringido</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          La configuración del catálogo corporativo de servicios está disponible únicamente para Gerentes y Administradores.
        </p>
      </div>
    );
  }

  const servicesList = await listServices();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Catálogo Corporativo de Servicios"
        subtitle="Definí los servicios estandarizados de la agencia con sus precios sugeridos en ARS para cotizaciones rápidas."
      />

      <ServiceCatalogClient initialServices={servicesList} />
    </div>
  );
}
