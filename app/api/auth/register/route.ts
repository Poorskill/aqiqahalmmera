import { NextResponse } from 'next/server';
import { createPostgresUser, getPostgresUserByEmail } from '@/lib/postgres-auth';
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

    const existing = await getPostgresUserByEmail(email);
    if (existing) {
      return NextResponse.redirect(new URL('/register?error=Email sudah terdaftar', request.url));
    }

    const newUser = await createPostgresUser({ name, email, password, phone, role: 'customer' });
    if (!newUser) throw new Error('Gagal mendaftarkan pengguna ke PostgreSQL.');
    await createSession(newUser.id);

    return NextResponse.redirect(new URL('/customer/dashboard', request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(err.message || 'Terjadi kesalahan')}`, request.url));
  }
}
