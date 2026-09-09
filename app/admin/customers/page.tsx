import { requireAuth } from '@/lib/auth';
import { getAllCustomers } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const user = await requireAuth(['master_admin']);
  const customers = getAllCustomers();

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Manajemen Customer" subtitle="Daftar Akun Customer / Shohibul Qurban Almeera" role={user.role} />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Total Customer Terdaftar ({customers.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Customer</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">No HP / WA</th>
                    <th className="py-3 px-4">Total Pesanan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-stone-900 text-xs">{c.name}</td>
                      <td className="py-4 px-4 font-mono text-xs text-stone-600">{c.email}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-700">{c.phone}</td>
                      <td className="py-4 px-4 font-mono font-bold text-amber-900 text-xs">{c.totalOrders} Pesanan</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === 'active' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'}`}>
                          {c.status || 'active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-600">{new Date(c.createdAt).toLocaleDateString('id-ID')}</td>
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
