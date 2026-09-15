import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresDapur } from '@/lib/postgres-operational';
import { updateDapurStatusService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAuth(['dapur', 'admin']);
    const { orderId } = await params;
    const formData = await request.formData();
    const kitchenStatus = formData.get('kitchenStatus') as string;
    const notes = formData.get('notes') as string;

    try {
      await updatePostgresDapur(orderId, kitchenStatus, notes);
    } catch {
      updateDapurStatusService(orderId, kitchenStatus, notes);
    }
    return NextResponse.redirect(new URL(`/dapur/orders/${orderId}?success=Status dapur berhasil diperbarui`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/dapur/dashboard?error=Gagal update status dapur`, request.url));
  }
}
