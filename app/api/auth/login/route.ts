import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/services';
import { createSession } from '@/lib/auth';
import { verifyPassword } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return NextResponse.redirect(new URL('/login?error=Email dan password wajib diisi', request.url));
    }

    const user = getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.redirect(new URL('/login?error=Email atau password salah', request.url));
    }

    if (user.status && user.status !== 'active') {
      return NextResponse.redirect(new URL('/login?error=Akun Anda dinonaktifkan. Hubungi Master Admin.', request.url));
    }

    await createSession(user.id);

    // Redirect based on role
    let redirectUrl = '/customer/dashboard';
    if (user.role === 'master_admin' || user.role === 'admin') redirectUrl = '/admin/dashboard';
    else if (user.role === 'kandang') redirectUrl = '/kandang/dashboard';
    else if (user.role === 'dapur') redirectUrl = '/dapur/dashboard';
    else if (user.role === 'driver') redirectUrl = '/driver/dashboard';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message || 'Terjadi kesalahan')}`, request.url));
  }
}
