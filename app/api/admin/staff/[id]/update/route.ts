import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateUserRoleAndStatus } from '@/lib/services';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAuth(['master_admin']);
    const { id } = await params;
    const formData = await request.formData();
    const role = formData.get('role') as string;
    const status = formData.get('status') as string;

    updateUserRoleAndStatus(id, role, status || 'active', adminUser.id);

    return NextResponse.redirect(new URL(`/admin/staff/${id}?success=Status & role staff berhasil diperbarui`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/admin/staff/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
