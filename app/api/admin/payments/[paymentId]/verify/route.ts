import { requireAuth } from '@/lib/auth';
import { verifyPostgresPayment } from '@/lib/postgres-mutations';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const user = await requireAuth(['admin', 'master_admin']);
    const { paymentId } = await params;
    const formData = await request.formData();
    const action = formData.get('action') as 'verify' | 'reject';
    const rejectionReason = formData.get('rejectionReason') as string;

    await verifyPostgresPayment(paymentId, user.id, action, rejectionReason);

    return NextResponse.redirect(new URL(`/admin/payments?success=Pembayaran berhasil ${action === 'verify' ? 'diverifikasi' : 'ditolak'}.`, request.url), { status: 303 });
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/admin/payments?error=${encodeURIComponent(err.message || 'Gagal memproses verifikasi pembayaran.')}`, request.url), { status: 303 });
  }
}
