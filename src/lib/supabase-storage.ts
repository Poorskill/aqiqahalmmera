import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error('Konfigurasi Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabaseAdmin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function uploadFile(bucket: string, path: string, file: File) {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload file gagal: ${error.message}`);
  return path;
}

export function publicFileUrl(bucket: string, path: string) {
  return supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function createSignedProofUrl(path: string, expiresInSeconds = 900) {
  const { data, error } = await supabaseAdmin.storage.from('proofs').createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) throw new Error(`Gagal membuat signed URL: ${error?.message}`);
  return data.signedUrl;
}

export function resolveFileUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('/uploads') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  return `/api/files/view?path=${encodeURIComponent(pathOrUrl)}`;
}

