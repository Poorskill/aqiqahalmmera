import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createPostgresQuotation } from '@/lib/postgres-operational';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(['admin', 'master_admin']);
    const { id } = await params;
    const formData = await request.formData();
    const price = parseFloat(formData.get('price') as string);
    const note = formData.get('note') as string;
    const pesanKandang = formData.get('pesanKandang') as string;
    const pesanDapurA = formData.get('pesanDapurA') as string;
    const pesanDapurR = formData.get('pesanDapurR') as string;
    const pesanDriver = formData.get('pesanDriver') as string;
    const uangSakuDriver = parseFloat(formData.get('uangSakuDriver') as string) || 0;

    if (!price || isNaN(price)) {
      return NextResponse.redirect(new URL(`/customer/orders/${id}?error=Harga quotation wajib diisi dengan angka valid`, request.url));
    }

    await createPostgresQuotation(id, user.id, price, note || '', {
      pesanKandang: pesanKandang || '',
      pesanDapurA: pesanDapurA || '',
      pesanDapurR: pesanDapurR || '',
      pesanDriver: pesanDriver || '',
      uangSakuDriver,
    });
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Penawaran harga berhasil dikirim ke customer`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
