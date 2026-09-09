import { requireAuth } from '@/lib/auth';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';
import ProfileEditForm from './ProfileEditForm';

export const dynamic = 'force-dynamic';

export default async function CustomerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; edit?: string }>;
}) {
  const user = await requireAuth(['customer']);
  const plainUser = JSON.parse(JSON.stringify(user));
  const sParams = await searchParams;
  const isEditing = sParams.edit === 'true';

  const getInitials = (name: string) => {
    return (name || 'User')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Profil Customer"
          subtitle="Kelola Informasi Akun & Alamat Pengiriman"
          role={user.role}
        />

        <main className="p-8 max-w-3xl mx-auto w-full space-y-6">
          {sParams.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{sParams.success}</span>
            </div>
          )}
          {sParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{sParams.error}</span>
            </div>
          )}

          {!isEditing ? (
            /* Profile View Mode */
            <div className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
              {/* Profile Summary Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-2 border-amber-200 overflow-hidden bg-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-xs shrink-0">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user.name)}</span>
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded-full">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Shohibul Qurban Terverifikasi
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-stone-900">{user.name}</h3>
                    <p className="text-xs font-mono text-stone-600">{user.phone || '-'} • {user.email}</p>
                  </div>
                </div>

                <Link
                  href="/customer/profile?edit=true"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Profil
                </Link>
              </div>

              {/* Informasi Pribadi & Alamat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Informasi Pribadi */}
                <div className="space-y-3 bg-[#faf9f6] p-5 border border-stone-200/80 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person</span>
                    Informasi Akun
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-stone-400 font-medium">Nama Lengkap</span>
                      <p className="font-semibold text-stone-900 mt-0.5">{user.name}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 font-medium">Nomor WhatsApp</span>
                      <p className="font-semibold text-stone-900 font-mono mt-0.5">{user.phone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 font-medium">Email (Login)</span>
                      <p className="font-semibold text-stone-900 font-mono mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Alamat Default */}
                <div className="space-y-3 bg-[#faf9f6] p-5 border border-stone-200/80 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    Alamat Pengiriman Default
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-stone-400 font-medium">Alamat</span>
                      <p className="font-semibold text-stone-900 mt-0.5">{user.address || 'Belum diatur'}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 font-medium">Wilayah</span>
                      <p className="font-semibold text-stone-800 mt-0.5">
                        {[user.village, user.district, user.city, user.province, user.postalCode].filter(Boolean).join(', ') || '-'}
                      </p>
                    </div>
                    {user.notes && (
                      <div>
                        <span className="text-stone-400 font-medium">Patokan / Catatan</span>
                        <p className="text-stone-700 italic mt-0.5">{user.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <Link
                  href="/customer/dashboard"
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Kembali ke Dashboard
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Keluar Akun
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Edit Profile Mode */
            <ProfileEditForm user={plainUser} />
          )}
        </main>
      </div>
    </div>
  );
}
