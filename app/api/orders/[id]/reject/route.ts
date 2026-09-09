import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rejectQuotationService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(['customer', 'admin']);
    const { id } = await params;
    rejectQuotationService(id);
    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=Penawaran ditolak & pesanan dibatalkan`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/${await params.then(p => p.id)}?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
