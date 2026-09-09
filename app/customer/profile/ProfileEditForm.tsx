'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileEditForm({ user }: { user: any }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImageUrl || null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        alert('Format foto tidak didukung (Gunakan JPG, PNG, WebP)');
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar (Maksimal 3MB)');
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const getInitials = (name: string) => {
    return (name || 'User')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formEl = e.currentTarget;
        const formData = new FormData(formEl);

        try {
          const res = await fetch('/api/customer/profile/update', {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
            },
          });
          const data = await res.json();
          if (data.success && data.redirectTo) {
            router.push(data.redirectTo);
            router.refresh();
            setTimeout(() => {
              window.location.href = data.redirectTo;
            }, 300);
          } else {
            alert(data.error || 'Gagal memperbarui profil');
            setSubmitting(false);
          }
        } catch {
          alert('Terjadi kesalahan jaringan');
          setSubmitting(false);
        }
      }}
      className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-6 shadow-sm"
    >
      <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Ubah Data Diri</span>
          <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">Edit Profil Pribadi</h3>
        </div>
        <Link href="/customer/profile" className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors">
          Batal
        </Link>
      </div>

      {/* Avatar & Photo Upload */}
      <div className="flex flex-col items-center space-y-3 py-2">
        <div className="w-24 h-24 rounded-full border-4 border-amber-200 overflow-hidden bg-amber-600 flex items-center justify-center text-xl font-bold text-white shadow-sm">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}
        </div>
        <label className="cursor-pointer px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all">
          <span className="material-symbols-outlined text-sm">photo_camera</span>
          Ubah Foto Profil
          <input type="file" name="profileImage" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
        </label>
        <span className="text-[11px] text-stone-400">Format: JPG, PNG, WebP (Maks 3MB)</span>
      </div>

      {/* Informasi Akun */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
          Informasi Akun
        </h4>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Nama Lengkap <span className="text-amber-600">*</span></label>
          <input
            type="text"
            name="name"
            required
            defaultValue={user.name}
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email (Login ID)</label>
          <input
            type="email"
            disabled
            defaultValue={user.email}
            className="w-full bg-stone-100 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-500 font-mono cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Nomor WhatsApp / HP <span className="text-amber-600">*</span></label>
          <input
            type="text"
            name="phone"
            required
            defaultValue={user.phone}
            placeholder="081234567890"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>
      </div>

      {/* Informasi Alamat Default */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
          Alamat Pengiriman Default
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Provinsi</label>
            <input
              type="text"
              name="province"
              defaultValue={user.province || ''}
              placeholder="Jawa Tengah"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kabupaten / Kota</label>
            <input
              type="text"
              name="city"
              defaultValue={user.city || ''}
              placeholder="Kabupaten Cilacap"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kecamatan</label>
            <input
              type="text"
              name="district"
              defaultValue={user.district || ''}
              placeholder="Cilacap Tengah"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kelurahan / Desa</label>
            <input
              type="text"
              name="village"
              defaultValue={user.village || ''}
              placeholder="Sidanegara"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kode Pos</label>
          <input
            type="text"
            name="postalCode"
            defaultValue={user.postalCode || ''}
            placeholder="53223"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all max-w-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Alamat Lengkap</label>
          <textarea
            name="address"
            rows={3}
            defaultValue={user.address || ''}
            placeholder="Jl. Flores No. 28B, RT.2/RW.15..."
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          ></textarea>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Catatan Alamat / Patokan (Opsional)</label>
          <input
            type="text"
            name="notes"
            defaultValue={user.notes || ''}
            placeholder="Dekat Masjid Al-Huda"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
        <Link
          href="/customer/profile"
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">save</span>
          <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>
    </form>
  );
}
