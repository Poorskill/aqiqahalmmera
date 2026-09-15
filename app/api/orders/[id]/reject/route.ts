import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rejectPostgresQuotation } from '@/lib/postgres-feedback';
import { getOrderById, rejectQuotationService } from '@/lib/services';

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
    try {
      await rejectPostgresQuotation(id);
    } catch {
      rejectQuotationService(id);
    }
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Penawaran ditolak & pesanan dibatalkan`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
