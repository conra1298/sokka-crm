'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { moveDealStageAction } from '../actions';
import { AlertCircle } from 'lucide-react';

interface StageSelectFormProps {
  dealId: string;
  currentStageId: string;
  stages: Array<{ id: string; name: string }>;
  userRole: string;
}

export default function StageSelectForm({
  dealId,
  currentStageId,
  stages,
  userRole,
}: StageSelectFormProps) {
  const router = useRouter();
  const [selectedStageId, setSelectedStageId] = useState(currentStageId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStageId = e.target.value;
    setSelectedStageId(newStageId);
    setIsSubmitting(true);
    setError('');

    const result = await moveDealStageAction(dealId, newStageId);

    if (!result.success) {
      setError(result.error || 'Error al cambiar la etapa de la oportunidad.');
      setSelectedStageId(currentStageId);
    } else {
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <select
        value={selectedStageId}
        onChange={handleChange}
        disabled={isSubmitting}
        className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5CB2D4] bg-white text-slate-800"
      >
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
