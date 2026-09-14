import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { approveQuotationService, getOrderById } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(['customer', 'admin', 'master_admin']);
    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      throw new Error('Pesanan tidak ditemukan');
    }
    if (user.role === 'customer' && order.customerId !== user.id) {
      throw new Error('Akses ditolak: Pesanan ini bukan milik Anda');
    }

    approveQuotationService(id);
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Penawaran berhasil disetujui & didistribusikan`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
