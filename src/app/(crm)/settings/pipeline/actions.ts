'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import { createPipelineStage } from '@/lib/services/pipeline.service';

export async function createStageAction(prevState: any, formData: FormData) {
  const adminUser = await requireAuth('admin');

  const name = formData.get('name') as string;
  const displayOrderStr = formData.get('displayOrder') as string;
  const closingType = formData.get('closingType') as string;

  if (!name || !displayOrderStr) {
    return { error: 'El nombre de la etapa y el orden son obligatorios.' };
  }

  const displayOrder = parseInt(displayOrderStr, 10);
  const isTerminal = closingType === 'won' || closingType === 'lost';
  const isWon = closingType === 'won';

  try {
    const newStage = await createPipelineStage(name, displayOrder, isTerminal, isWon, adminUser);
    revalidatePath('/settings/pipeline');
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return { success: true, stage: newStage };
  } catch (err: any) {
    return { error: err.message || 'No se pudo crear la etapa del embudo.' };
  }
}
