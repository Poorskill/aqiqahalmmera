import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteStaffService } from '@/lib/services';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAuth(['master_admin']);
    const { id } = await params;

    deleteStaffService(id, adminUser.id);

    return NextResponse.redirect(new URL('/admin/staff?success=Staff berhasil dihapus dari sistem', request.url));
  } catch (err: any) {
    const { id } = await params;
    return NextResponse.redirect(new URL(`/admin/staff/${id}?error=${encodeURIComponent(err.message || 'Gagal menghapus staff')}`, request.url));
  }
}
