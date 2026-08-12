'use client';

import { useState } from 'react';
import { FileText, Save, Check } from 'lucide-react';

interface BriefEditorProps {
  initialValue: string | null;
  onSave: (notes: string) => Promise<{ success?: boolean; error?: string }>;
  title?: string;
}

export default function BriefEditor({
  initialValue,
  onSave,
  title = 'Brief del Cliente / Observaciones',
}: BriefEditorProps) {
  const [brief, setBrief] = useState(initialValue || '');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    const res = await onSave(brief);
    setIsSaving(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#274283]" />
          <h3 className="font-display font-bold text-base text-slate-800">{title}</h3>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            justSaved
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-[#274283] hover:bg-[#1f3468] text-white shadow-xs'
          }`}
        >
          {justSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Guardado</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Brief'}</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        onBlur={handleSave}
        placeholder="Escribí aquí el brief, necesidades clave del cliente, competidores, presupuesto aproximado, expectativas u observaciones..."
        className="w-full h-36 p-3.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] focus:bg-white transition-all resize-y leading-relaxed break-words"
      />
    </div>
  );
}
