'use server';

import { login, logout } from '@/lib/services/auth.service';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  let redirectTo = (formData.get('redirect') as string) || '/dashboard';
  if (redirectTo === '/') {
    redirectTo = '/dashboard';
  }

  if (!email || !password) {
    return { error: 'Por favor ingresa tu correo electrónico y contraseña.' };
  }

  const result = await login(email, password);
  if (!result.success) {
    return { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  }

  redirect(redirectTo);
}

export async function logoutAction() {
  await logout();
}
