'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Phone, Mail } from 'lucide-react';
import FileUploadUploader from './FileUploadUploader';

interface ActivityComposerProps {
  contactId?: string;
  dealId?: string;
  companyId?: string;
}

export default function ActivityComposer({ contactId, dealId, companyId }: ActivityComposerProps) {
  const router = useRouter();
  const [type, setType] = useState<'note' | 'call' | 'email'>('note');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content,
          contactId,
          dealId,
          companyId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al registrar actividad');
      }

      setContent('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Activity Type Selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('note')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            type === 'note'
              ? 'bg-[#274283] text-white border-transparent'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Nota</span>
        </button>
        <button
          type="button"
          onClick={() => setType('call')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            type === 'call'
              ? 'bg-emerald-600 text-white border-transparent'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Registrar Llamada</span>
        </button>
        <button
          type="button"
          onClick={() => setType('email')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
            type === 'email'
              ? 'bg-[#5CB2D4] text-[#0f172a] border-transparent'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Resumen de Correo</span>
        </button>
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      <textarea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe los detalles de la actividad aquí..."
        required
        className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]"
      />

      {/* Attachment Uploader */}
      <FileUploadUploader
        folderPath={dealId ? `deals/${dealId}` : companyId ? `companies/${companyId}` : `contacts/${contactId}`}
        onUploadSuccess={(file) => {
          const attachmentLink = `\n📌 Adjunto: [${file.name}](${file.url})`;
          setContent((prev) => prev + attachmentLink);
        }}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn-primary py-2 px-5 text-xs shadow-sm"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar Actividad'}
        </button>
      </div>
    </form>
  );
}
