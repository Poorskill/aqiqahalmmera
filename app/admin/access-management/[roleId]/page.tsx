import { requireAuth } from '@/lib/auth';
import { getPostgresRoleById, getPostgresAllPermissions, getPostgresRolePermissionKeys } from '@/lib/postgres-access';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccessManagementDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireAuth(['master_admin']);

  const { roleId } = await params;
  const sParams = await searchParams;

  const role = await getPostgresRoleById(roleId);
  if (!role) return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Role tidak ditemukan.</div>;

  const permissions = await getPostgresAllPermissions();
  const assignedKeys = await getPostgresRolePermissionKeys(role.name);
  const isMaster = role.name === 'master_admin';

  // Group by module
  const modulesMap: Record<string, any[]> = {};
  permissions.forEach((p) => {
    if (!modulesMap[p.module]) modulesMap[p.module] = [];
    modulesMap[p.module].push(p);
  });

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Centralized Access Management"
          subtitle={`Konfigurasi Permission untuk Role: ${role.name.toUpperCase()}`}
          role={user.role}
        />

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

          {isMaster && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>MASTER_ADMIN adalah superuser dengan akses penuh permanen dan terlindungi secara immutable. Permission tidak dapat dicabut.</span>
            </div>
          )}

          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Role Access Matrix</span>
                <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">{role.name.toUpperCase()}</h3>
                <p className="text-xs text-stone-600 mt-0.5">{role.description}</p>
              </div>
              <Link href="/admin/access-management" className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all">
                ← Kembali
              </Link>
            </div>

            <form action={`/api/admin/roles/${roleId}/permissions`} method="POST" className="space-y-6">
              <div className="space-y-6">
                {Object.entries(modulesMap).map(([modName, perms]) => (
                  <div key={modName} className="border border-stone-200/80 rounded-xl p-5 bg-[#faf9f6] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-stone-200/60 pb-2">
                      Module: {modName.toUpperCase()}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((p) => {
                        const isChecked = isMaster || assignedKeys.includes(p.key);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center gap-3 p-3 bg-white border border-stone-200/80 rounded-xl transition-all ${
                              isMaster ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:border-amber-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="permissions"
                              value={p.key}
                              defaultChecked={isChecked}
                              disabled={isMaster}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                              <p className="text-[10px] font-mono text-stone-500 truncate">{p.key}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!isMaster && (
                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    Simpan Perubahan Permission
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
