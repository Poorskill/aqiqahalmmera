import { requireAuth } from '@/lib/auth';
import { getUserById, getAllPermissions, getEffectivePermissions, getAllRoles } from '@/lib/services';
import { db } from '@/lib/db';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { DeleteStaffButton } from '@/components/ui/DeleteStaffButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminStaffDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const adminUser = await requireAuth(['master_admin']);
  const { id } = await params;
  const sParams = await searchParams;

  const staff = getUserById(id);
  if (!staff) return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Staff tidak ditemukan.</div>;

  const roles = getAllRoles();
  const allPermissions = getAllPermissions();
  const effectivePerms = getEffectivePermissions(staff.id);

  const overrides = db.prepare('SELECT p.key, up.effect FROM user_permissions up JOIN permissions p ON up.permissionId = p.id WHERE up.userId = ?').all(staff.id) as any[];
  const overrideMap: Record<string, string> = {};
  overrides.forEach(o => { overrideMap[o.key] = o.effect; });

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={adminUser.role} userName={adminUser.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Kontrol Akses Staff" subtitle={`Detail & Override Permission: ${staff.name.toUpperCase()}`} role={adminUser.role} />

        <main className="p-8 space-y-6 max-w-5xl mx-auto w-full">
          {sParams.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{sParams.success}</span>
            </div>
          )}
          {sParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{sParams.error}</span>
            </div>
          )}

          {/* User Info & Role Update Form */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Informasi Akun Staff</span>
                <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">{staff.name}</h3>
              </div>
              <Link href="/admin/staff" className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all">
                ← Kembali
              </Link>
            </div>

            <form action={`/api/admin/staff/${staff.id}/update`} method="POST" className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Email</label>
                <input type="text" disabled defaultValue={staff.email} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 bg-stone-100 text-stone-600 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Role Operasional *</label>
                <select name="role" defaultValue={staff.role} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium">
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Status Akun *</label>
                <select name="status" defaultValue={staff.status || 'active'} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium">
                  <option value="active">AKTIF</option>
                  <option value="inactive">INAKTIF (SUSPENDED)</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end pt-2">
                <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
                  Update Role & Status Staff
                </button>
              </div>
            </form>
          </div>

          {/* User Specific Permission Overrides */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Override Permission Spesifik User ({staff.name})
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">Berikan izin tambahan (Allow) atau tolak izin (Deny) khusus untuk staff ini terlepas dari rolenya.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Permission Key</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Status Efektif</th>
                    <th className="py-3 px-4 text-right">Aksi Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {allPermissions.map((p) => {
                    const isEffective = effectivePerms.includes(p.key);
                    const currentOverride = overrideMap[p.key] || 'default';

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-xs uppercase text-stone-700">{p.module}</td>
                        <td className="py-4 px-4 font-mono text-xs text-amber-900">{p.key}</td>
                        <td className="py-4 px-4 text-xs text-stone-800">{p.name}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${isEffective ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-stone-100 text-stone-500 border border-stone-300'}`}>
                            {isEffective ? 'Allowed' : 'Denied'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <form action={`/api/admin/staff/${staff.id}/permissions`} method="POST" className="inline-flex items-center gap-2">
                            <input type="hidden" name="permissionKey" value={p.key} />
                            <select
                              name="effect"
                              defaultValue={currentOverride}
                              className="border border-stone-300 rounded-xl px-3 py-1.5 bg-white text-stone-900 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                            >
                              <option value="default">Default Role</option>
                              <option value="allow">Force Allow (✓)</option>
                              <option value="deny">Force Deny (✕)</option>
                            </select>
                            <button type="submit" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all">
                              Set
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Danger Zone: Delete Staff */}
          {staff.role !== 'master_admin' && (
            <div className="bg-red-50/60 border border-red-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">Zona Berbahaya: Hapus Akun Staff</h4>
                <p className="text-xs text-red-700 mt-0.5">Menghapus staff akan mencabut seluruh akses dan data permission terkait dari sistem.</p>
              </div>
              <DeleteStaffButton staffId={staff.id} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
