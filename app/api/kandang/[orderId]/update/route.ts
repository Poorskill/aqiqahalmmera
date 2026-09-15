import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresKandang } from '@/lib/postgres-operational';
import { updateKandangStatusService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  let redirectTo = `/kandang/orders/${orderId}`;
  try {
    await requireAuth(['kandang', 'admin', 'master_admin']);
    const formData = await request.formData();
    const prepStatus = formData.get('prepStatus') as string;
    const notes = formData.get('notes') as string;
    redirectTo = (formData.get('redirectTo') as string) || redirectTo;

    try {
      await updatePostgresKandang(orderId, prepStatus, notes);
    } catch (pgErr) {
      try {
        updateKandangStatusService(orderId, prepStatus, notes);
      } catch {
        throw pgErr;
      }
    }

    return NextResponse.redirect(new URL(`${redirectTo}?success=${encodeURIComponent('Status kandang berhasil diperbarui')}`, request.url), 303);
  } catch (err: any) {
    return NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent(err.message || 'Gagal update status kandang')}`, request.url), 303);
  }
}
