import { requireAuth } from '@/lib/auth';
import { getPostgresDriverQueue } from '@/lib/postgres-queues';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DriverDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAuth(['driver', 'admin', 'master_admin']);
  const qParams = await searchParams;

  const driverOrders = await getPostgresDriverQueue(user.role === 'driver' ? user.id : undefined);

  const pendingDelivery = driverOrders.filter(d => d.status === 'assigned' || d.status === 'on_delivery');

  const statusLabel: Record<string, string> = {
    assigned: 'Ditugaskan',
    on_delivery: 'Dalam Perjalanan',
    delivered: 'Terkirim',
  };

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Operasional Driver" subtitle="Pengiriman Pesanan Door-to-Door Cilacap" role={user.role} />

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {qParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{qParams.error}</span>
            </div>
          )}
          {qParams.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{qParams.success}</span>
            </div>
          )}

          {/* Driver Action Center */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">local_shipping</span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">Action Center — Tugas Pengiriman Aktif</h4>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full">
                {pendingDelivery.length} Pengiriman
              </span>
            </div>

            {pendingDelivery.length === 0 ? (
              <div className="p-6 bg-stone-50/60 border border-stone-200/80 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1">check_circle</span>
                <p className="text-xs font-bold text-stone-900">Tidak ada pengiriman aktif</p>
                <p className="text-xs text-stone-500">Semua tugas pengantaran telah selesai dikirim.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingDelivery.map(item => (
                  <div key={item.id} className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-stone-200">{item.vendorInvoiceNo}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                          item.status === 'on_delivery' ? 'bg-blue-200 text-blue-900' : 'bg-amber-100 text-amber-900'
                        }`}>{statusLabel[item.status] || item.status}</span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-900">Penerima: {item.contactPerson}</h5>
                      <p className="text-xs text-stone-600 mt-1 truncate">Alamat: {item.deliveryAddress}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Jadwal: {item.deliverySchedule}</p>
                      {item.arrivedAt && (
                        <p className="text-[11px] text-sky-700 font-semibold mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">pin_drop</span>
                          Tiba di lokasi
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <Link href={`/driver/orders/${item.orderId}`} className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold text-center transition-all">
                        Detail
                      </Link>
                      {item.status === 'assigned' && (
                        <form action={`/api/driver/${item.orderId}/update`} method="POST" className="flex-1">
                          <input type="hidden" name="action" value="start" />
                          <input type="hidden" name="redirectTo" value="/driver/dashboard" />
                          <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all">
                            Mulai Kirim
                          </button>
                        </form>
                      )}
                      {item.status === 'on_delivery' && (
                        <Link href={`/driver/orders/${item.orderId}`} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold text-center shadow-xs transition-all">
                          Selesaikan
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Tugas Pengantaran</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Daftar Pengiriman ({driverOrders.length})</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">No Invoice</th>
                    <th className="py-3 px-4">Penerima & Kontak</th>
                    <th className="py-3 px-4">Alamat Tujuan</th>
                    <th className="py-3 px-4">Jadwal Kirim</th>
                    <th className="py-3 px-4">Status Kirim</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {driverOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-400 text-xs">
                        Belum ada tugas pengiriman driver.
                      </td>
                    </tr>
                  ) : (
                    driverOrders.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-900 text-xs">{item.vendorInvoiceNo}</td>
                        <td className="py-4 px-4 font-bold text-stone-900 text-xs">{item.contactPerson}</td>
                        <td className="py-4 px-4 text-xs font-medium text-stone-700 max-w-xs truncate">{item.deliveryAddress}</td>
                        <td className="py-4 px-4 text-xs text-stone-600">{item.deliverySchedule}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${
                            item.status === 'delivered' ? 'bg-emerald-100 text-emerald-900' :
                            item.status === 'on_delivery' ? 'bg-blue-100 text-blue-900' :
                            'bg-amber-100 text-amber-900'
                          }`}>
                            {statusLabel[item.status] || item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/driver/orders/${item.orderId}`}
                            className="inline-flex items-center gap-1 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
                          >
                            Detail
                          </Link>
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
