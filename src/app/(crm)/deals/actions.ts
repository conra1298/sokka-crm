'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import { createDeal, updateDeal, moveDealStage, archiveDeal } from '@/lib/services/deal.service';

export async function createDealAction(prevState: any, formData: FormData) {
  const user = await requireAuth();

  const title = formData.get('title') as string;
  const value = formData.get('value') ? parseFloat(formData.get('value') as string) : undefined;
  const monthlyValue = formData.get('monthlyValue') ? parseFloat(formData.get('monthlyValue') as string) : undefined;
  const dealType = (formData.get('dealType') as 'project' | 'retainer') || 'project';
  const leadSource = formData.get('leadSource') as string;
  const stageId = formData.get('stageId') as string;
  const companyId = formData.get('companyId') as string;
  const contactId = formData.get('contactId') as string;
  const ownerId = formData.get('ownerId') as string;
  const expectedCloseDate = formData.get('expectedCloseDate') as string;

  if (!title || !stageId) {
    return { error: 'El título y la etapa del embudo son obligatorios.' };
  }

  try {
    const newDeal = await createDeal(
      {
        title,
        value,
        monthlyValue,
        dealType,
        leadSource,
        currency: 'ARS',
        stageId,
        companyId,
        contactId,
        ownerId,
        expectedCloseDate,
      },
      user
    );

    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return { success: true, deal: newDeal };
  } catch (err: any) {
    return { error: err.message || 'Error al crear la oportunidad.' };
  }
}

export async function updateDealAction(prevState: any, formData: FormData) {
  const user = await requireAuth();
  const id = formData.get('id') as string;
  if (!id) return { error: 'Oportunidad no encontrada' };

  try {
    const data: Record<string, any> = {};
    if (formData.has('briefNotes')) data.briefNotes = formData.get('briefNotes') as string;
    if (formData.has('title')) data.title = formData.get('title') as string;
    if (formData.has('value')) data.value = parseFloat(formData.get('value') as string);
    if (formData.has('monthlyValue')) data.monthlyValue = parseFloat(formData.get('monthlyValue') as string);
    if (formData.has('dealType')) data.dealType = formData.get('dealType') as string;
    if (formData.has('leadSource')) data.leadSource = formData.get('leadSource') as string;

    const updated = await updateDeal(id, data, user);
    revalidatePath(`/deals/${id}`);
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return { success: true, deal: updated };
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar la oportunidad.' };
  }
}

export async function moveDealStageAction(dealId: string, newStageId: string) {
  const user = await requireAuth();
  try {
    const updated = await moveDealStage(dealId, newStageId, user);
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    revalidatePath(`/deals/${dealId}`);
    return { success: true, deal: updated };
  } catch (err: any) {
    return { error: err.message || 'Failed to move deal stage.' };
  }
}

export async function archiveDealAction(dealId: string) {
  const user = await requireAuth();
  try {
    await archiveDeal(dealId, user);
    revalidatePath('/deals');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to archive deal.' };
  }
}
