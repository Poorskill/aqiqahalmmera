import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createPostgresReview } from '@/lib/postgres-feedback';
import { createReviewService, getOrderById } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(['customer']);
    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      throw new Error('Pesanan tidak ditemukan');
    }
    if (order.customerId !== user.id) {
      throw new Error('Akses ditolak: Pesanan ini bukan milik Anda');
    }
    const formData = await request.formData();
    const rating = parseInt(formData.get('rating') as string || '5');
    const comment = formData.get('comment') as string;

    if (!comment) {
      return NextResponse.redirect(new URL(`/customer/orders/${id}?error=Komentar ulasan wajib diisi`, request.url));
    }

    try {
      await createPostgresReview(id, user.id, rating, comment);
    } catch {
      createReviewService(id, user.id, rating, comment);
    }
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Ulasan berhasil dikirim. Terima kasih!`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
