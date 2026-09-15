import { cookies } from 'next/headers';
import { getUserById, User } from './services';
import { getPostgresUserById } from './postgres-auth';

const SESSION_COOKIE_NAME = 'almeera_session';

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!userId) return null;
    let user = await getPostgresUserById(userId);
    if (!user) {
      user = getUserById(userId);
    }
    if (!user) return null;
    if (user.status && user.status !== 'active') return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Silakan login terlebih dahulu.');
  }
  if (user.status && user.status !== 'active') {
    throw new Error('Forbidden: Akun Anda dinonaktifkan.');
  }
  if (user.role === 'master_admin') {
    return user;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Role ${user.role} tidak memiliki akses ke halaman ini.`);
  }
  return user;
}
