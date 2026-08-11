'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/services/auth.service';
import { createCompany, updateCompany, archiveCompany } from '@/lib/services/company.service';

export async function createCompanyAction(prevState: any, formData: FormData) {
  const user = await requireAuth();

  const name = formData.get('name') as string;
  const domain = formData.get('domain') as string;
  const industry = formData.get('industry') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const website = formData.get('website') as string;
  const linkedinUrl = formData.get('linkedinUrl') as string;
  const instagramUrl = formData.get('instagramUrl') as string;
  const facebookUrl = formData.get('facebookUrl') as string;
  const tiktokUrl = formData.get('tiktokUrl') as string;
  const clientStatus = formData.get('clientStatus') as string;
  const ownerId = formData.get('ownerId') as string;

  if (!name) return { error: 'El nombre de la empresa es obligatorio.' };

  try {
    const newCompany = await createCompany(
      {
        name,
        domain,
        industry,
        phone,
        address,
        website,
        linkedinUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        clientStatus: clientStatus || 'prospect',
        ownerId: ownerId || undefined,
      },
      user
    );

    revalidatePath('/companies');
    return { success: true, company: newCompany };
  } catch (err: any) {
    return { error: err.message || 'Error al crear la empresa.' };
  }
}

export async function updateCompanyAction(id: string, formData: FormData) {
  const user = await requireAuth();
  try {
    const data: Record<string, any> = {};
    if (formData.has('clientStatus')) data.clientStatus = formData.get('clientStatus') as string;
    if (formData.has('briefNotes')) data.briefNotes = formData.get('briefNotes') as string;
    if (formData.has('name')) data.name = formData.get('name') as string;

    const updated = await updateCompany(id, data, user);
    revalidatePath(`/companies/${id}`);
    revalidatePath('/companies');
    return { success: true, company: updated };
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar la empresa.' };
  }
}
