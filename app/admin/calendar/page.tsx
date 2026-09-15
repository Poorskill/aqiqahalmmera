import { requireAuth } from '@/lib/auth';
import { getPostgresOperationalCalendar } from '@/lib/postgres-access';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireAuth(['admin', 'master_admin', 'kandang', 'dapur', 'driver']);
  const sParams = await searchParams;
  const filter = sParams.filter || 'all';

  const orders = await getPostgresOperationalCalendar();

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Kalender Operasional"
          subtitle="Jadwal Kandang, Dapur & Pengantaran Almeera"
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header & Filters */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Jadwal & Kegiatan Aktif</span>
              <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">Agenda Operasional Almeera</h3>
              <p className="text-xs text-stone-600 mt-0.5">Pantau seluruh jadwal penyembelihan, memasak, dan pengiriman order aktif secara terpadu.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/admin/calendar?filter=all"
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  filter === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Semua
              </Link>
              <Link
                href="/admin/calendar?filter=kandang"
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  filter === 'kandang'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Kandang
              </Link>
              <Link
                href="/admin/calendar?filter=dapur"
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  filter === 'dapur'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Dapur
              </Link>
              <Link
                href="/admin/calendar?filter=driver"
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  filter === 'driver'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Driver
              </Link>
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Daftar Agenda Operasional ({orders.length})
              </h4>
              <span className="text-[11px] text-stone-400 font-medium">Diurutkan berdasarkan tanggal pengiriman terdekat</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-300 rounded-xl p-8 bg-stone-50/50">
                <span className="material-symbols-outlined text-4xl text-amber-700 mb-2">event_busy</span>
                <p className="font-bold text-stone-900">Tidak ada jadwal aktif</p>
                <p className="text-xs text-stone-500 mt-1">Semua jadwal operasional saat ini kosong atau sudah selesai.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const showKandang = filter === 'all' || filter === 'kandang';
                  const showDapur = filter === 'all' || filter === 'dapur';
                  const showDriver = filter === 'all' || filter === 'driver';

                  return (
                    <div key={ord.id} className="p-4 bg-white border border-stone-200/90 rounded-xl hover:border-amber-400 transition-all space-y-3 shadow-xs">
                      {/* Top Bar: Invoice, Badge, Type & Shohibul Name */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50/60 px-2.5 py-1 border border-amber-200/60 rounded-lg">
                            {ord.vendorInvoiceNo}
                          </span>
                          <StatusBadge status={ord.status} />
                          <span className="text-[11px] font-semibold uppercase bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md">
                            {ord.jenisOrder}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-500">Shohibul:</span>
                          <span className="text-xs font-bold text-stone-900 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200/60">
                            {ord.atasNama}
                          </span>
                        </div>
                      </div>

                      {/* 3 Operational Modules Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {showKandang && ord.slaughterSchedule && (
                          <div className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-1.5 text-amber-950">
                            <div className="flex items-center justify-between font-bold text-amber-900 uppercase tracking-wide border-b border-amber-200/50 pb-1">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-amber-700">pets</span>
                                Kandang
                              </span>
                              <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded uppercase">
                                {ord.prepStatus}
                              </span>
                            </div>
                            <div className="space-y-0.5 pt-0.5 text-[11px]">
                              <p><strong className="text-stone-700">Hewan:</strong> {ord.animalType} ({ord.animalQty} ekor)</p>
                              <p><strong className="text-stone-700">Jadwal:</strong> {ord.slaughterSchedule}</p>
                            </div>
                          </div>
                        )}

                        {showDapur && ord.cookingSchedule && (
                          <div className="p-3 bg-purple-50/40 border border-purple-200/80 rounded-xl space-y-1.5 text-purple-950">
                            <div className="flex items-center justify-between font-bold text-purple-900 uppercase tracking-wide border-b border-purple-200/50 pb-1">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-purple-700">skillet</span>
                                Dapur
                              </span>
                              <span className="text-[10px] font-semibold bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded uppercase">
                                {ord.kitchenStatus}
                              </span>
                            </div>
                            <div className="space-y-0.5 pt-0.5 text-[11px]">
                              <p><strong className="text-stone-700">Menu:</strong> {ord.menu}</p>
                              <p><strong className="text-stone-700">Jadwal:</strong> {ord.cookingSchedule}</p>
                            </div>
                          </div>
                        )}

                        {showDriver && ord.deliveryDate && (
                          <div className="p-3 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-1.5 text-blue-950">
                            <div className="flex items-center justify-between font-bold text-blue-900 uppercase tracking-wide border-b border-blue-200/50 pb-1">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-blue-700">local_shipping</span>
                                Pengiriman
                              </span>
                              <span className="text-[10px] font-semibold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded uppercase">
                                {ord.deliveryDate}
                              </span>
                            </div>
                            <div className="space-y-0.5 pt-0.5 text-[11px]">
                              <p><strong className="text-stone-700">Penerima:</strong> {ord.recipientName}</p>
                              <p><strong className="text-stone-700">Alamat:</strong> {ord.address}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Action */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-500 font-medium">
                          Jam Kirim: {ord.deliveryTime || '09:00 WIB'}
                        </span>
                        <Link
                          href={`/customer/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Lihat Detail Order
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
