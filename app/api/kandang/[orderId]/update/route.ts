import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updatePostgresKandang } from '@/lib/postgres-operational';
import { updateKandangStatusService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAuth(['kandang', 'admin']);
    const { orderId } = await params;
    const formData = await request.formData();
    const prepStatus = formData.get('prepStatus') as string;
    const notes = formData.get('notes') as string;

    try {
      await updatePostgresKandang(orderId, prepStatus, notes);
    } catch {
      updateKandangStatusService(orderId, prepStatus, notes);
    }
    return NextResponse.redirect(new URL(`/kandang/orders/${orderId}?success=Status kandang berhasil diperbarui`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/kandang/dashboard?error=Gagal update status kandang`, request.url));
  }
}
