import { requireAuth } from '@/lib/services/auth.service';
import { listTags } from '@/lib/services/tag.service';
import PageHeader from '@/components/PageHeader';
import TagBadge from '@/components/TagBadge';
import { Tag, ShieldAlert } from 'lucide-react';
import TagManagerClient from './TagManagerClient';

export default async function TagSettingsPage() {
  const user = await requireAuth();

  if (user.role === 'salesperson') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-display font-bold text-lg text-slate-800">Acceso Restringido</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          La administración del catálogo de etiquetas globales está disponible únicamente para Gerentes y Administradores.
        </p>
      </div>
    );
  }

  const tagsList = await listTags();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Catálogo de Etiquetas Globales"
        subtitle="Administrá las etiquetas corporativas para organizar Empresas y Contactos por nicho o categoría."
      />

      <TagManagerClient initialTags={tagsList} />
    </div>
  );
}
