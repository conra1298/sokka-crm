'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import {
  listTags,
  createTag,
  deleteTag,
  setContactTags,
  setCompanyTags,
} from '@/lib/services/tag.service';

export async function createTagAction(name: string, color?: string) {
  const user = await requireAuth();
  try {
    const tag = await createTag({ name, color }, user);
    revalidatePath('/contacts');
    revalidatePath('/companies');
    revalidatePath('/settings/tags');
    return { success: true, tag };
  } catch (err: any) {
    return { error: err.message || 'Error al crear la etiqueta.' };
  }
}

export async function deleteTagAction(id: string) {
  const user = await requireAuth();
  try {
    await deleteTag(id, user);
    revalidatePath('/contacts');
    revalidatePath('/companies');
    revalidatePath('/settings/tags');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al eliminar la etiqueta.' };
  }
}

export async function updateContactTagsAction(contactId: string, tagIds: string[]) {
  await requireAuth();
  try {
    await setContactTags(contactId, tagIds);
    revalidatePath(`/contacts/${contactId}`);
    revalidatePath('/contacts');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar etiquetas del contacto.' };
  }
}

export async function updateCompanyTagsAction(companyId: string, tagIds: string[]) {
  await requireAuth();
  try {
    await setCompanyTags(companyId, tagIds);
    revalidatePath(`/companies/${companyId}`);
    revalidatePath('/companies');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar etiquetas de la empresa.' };
  }
}
