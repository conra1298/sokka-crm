'use client';

import BriefEditor from '@/components/BriefEditor';
import { updateDealAction } from '../actions';

interface DealBriefSectionProps {
  dealId: string;
  initialBriefNotes: string | null;
}

export default function DealBriefSection({ dealId, initialBriefNotes }: DealBriefSectionProps) {
  const handleSave = async (notes: string) => {
    const formData = new FormData();
    formData.append('id', dealId);
    formData.append('briefNotes', notes);
    const res = await updateDealAction(null, formData);
    if (res?.error) return { error: res.error };
    return { success: true };
  };

  return <BriefEditor initialValue={initialBriefNotes} onSave={handleSave} title="Brief de la Oportunidad / Alcance del Servicio" />;
}
