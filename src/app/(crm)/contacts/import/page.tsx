import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import PageHeader from '@/components/PageHeader';
import { FileSpreadsheet, ArrowLeft, UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';
import ImportWizard from './ImportWizard';

export default async function ImportContactsPage() {
  const user = await requireAuth('admin');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#274283] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Contactos</span>
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title="Importación Masiva de Contactos y Empresas desde CSV"
        subtitle="Importa contactos y empresas masivamente con mapeo automático de columnas y detección de registros duplicados."
      />

      <ImportWizard />
    </div>
  );
}
