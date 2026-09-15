import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deletePostgresOrder } from '@/lib/postgres-orders';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  let redirectTo = `/admin/orders`;
  const accept = request.headers.get('accept') || '';
  const isJson = accept.includes('application/json');

  try {
    const user = await requireAuth(['master_admin']);
    if (user.role !== 'master_admin') {
      if (isJson) {
        return NextResponse.json({ success: false, error: 'Akses ditolak: Hanya Master Admin yang diizinkan menghapus pesanan.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL(`/customer/orders/${orderId}?error=${encodeURIComponent('Akses ditolak: Hanya Master Admin yang diizinkan menghapus pesanan.')}`, request.url), { status: 303 });
    }

    let confirmation = '';
    let reason = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      confirmation = body.confirmation || '';
      reason = body.reason || '';
      redirectTo = body.redirectTo || redirectTo;
    } else {
      const formData = await request.formData();
      confirmation = (formData.get('confirmation') as string) || '';
      reason = (formData.get('reason') as string) || '';
      redirectTo = (formData.get('redirectTo') as string) || redirectTo;
    }

    await deletePostgresOrder(orderId, user.id, confirmation, reason);

    if (isJson) {
      return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus.' });
    }

    return NextResponse.redirect(new URL(`${redirectTo}?success=${encodeURIComponent('Pesanan berhasil dihapus.')}`, request.url), { status: 303 });
  } catch (err: any) {
    if (isJson) {
      return NextResponse.json({ success: false, error: err.message || 'Gagal menghapus pesanan.' }, { status: 400 });
    }
    return NextResponse.redirect(new URL(`/customer/orders/${orderId}?error=${encodeURIComponent(err.message || 'Gagal menghapus pesanan.')}`, request.url), { status: 303 });
  }
}
