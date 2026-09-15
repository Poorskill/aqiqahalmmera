import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createOfflineManualPayment } from '@/lib/postgres-mutations';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireAuth(['admin', 'master_admin']);
    const { orderId } = await params;
    const formData = await request.formData();
    await createOfflineManualPayment(orderId, user.id, {
      paymentType: String(formData.get('paymentType') || ''),
      amount: Number(formData.get('amount')),
      paymentDate: String(formData.get('paymentDate') || new Date().toISOString()),
      paymentMethod: 'OFFLINE',
      notes: String(formData.get('notes') || ''),
    });
    return NextResponse.redirect(new URL(`/customer/orders/${orderId}?success=Pembayaran offline berhasil dicatat`, request.url), { status: 303 });
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${(await params).orderId}?error=${encodeURIComponent(err.message || 'Gagal mencatat pembayaran offline')}`, request.url), { status: 303 });
  }
}
