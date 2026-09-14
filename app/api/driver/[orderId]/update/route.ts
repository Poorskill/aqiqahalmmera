import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateDriverStatusService, markDriverArrived, completeDeliveryService, getOrderById } from '@/lib/services';
import path from 'node:path';
import fs from 'node:fs';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  try {
    const user = await requireAuth(['driver', 'admin', 'master_admin']);
    const order = getOrderById(orderId);

    if (!order) {
      return NextResponse.redirect(new URL(`/driver/dashboard?error=${encodeURIComponent('Pesanan tidak ditemukan.')}`, request.url), { status: 303 });
    }

    const driverOrder = order.driverOrder;
    if (!driverOrder) {
      return NextResponse.redirect(new URL(`/driver/dashboard?error=${encodeURIComponent('Data pengiriman pesanan tidak ditemukan.')}`, request.url), { status: 303 });
    }

    if (user.role === 'driver' && driverOrder.driverId && driverOrder.driverId !== user.id) {
      return NextResponse.redirect(new URL(`/driver/dashboard?error=${encodeURIComponent('Akses ditolak: Pengiriman ini ditugaskan ke driver lain.')}`, request.url), { status: 303 });
    }

    const formData = await request.formData();
    const action = (formData.get('action') as string) || (formData.get('status') as string);
    const redirectTo = (formData.get('redirectTo') as string) || `/driver/orders/${orderId}`;

    if (action === 'start' || action === 'on_delivery') {
      if (driverOrder.status === 'delivered') {
        return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent('Pengiriman sudah selesai.')}`, request.url), { status: 303 });
      }
      updateDriverStatusService(orderId, 'on_delivery');
      return NextResponse.redirect(new URL(`${redirectTo}?success=${encodeURIComponent('Status diperbarui: Pengiriman sedang berjalan.')}`, request.url), { status: 303 });
    }

    if (action === 'arrived') {
      markDriverArrived(orderId, user.id);
      return NextResponse.redirect(new URL(`${redirectTo}?success=${encodeURIComponent('Berhasil menandai tiba di lokasi pengiriman.')}`, request.url), { status: 303 });
    }

    if (action === 'complete' || action === 'delivered') {
      const deliveryNote = (formData.get('deliveryNote') as string) || '';
      let deliveryProof = (formData.get('deliveryProof') as string) || '';

      const proofFile = formData.get('proofFile') as unknown as File | null;
      if (proofFile && proofFile.size > 0) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(proofFile.type)) {
          return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent('Format bukti tidak didukung (Gunakan JPG, PNG, atau WebP).')}`, request.url), { status: 303 });
        }
        if (proofFile.size > 5 * 1024 * 1024) {
          return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent('Ukuran bukti foto terlalu besar (Maksimal 5MB).')}`, request.url), { status: 303 });
        }

        const bytes = await proofFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(proofFile.name) || '.jpg';
        const mime = proofFile.type || 'image/jpeg';
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filename = `proof-delivery-${orderId}-${Date.now()}${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), buffer);
          deliveryProof = `/uploads/${filename}`;
        } catch {
          // On read-only serverless filesystem (e.g. Vercel), store as Data URL
          deliveryProof = `data:${mime};base64,${buffer.toString('base64')}`;
        }
      }

      if (!deliveryProof) {
        return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent('Bukti foto pengiriman wajib dilampirkan.')}`, request.url), { status: 303 });
      }

      completeDeliveryService(orderId, user.id, {
        deliveryProof,
        deliveryNote,
      });

      return NextResponse.redirect(new URL(`${redirectTo}?success=${encodeURIComponent('Pengiriman berhasil diselesaikan dan bukti telah tersimpan.')}`, request.url), { status: 303 });
    }

    return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent('Aksi tidak dikenali.')}`, request.url), { status: 303 });
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/driver/orders/${orderId}?error=${encodeURIComponent(err.message || 'Gagal memproses pembaruan pengiriman.')}`, request.url), { status: 303 });
  }
}
