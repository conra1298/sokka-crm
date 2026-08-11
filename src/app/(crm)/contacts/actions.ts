'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/services/auth.service';
import { createContact, updateContact, archiveContact } from '@/lib/services/contact.service';

export async function createContactAction(prevState: any, formData: FormData) {
  const user = await requireAuth();

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const jobTitle = formData.get('jobTitle') as string;
  const leadSource = formData.get('leadSource') as string;
  const companyId = formData.get('companyId') as string;
  const ownerId = formData.get('ownerId') as string;

  if (!firstName || !lastName || !email) {
    return { error: 'Nombre, Apellido y Email son obligatorios.' };
  }

  try {
    const result = await createContact(
      {
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        leadSource,
        companyId,
        ownerId,
      },
      user
    );

    revalidatePath('/contacts');
    return {
      success: true,
      contact: result.contact,
      duplicatesFound: result.duplicatesFound,
      duplicateMatches: result.duplicateMatches,
    };
  } catch (err: any) {
    return { error: err.message || 'Error al crear contacto.' };
  }
}

export async function updateContactAction(prevState: any, formData: FormData) {
  const user = await requireAuth();
  const id = formData.get('id') as string;

  if (!id) return { error: 'Missing contact ID' };

  try {
    await updateContact(
      id,
      {
        firstName: (formData.get('firstName') as string) || undefined,
        lastName: (formData.get('lastName') as string) || undefined,
        email: (formData.get('email') as string) || undefined,
        phone: (formData.get('phone') as string) || undefined,
        jobTitle: (formData.get('jobTitle') as string) || undefined,
        leadSource: (formData.get('leadSource') as string) || undefined,
        companyId: (formData.get('companyId') as string) || undefined,
        ownerId: (formData.get('ownerId') as string) || undefined,
      },
      user
    );

    revalidatePath('/contacts');
    revalidatePath(`/contacts/${id}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update contact.' };
  }
}

export async function archiveContactAction(id: string) {
  const user = await requireAuth();
  try {
    await archiveContact(id, user);
    revalidatePath('/contacts');
    redirect('/contacts');
  } catch (err: any) {
    return { error: err.message || 'Failed to archive contact.' };
  }
}
