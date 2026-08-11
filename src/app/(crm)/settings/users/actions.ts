'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, createUser, UserRole } from '@/lib/services/auth.service';

export async function createUserAction(prevState: any, formData: FormData) {
  const adminUser = await requireAuth('admin');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as UserRole;

  if (!name || !email || !password || !role) {
    return { error: 'Todos los campos marcados con * son obligatorios.' };
  }

  try {
    const newUser = await createUser({ name, email, password, role }, adminUser);
    revalidatePath('/settings/users');
    return { success: true, user: newUser };
  } catch (err: any) {
    return { error: err.message || 'No se pudo crear el usuario.' };
  }
}
