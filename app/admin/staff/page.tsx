import { requireAuth } from '@/lib/auth';
import { getAllPostgresStaff } from '@/lib/postgres-reports';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await requireAuth(['master_admin']);
  const sParams = await searchParams;
  const staffList = await getAllPostgresStaff();

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Manajemen Staff" subtitle="Daftar Operasional Internal (Admin, Kandang, Dapur, Driver)" role={user.role} />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {sParams.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{sParams.success}</span>
            </div>
          )}

          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-wrap gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Tim Operasional</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Total Staff Terdaftar ({staffList.length})</h3>
              </div>
              <Link
                href="/admin/staff/new"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                + Tambah Staff / Admin Baru
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Staff</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Terdaftar</th>
                    <th className="py-3 px-4 text-right">Aksi & Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-stone-900 text-xs">{s.name}</td>
                      <td className="py-4 px-4 font-mono text-xs text-stone-600">{s.email}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          {s.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'}`}>
                          {s.status || 'active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-600">{new Date(s.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/staff/${s.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">security</span>
                          Kelola Akses
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
