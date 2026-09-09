import { requireAuth } from '@/lib/auth';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminNewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuth(['master_admin']);
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Tambah Staff / Admin Baru" subtitle="Pendaftaran Akun Operasional Internal Almeera" role={user.role} />

        <main className="p-8 max-w-2xl mx-auto w-full">
          {params.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{params.error}</span>
            </div>
          )}

          <form action="/api/admin/staff/create" method="POST" className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Formulir Staff Baru</span>
              <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">Tambah Akun Operasional</h3>
              <p className="text-xs text-stone-600 mt-0.5">Buat akun baru untuk Admin, Petugas Kandang, Dapur, atau Driver.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Nama Staff / Petugas"
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Email Aktif *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="staff@almeera.com"
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">No WhatsApp / HP *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="081234567890"
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Role Operasional *</label>
                <select
                  name="role"
                  required
                  defaultValue="admin"
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                >
                  <option value="admin">ADMIN (Administrator)</option>
                  <option value="kandang">KANDANG (Petugas Kandang & Sembelih)</option>
                  <option value="dapur">DAPUR (Petugas Dapur A & R)</option>
                  <option value="driver">DRIVER (Kurir Pengantaran)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/admin/staff" className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all">
                Batal
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                Simpan & Tambah Staff
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
