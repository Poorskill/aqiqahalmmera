import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSignedProofUrl } from '@/lib/supabase-storage';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path tidak ditemukan' }, { status: 400 });
    }

    const signedUrl = await createSignedProofUrl(filePath);
    return NextResponse.redirect(signedUrl, 307);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memuat file' }, { status: 403 });
  }
}
