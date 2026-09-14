import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateCustomerProfileService } from '@/lib/services';
import fs from 'node:fs';
import path from 'node:path';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['customer']);
    const formData = await request.formData();
    const acceptHeader = request.headers.get('accept') || '';
    const isJsonRequest = acceptHeader.includes('application/json') || request.headers.get('x-requested-with') === 'XMLHttpRequest';

    const name = (formData.get('name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const province = (formData.get('province') as string)?.trim();
    const city = (formData.get('city') as string)?.trim();
    const district = (formData.get('district') as string)?.trim();
    const village = (formData.get('village') as string)?.trim();
    const address = (formData.get('address') as string)?.trim();
    const postalCode = (formData.get('postalCode') as string)?.trim();
    const notes = (formData.get('notes') as string)?.trim();

    const redirectUrl = new URL('/customer/profile?success=Profil+berhasil+diperbarui', request.url);
    const errorUrl = (msg: string) => new URL(`/customer/profile?edit=true&error=${encodeURIComponent(msg)}`, request.url);

    if (!name || !phone) {
      if (isJsonRequest) {
        return NextResponse.json({ success: false, error: 'Nama dan Nomor WhatsApp wajib diisi' }, { status: 400 });
      }
      return NextResponse.redirect(errorUrl('Nama dan Nomor WhatsApp wajib diisi'), 303);
    }

    let profileImageUrl: string | undefined = undefined;
    const file = formData.get('profileImage') as File;
    if (file && file.size > 0) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        if (isJsonRequest) {
          return NextResponse.json({ success: false, error: 'Format foto tidak didukung (Gunakan JPG, PNG, WebP)' }, { status: 400 });
        }
        return NextResponse.redirect(errorUrl('Format foto tidak didukung (Gunakan JPG, PNG, WebP)'), 303);
      }
      if (file.size > 3 * 1024 * 1024) {
        if (isJsonRequest) {
          return NextResponse.json({ success: false, error: 'Ukuran foto terlalu besar (Maks 3MB)' }, { status: 400 });
        }
        return NextResponse.redirect(errorUrl('Ukuran foto terlalu besar (Maks 3MB)'), 303);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const mime = file.type || 'image/jpeg';
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = `profile-${user.id}-${Date.now()}${ext}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        profileImageUrl = `/uploads/${filename}`;
      } catch {
        profileImageUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    }

    updateCustomerProfileService(user.id, {
      name,
      phone,
      profileImageUrl,
      province,
      city,
      district,
      village,
      address,
      postalCode,
      notes,
    });

    if (isJsonRequest) {
      return NextResponse.json({ success: true, redirectTo: redirectUrl.toString() });
    }
    return NextResponse.redirect(redirectUrl, 303);
  } catch (err: any) {
    const acceptHeader = request.headers.get('accept') || '';
    const isJsonRequest = acceptHeader.includes('application/json');
    const errorMsg = err.message || 'Profil gagal diperbarui';
    if (isJsonRequest) {
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
    return NextResponse.redirect(new URL(`/customer/profile?edit=true&error=${encodeURIComponent(errorMsg)}`, request.url), 303);
  }
}
