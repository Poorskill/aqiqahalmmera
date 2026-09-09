import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/services';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    if (!name || !email || !password || !phone) {
      return NextResponse.redirect(new URL('/register?error=Semua kolom wajib diisi', request.url));
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.redirect(new URL('/register?error=Email sudah terdaftar', request.url));
    }

    const newUser = createUser({ name, email, password, phone, role: 'customer' });
    await createSession(newUser.id);

    return NextResponse.redirect(new URL('/customer/dashboard', request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(err.message || 'Terjadi kesalahan')}`, request.url));
  }
}
