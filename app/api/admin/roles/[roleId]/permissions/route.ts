import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresRolePermissions } from '@/lib/postgres-rbac';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const adminUser = await requireAuth(['master_admin']);
    const { roleId } = await params;
    const formData = await request.formData();
    const permissions = formData.getAll('permissions') as string[];

    await updatePostgresRolePermissions(roleId, permissions, adminUser.id);

    return NextResponse.redirect(
      new URL(`/admin/access-management/${roleId}?success=Hak akses role berhasil diperbarui`, request.url)
    );
  } catch (err: any) {
    const { roleId } = await params;
    return NextResponse.redirect(
      new URL(`/admin/access-management/${roleId}?error=${encodeURIComponent(err.message || 'Gagal memperbarui permissions')}`, request.url)
    );
  }
}
