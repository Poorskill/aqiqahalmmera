import { requireAuth } from '@/lib/auth';
import { createPaymentService } from '@/lib/services';
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  try {
    const user = await requireAuth(['customer']);
    const formData = await request.formData();

    const paymentType = formData.get('paymentType') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const paymentMethod = formData.get('paymentMethod') as string;
    const paymentDate = formData.get('paymentDate') as string;
    const notes = formData.get('notes') as string;
    let proof = formData.get('proof') as string;

    const proofFile = formData.get('proofFile') as unknown as File | null;
    if (proofFile && proofFile.size > 0) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(proofFile.type)) {
        return NextResponse.redirect(new URL(`/customer/orders/${orderId}?error=Format bukti tidak didukung (Gunakan JPG, PNG, WebP).`, request.url), { status: 303 });
      }
      if (proofFile.size > 5 * 1024 * 1024) {
        return NextResponse.redirect(new URL(`/customer/orders/${orderId}?error=Ukuran bukti terlalu besar (Maks 5MB).`, request.url), { status: 303 });
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
        const filename = `pay-${orderId}-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        proof = `/uploads/${filename}`;
      } catch {
        proof = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    }

    if (!paymentType || isNaN(amount) || !paymentMethod || !paymentDate) {
      return NextResponse.redirect(new URL(`/customer/orders/${orderId}?error=Mohon lengkapi data pembayaran secara benar.`, request.url), { status: 303 });
    }

    createPaymentService(orderId, user.id, {
      paymentType,
      amount,
      paymentMethod,
      paymentDate,
      proof: proof || '',
      notes: notes || '',
    });

    return NextResponse.redirect(new URL(`/customer/orders/${orderId}?success=Bukti pembayaran berhasil dikirim dan menunggu verifikasi admin.`, request.url), { status: 303 });
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${orderId}?error=${encodeURIComponent(err.message || 'Gagal mengirim pembayaran.')}`, request.url), { status: 303 });
  }
}
