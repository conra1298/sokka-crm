import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureDatabaseReady } from '@/db/auto-seed';

const COOKIE_NAME = 'sokka_crm_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'sokka_crm_super_secret_session_key_2026_change_in_production_32_bytes_min'
);

export type UserRole = 'admin' | 'manager' | 'salesperson';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(requiredRole?: UserRole | UserRole[]): Promise<SessionUser> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect('/login');
  }

  // Ensure user still exists in DB (handling stale session tokens after database re-seed)
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
  });

  let validUser = sessionUser;

  if (!dbUser) {
    // Attempt fallback match by email if DB was re-seeded
    const emailUser = await db.query.users.findFirst({
      where: eq(users.email, sessionUser.email),
    });
    if (emailUser) {
      validUser = {
        id: emailUser.id,
        email: emailUser.email,
        name: emailUser.name,
        role: emailUser.role as UserRole,
      };
    } else {
      redirect('/login');
    }
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(validUser.role)) {
      throw new Error(`Forbidden: Role '${validUser.role}' is not authorized for this action.`);
    }
  }

  return validUser;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  await ensureDatabaseReady();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!user || !user.isActive) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password' };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  await setSessionCookie(sessionUser);
  return { success: true, user: sessionUser };
}

export async function createUser(
  input: { email: string; name: string; password: string; role: UserRole },
  adminUser: SessionUser
) {
  if (adminUser.role !== 'admin') {
    throw new Error('Forbidden: Solo los administradores pueden crear usuarios.');
  }

  const emailNorm = input.email.trim().toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, emailNorm),
  });

  if (existing) {
    throw new Error('El correo electrónico ya se encuentra registrado.');
  }

  const passwordHash = await hashPassword(input.password);
  const [newUser] = await db
    .insert(users)
    .values({
      email: emailNorm,
      name: input.name.trim(),
      passwordHash,
      role: input.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();

  return newUser;
}

export async function logout() {
  await clearSessionCookie();
  redirect('/login');
}
