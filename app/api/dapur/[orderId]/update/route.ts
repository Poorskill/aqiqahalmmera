import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresDapur } from '@/lib/postgres-operational';
import { updateDapurStatusService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  let redirectTo = `/dapur/orders/${orderId}`;
  try {
    await requireAuth(['dapur', 'admin', 'master_admin']);
    const formData = await request.formData();
    const kitchenStatus = formData.get('kitchenStatus') as string;
    const notes = formData.get('notes') as string;
    redirectTo = (formData.get('redirectTo') as string) || redirectTo;

    try {
      await updatePostgresDapur(orderId, kitchenStatus, notes);
    } catch (pgErr) {
      try {
        updateDapurStatusService(orderId, kitchenStatus, notes);
      } catch {
        throw pgErr;
      }
    }

    return NextResponse.redirect(new URL(`${redirectTo}?success=${encodeURIComponent('Status dapur berhasil diperbarui')}`, request.url), 303);
  } catch (err: any) {
    return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent(err.message || 'Gagal update status dapur')}`, request.url), 303);
  }
}
