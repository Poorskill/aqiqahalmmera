import { requireAuth } from '@/lib/auth';
import { getPostgresAuditLogs } from '@/lib/postgres-audit';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; search?: string }>;
}) {
  const user = await requireAuth(['master_admin']);
  const sParams = await searchParams;
  const actionFilter = sParams.action || '';
  const searchFilter = sParams.search || '';

  const { logs, actionsList } = await getPostgresAuditLogs({ action: actionFilter, search: searchFilter });

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Audit Log & System Control"
          subtitle="Monitoring Aktivitas & Perubahan Sistem Almeera"
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header & Filters */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Security & Activity Trail</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Log Aktivitas Admin & Sistem</h3>
              </div>
            </div>

            <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Filter Aksi (Action)</label>
                <select name="action" defaultValue={actionFilter} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs font-medium">
                  <option value="">Semua Aksi</option>
                  {actionsList.map((a) => (
                    <option key={a.action} value={a.action}>{a.action}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Cari Kata Kunci</label>
                <input
                  type="text"
                  name="search"
                  defaultValue={searchFilter}
                  placeholder="Cari detail perubahan..."
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs font-medium"
                />
              </div>

              <div className="flex items-end">
                <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
                  Filter Log
                </button>
              </div>
            </form>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-3">
              Daftar Audit Log ({logs.length} Entri Terakhir)
            </h4>

            {logs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-300 rounded-xl p-8 bg-stone-50/50">
                <span className="material-symbols-outlined text-4xl text-amber-700 mb-2">history_toggle_off</span>
                <p className="font-bold text-stone-900">Belum ada audit log</p>
                <p className="text-xs text-stone-500 mt-1">Aktivitas penting akan tercatat di sini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Aktor / User</th>
                      <th className="py-3 px-4">Aksi</th>
                      <th className="py-3 px-4">Entitas / Target</th>
                      <th className="py-3 px-4">Perubahan (Old → New)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4 font-mono text-stone-500 text-xs">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900 text-xs">
                          {log.actorName || log.actorId}
                          <span className="block text-[10px] text-stone-400 font-normal">{log.actorRole || 'System'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-stone-700">
                          {log.permissionKey || log.targetUserId || '-'}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs">
                          {log.oldValue && <span className="text-red-600 line-through mr-2">{log.oldValue}</span>}
                          {log.newValue ? <span className="text-emerald-700 font-semibold">{log.newValue}</span> : <span className="text-stone-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
