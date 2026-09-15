import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresUserPermissionOverride } from '@/lib/postgres-rbac';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAuth(['master_admin']);
    const { id } = await params;
    const formData = await request.formData();
    const permissionKey = formData.get('permissionKey') as string;
    const effect = formData.get('effect') as 'allow' | 'deny' | 'default';

    await updatePostgresUserPermissionOverride(id, permissionKey, effect === 'default' ? 'none' : effect, adminUser.id);

    return NextResponse.redirect(new URL(`/admin/staff/${id}?success=Override permission berhasil disimpan`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/admin/staff/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
