import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createPostgresUser, getPostgresUserByEmail } from '@/lib/postgres-auth';
import { queryPostgres } from '@/lib/postgres';

export async function POST(request: Request) {
  try {
    const adminUser = await requireAuth(['master_admin']);
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !phone || !role) {
      throw new Error('Semua kolom wajib diisi.');
    }

    const existing = await getPostgresUserByEmail(email);
    if (existing) {
      throw new Error('Email tersebut sudah terdaftar di dalam sistem.');
    }

    if (role === 'customer' || role === 'master_admin') {
      throw new Error('Role tidak valid untuk pendaftaran staff.');
    }

    const newStaff = await createPostgresUser({
      name,
      email,
      password,
      phone,
      role,
    });

    if (!newStaff) throw new Error('Gagal membuat akun staff.');
    await queryPostgres(
      `INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, new_value, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`aud-${crypto.randomUUID()}`, adminUser.id, 'CREATE_STAFF', 'users', newStaff.id, `name:${name}, email:${email}, role:${role}`, new Date()],
    );

    return NextResponse.redirect(new URL('/admin/staff?success=Staff baru berhasil ditambahkan', request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/admin/staff/new?error=${encodeURIComponent(err.message || 'Gagal menambahkan staff')}`, request.url));
  }
}
