import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresDapur } from '@/lib/postgres-operational';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAuth(['dapur', 'admin']);
    const { orderId } = await params;
    const formData = await request.formData();
    const kitchenStatus = formData.get('kitchenStatus') as string;
    const notes = formData.get('notes') as string;

    await updatePostgresDapur(orderId, kitchenStatus, notes);
    return NextResponse.redirect(new URL(`/dapur/orders/${orderId}?success=Status dapur berhasil diperbarui`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/dapur/dashboard?error=${encodeURIComponent(err.message || 'Gagal update status dapur')}`, request.url));
  }
}
