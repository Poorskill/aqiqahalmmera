import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DapurDashboardPage() {
  const user = await requireAuth(['dapur', 'admin', 'master_admin']);
  const stmt = db.prepare(`
    SELECT d.*, o.vendorInvoiceNo, o.atasNama, o.status as orderStatus
    FROM dapur_orders d
    JOIN orders o ON d.orderId = o.id
    ORDER BY d.createdAt DESC
  `);
  const dapurOrders = stmt.all() as any[];
  const pendingCook = dapurOrders.filter(d => d.kitchenStatus === 'waiting_cook' || d.kitchenStatus === 'cooking');

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Operasional Dapur" subtitle="Manajemen Masakan, Nasi Box & Packing" role={user.role} />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Dapur Action Center */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">skillet</span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">Action Center — Antrian Produksi Dapur</h4>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full">
                {pendingCook.length} Perlu Diproses
              </span>
            </div>

            {pendingCook.length === 0 ? (
              <div className="p-6 bg-stone-50/60 border border-stone-200/80 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1">check_circle</span>
                <p className="text-xs font-bold text-stone-900">Tidak ada produksi untuk hari ini</p>
                <p className="text-xs text-stone-500">Semua pesanan dapur telah selesai dimasak dan dipacking.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCook.map(item => (
                  <div key={item.id} className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-stone-200">{item.vendorInvoiceNo}</span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold uppercase rounded">{item.kitchenStatus}</span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-900">{item.atasNama}</h5>
                      <p className="text-xs text-stone-600 mt-1">{item.menu} ({item.portion})</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Jadwal: {item.cookingSchedule}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <Link href={`/dapur/orders/${item.orderId}`} className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold text-center transition-all">
                        Detail
                      </Link>
                      <form action={`/api/dapur/${item.orderId}/update`} method="POST" className="flex-1">
                        <input type="hidden" name="kitchenStatus" value="packed" />
                        <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all">
                          Selesai Packing
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Jadwal & Proses</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Daftar Produksi Dapur ({dapurOrders.length})</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">No Invoice</th>
                    <th className="py-3 px-4">Atas Nama</th>
                    <th className="py-3 px-4">Menu & Porsi</th>
                    <th className="py-3 px-4">Jadwal Masak</th>
                    <th className="py-3 px-4">Status Dapur</th>
                    <th className="py-3 px-4 text-right">Aksi Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {dapurOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-400 text-xs">
                        Belum ada jadwal produksi dapur.
                      </td>
                    </tr>
                  ) : (
                    dapurOrders.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-900 text-xs">{item.vendorInvoiceNo}</td>
                        <td className="py-4 px-4 font-bold text-stone-900 text-xs">{item.atasNama}</td>
                        <td className="py-4 px-4 font-medium text-stone-800 text-xs">{item.menu} ({item.portion})</td>
                        <td className="py-4 px-4 text-xs text-stone-600">{item.cookingSchedule}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${
                            item.kitchenStatus === 'packed' ? 'bg-indigo-100 text-indigo-900' :
                            item.kitchenStatus === 'cooking' ? 'bg-purple-100 text-purple-900' :
                            'bg-amber-100 text-amber-900'
                          }`}>
                            {item.kitchenStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <Link
                            href={`/dapur/orders/${item.orderId}`}
                            className="inline-flex items-center gap-1 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
                          >
                            Detail
                          </Link>
                          <form action={`/api/dapur/${item.orderId}/update`} method="POST" className="inline-flex">
                            <input type="hidden" name="kitchenStatus" value="cooking" />
                            <button type="submit" className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all">
                              Mulai Masak
                            </button>
                          </form>
                          <form action={`/api/dapur/${item.orderId}/update`} method="POST" className="inline-flex">
                            <input type="hidden" name="kitchenStatus" value="packed" />
                            <button type="submit" className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all">
                              Packing Selesai
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
