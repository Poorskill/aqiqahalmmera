import { requireAuth } from '@/lib/auth';
import { getPostgresAllRoles, getPostgresRolePermissionKeys } from '@/lib/postgres-access';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccessManagementPage() {
  const user = await requireAuth(['master_admin']);
  const roles = await getPostgresAllRoles();
  const rolesWithPerms = await Promise.all(roles.map(async r => ({ ...r, permKeys: await getPostgresRolePermissionKeys(r.name) })));

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Centralized Access Management"
          subtitle="Pusat Kontrol Hak Akses & Permission Role Sistem (Master Admin Exclusive)"
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-wrap gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Role & Template Access</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Daftar Role & Hak Akses Terpusat</h3>
                <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
                  Hanya Master Admin yang memiliki wewenang penuh untuk mengatur permission role sistem Aqiqah Almeera.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rolesWithPerms.map((r) => {
                const permKeys = r.permKeys;
                const isMaster = r.name === 'master_admin';

                return (
                  <div
                    key={r.id}
                    className={`bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm transition-all hover:border-amber-400 ${
                      isMaster ? 'bg-amber-50/40 border-amber-300' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 uppercase rounded-lg ${
                            isMaster
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {r.name}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800">
                          {isMaster ? 'Full Superuser' : `${permKeys.length} Permissions`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 uppercase">{r.name}</h3>
                      <p className="text-xs text-stone-600 mt-1">{r.description || 'Role operasional sistem Almeera.'}</p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-400">ID: {r.id}</span>
                      <Link
                        href={`/admin/access-management/${r.id}`}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
                          isMaster
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">security</span>
                        {isMaster ? 'Lihat / Detail' : 'Manage Access'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
