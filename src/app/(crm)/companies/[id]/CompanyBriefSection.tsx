'use client';

import BriefEditor from '@/components/BriefEditor';
import { updateCompanyAction } from '../actions';

interface CompanyBriefSectionProps {
  companyId: string;
  initialBriefNotes: string | null;
}

export default function CompanyBriefSection({ companyId, initialBriefNotes }: CompanyBriefSectionProps) {
  const handleSave = async (notes: string) => {
    const formData = new FormData();
    formData.append('briefNotes', notes);
    const res = await updateCompanyAction(companyId, formData);
    if (res.error) return { error: res.error };
    return { success: true };
  };

  return <BriefEditor initialValue={initialBriefNotes} onSave={handleSave} title="Brief del Cliente / Necesidades del Negocio" />;
}
