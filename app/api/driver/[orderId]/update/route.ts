import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateDriverStatusService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAuth(['driver', 'admin']);
    const { orderId } = await params;
    const formData = await request.formData();
    const status = formData.get('status') as string;

    updateDriverStatusService(orderId, status);
    return NextResponse.redirect(new URL('/driver/dashboard', request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL('/driver/dashboard?error=Gagal update status pengantaran', request.url));
  }
}
