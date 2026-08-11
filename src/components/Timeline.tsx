import React from 'react';
import {
  FileText,
  Phone,
  Mail,
  GitCommit,
  GitMerge,
  UploadCloud,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/normalization';

export interface ActivityItem {
  id: string;
  type: 'note' | 'call' | 'email' | 'stage_change' | 'merge' | 'import';
  content: string | null;
  metadata?: any;
  createdAt: string | Date;
  isCorrection?: boolean;
  correctionReason?: string | null;
  creator?: {
    name: string;
    email: string;
  } | null;
  corrects?: {
    content: string | null;
    creator?: { name: string } | null;
  } | null;
}

interface TimelineProps {
  activities: ActivityItem[];
  onCorrectActivity?: (activityId: string) => void;
}

export default function Timeline({ activities, onCorrectActivity }: TimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm italic">
        No hay actividades registradas aún.
      </div>
    );
  }

  const typeLabels: Record<ActivityItem['type'], string> = {
    note: 'Nota',
    call: 'Llamada',
    email: 'Correo',
    stage_change: 'Cambio de Etapa',
    merge: 'Fusión de Contactos',
    import: 'Importación CSV',
  };

  const getIcon = (type: ActivityItem['type'], isCorrection?: boolean) => {
    if (isCorrection) return <AlertCircle className="w-4 h-4 text-amber-600" />;

    switch (type) {
      case 'note':
        return <FileText className="w-4 h-4 text-[#274283]" />;
      case 'call':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-[#5CB2D4]" />;
      case 'stage_change':
        return <GitCommit className="w-4 h-4 text-[#EB7638]" />;
      case 'merge':
        return <GitMerge className="w-4 h-4 text-purple-600" />;
      case 'import':
        return <UploadCloud className="w-4 h-4 text-slate-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((item) => (
        <div key={item.id} className="relative group">
          {/* Bullet Icon */}
          <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-sm">
            {getIcon(item.type, item.isCorrection)}
          </div>

          {/* Activity Content Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {item.isCorrection ? 'Entrada de Corrección' : typeLabels[item.type] || item.type}
                </span>
                {item.creator && (
                  <span className="text-xs text-slate-500 font-medium">
                    por {item.creator.name}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {formatDate(item.createdAt)}
              </span>
            </div>

            {/* Main Content */}
            {item.content && (
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {item.content}
              </p>
            )}

            {/* Correction Callout */}
            {item.isCorrection && item.corrects && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Entrada Original:</p>
                <p className="italic font-mono text-slate-600">"{item.corrects.content}"</p>
                {item.correctionReason && (
                  <p className="mt-1 pt-1 border-t border-amber-200 text-amber-800">
                    <span className="font-semibold">Motivo:</span> {item.correctionReason}
                  </p>
                )}
              </div>
            )}

            {/* Correction Action */}
            {onCorrectActivity && !item.isCorrection && item.type !== 'stage_change' && (
              <div className="mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onCorrectActivity(item.id)}
                  className="text-xs font-semibold text-[#274283] hover:underline"
                >
                  Corregir esta entrada
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
