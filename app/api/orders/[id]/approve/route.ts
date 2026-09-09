import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { approveQuotationService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(['customer', 'admin']);
    const { id } = await params;
    approveQuotationService(id);
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Penawaran berhasil disetujui & didistribusikan`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
