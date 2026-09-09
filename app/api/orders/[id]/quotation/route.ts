import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createQuotationService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(['admin']);
    const { id } = await params;
    const formData = await request.formData();
    const price = parseFloat(formData.get('price') as string);
    const note = formData.get('note') as string;

    if (!price || isNaN(price)) {
      return NextResponse.redirect(new URL(`/customer/orders/${id}?error=Harga quotation wajib diisi dengan angka valid`, request.url));
    }

    createQuotationService(id, user.id, price, note || '');
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Penawaran harga berhasil dikirim ke customer`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
