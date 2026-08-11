import Link from 'next/link';
import { requireAuth } from '@/lib/services/auth.service';
import { getPipelineStages } from '@/lib/services/pipeline.service';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import StageCreateModal from './StageCreateModal';
import { Sliders, CheckCircle2, XCircle, Plus } from 'lucide-react';

export default async function PipelineSettingsPage(props: {
  searchParams?: Promise<{ action?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await requireAuth('admin');
  const stages = await getPipelineStages();
  const showCreateModal = searchParams?.action === 'new';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Configuración de Etapas del Embudo"
        subtitle="Administra los nombres, el orden visual y el comportamiento de cierre (Ganada / Perdida) de las etapas comerciales."
      >
        <Link href="/settings/pipeline?action=new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Nueva Etapa</span>
        </Link>
      </PageHeader>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#274283]" />
            <span>Etapas Activas del Embudo</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{stages.length} etapas configuradas</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/70 border-b text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="p-4 pl-6">Orden</th>
              <th className="p-4">Nombre de la Etapa</th>
              <th className="p-4 text-center">Tipo de Cierre</th>
              <th className="p-4 text-center font-mono">ID de Sistema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stages.map((stage: any) => (
              <tr key={stage.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-mono font-bold text-[#274283]">#{stage.displayOrder}</td>
                <td className="p-4 font-semibold text-slate-900">{stage.name}</td>
                <td className="p-4 text-center">
                  {stage.isWon ? (
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Cerrada Ganada</span>
                    </Badge>
                  ) : stage.isTerminal ? (
                    <Badge variant="slate">
                      <XCircle className="w-3 h-3" />
                      <span>Cerrada Perdida</span>
                    </Badge>
                  ) : (
                    <Badge variant="secondary">En Progreso</Badge>
                  )}
                </td>
                <td className="p-4 text-center font-mono text-xs text-slate-400">{stage.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && <StageCreateModal defaultOrder={stages.length + 1} />}
    </div>
  );
}
