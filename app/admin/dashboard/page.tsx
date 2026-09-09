import { requireAuth } from '@/lib/auth';
import { getAllOrders, getAllPayments } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireAuth(['admin', 'master_admin']);
  const orders = getAllOrders();

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const ordersToday = orders.filter(o => o.createdAt.slice(0, 10) === todayStr).length;
  const ordersThisMonth = orders.filter(o => o.createdAt.slice(0, 7) === currentMonthStr).length;

  const omzetThisMonth = orders
    .filter(o => o.createdAt.slice(0, 7) === currentMonthStr && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.quotationPrice || o.orderDetails?.totalPelunasan || 0), 0);

  const outstandingPayment = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'completed')
    .reduce((sum, o) => {
      const total = o.quotationPrice || o.orderDetails?.totalPelunasan || 0;
      const paid = o.orderDetails?.totalBayar || 0;
      return sum + Math.max(0, total - paid);
    }, 0);

  const quotationPending = orders.filter(o => o.status === 'quotation_sent' || o.status === 'waiting_review').length;

  const productionToday = orders.filter(o => {
    const cookDate = o.dapurOrder?.cookingSchedule || o.orderDetails?.deliveryDate;
    return cookDate && cookDate.includes(todayStr);
  }).length;

  const deliveryToday = orders.filter(o => {
    const delDate = o.orderDetails?.deliveryDate;
    return delDate === todayStr;
  }).length;

  const orderOverdue = orders.filter(o => {
    const delDate = o.orderDetails?.deliveryDate;
    return delDate && delDate < todayStr && !['completed', 'cancelled'].includes(o.status);
  }).length;

  const pendingPayments = getAllPayments({ status: 'waiting_verification' });
  const waitingReviewOrders = orders.filter(o => o.status === 'waiting_review');
  const overdueOrdersList = orders.filter(o => {
    const delDate = o.orderDetails?.deliveryDate;
    return delDate && delDate < todayStr && !['completed', 'cancelled'].includes(o.status);
  });
  const totalAdminActions = pendingPayments.length + waitingReviewOrders.length + overdueOrdersList.length;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Command & Operation Center"
          subtitle="Dashboard Manajemen & Kontrol Utama"
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Admin Action Center */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">gavel</span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">Action Center — Tugas Operasional & Tindak Lanjut</h4>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full">
                {totalAdminActions} Tugas Pending
              </span>
            </div>

            {totalAdminActions === 0 ? (
              <div className="p-6 bg-stone-50/60 border border-stone-200/80 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1">task_alt</span>
                <p className="text-xs font-bold text-stone-900">Semua pekerjaan tertangani</p>
                <p className="text-xs text-stone-500">Tidak ada antrian order, pembayaran, atau pengiriman mendesak.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pendingPayments.length > 0 && (
                  <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">HIGH</span>
                        <span className="text-xs font-mono font-bold text-amber-900">{pendingPayments.length} Transaksi</span>
                      </div>
                      <h5 className="text-sm font-bold text-stone-900">Pembayaran Menunggu Verifikasi</h5>
                      <p className="text-xs text-stone-600 mt-1">Bukti transfer baru perlu diperiksa & disahkan ke rekening.</p>
                    </div>
                    <Link href="/admin/payments" className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-all">
                      <span>Kelola Pembayaran</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                )}

                {waitingReviewOrders.length > 0 && (
                  <div className="p-5 bg-amber-50/30 border border-amber-200/60 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">HIGH</span>
                        <span className="text-xs font-mono font-bold text-amber-900">{waitingReviewOrders.length} Pesanan</span>
                      </div>
                      <h5 className="text-sm font-bold text-stone-900">Order Menunggu Review & Quotation</h5>
                      <p className="text-xs text-stone-600 mt-1">Pesanan baru masuk memerlukan penentuan harga penawaran.</p>
                    </div>
                    <Link href="/admin/orders" className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-all">
                      <span>Tinjau Order</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                )}

                {overdueOrdersList.length > 0 && (
                  <div className="p-5 bg-red-50/60 border border-red-200 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">URGENT</span>
                        <span className="text-xs font-mono font-bold text-red-900">{overdueOrdersList.length} Pesanan</span>
                      </div>
                      <h5 className="text-sm font-bold text-stone-900">Order Terlambat (Overdue)</h5>
                      <p className="text-xs text-stone-600 mt-1">Melewati jadwal kirim namun status belum selesai.</p>
                    </div>
                    <Link href="/admin/orders" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-all">
                      <span>Investigasi Order</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link href="/admin/orders" className="bg-white border border-stone-200/80 rounded-2xl p-6 hover:border-amber-400 transition-all block shadow-sm space-y-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Order Hari Ini</span>
              <h3 className="text-3xl font-bold font-mono text-stone-900">{ordersToday}</h3>
              <p className="text-xs text-amber-700 font-medium">Bulan ini: {ordersThisMonth} order</p>
            </Link>

            <Link href="/admin/orders" className="bg-white border border-stone-200/80 rounded-2xl p-6 hover:border-emerald-400 transition-all block shadow-sm space-y-2">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Omzet Bulan Ini</span>
              <h3 className="text-2xl font-bold font-mono text-emerald-900">Rp {omzetThisMonth.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-emerald-700 font-medium">Total nilai order aktif/selesai</p>
            </Link>

            <Link href="/admin/orders" className="bg-amber-50/60 border border-amber-300 rounded-2xl p-6 hover:bg-amber-50 transition-all block shadow-sm space-y-2">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Outstanding Payment</span>
              <h3 className="text-2xl font-bold font-mono text-amber-950">Rp {outstandingPayment.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-amber-800 font-medium">Sisa kekurangan pelunasan</p>
            </Link>

            <Link href="/admin/orders" className="bg-red-50/60 border border-red-300 rounded-2xl p-6 hover:bg-red-50 transition-all block shadow-sm space-y-2">
              <span className="text-xs font-semibold text-red-900 uppercase tracking-wider">Order Terlambat (Overdue)</span>
              <h3 className="text-3xl font-bold font-mono text-red-950">{orderOverdue}</h3>
              <p className="text-xs text-red-800 font-medium">Lewat jadwal kirim belum selesai</p>
            </Link>
          </div>

          {/* Secondary Operational KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Quotation Pending</span>
                <h4 className="text-2xl font-bold font-mono text-amber-800 mt-1">{quotationPending}</h4>
              </div>
              <Link href="/admin/orders" className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all">
                Tinjau
              </Link>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Produksi Hari Ini</span>
                <h4 className="text-2xl font-bold font-mono text-purple-900 mt-1">{productionToday}</h4>
              </div>
              <Link href="/admin/calendar" className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all">
                Jadwal Dapur
              </Link>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pengiriman Hari Ini</span>
                <h4 className="text-2xl font-bold font-mono text-blue-900 mt-1">{deliveryToday}</h4>
              </div>
              <Link href="/admin/calendar" className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all">
                Jadwal Driver
              </Link>
            </div>
          </div>

          {/* Quick Actions & Recent Orders */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-wrap gap-4">
              <div>
                <h4 className="text-base font-bold text-stone-900">Monitoring Pesanan Terbaru</h4>
                <p className="text-xs text-stone-500 mt-0.5">Kelola pesanan, tinjau penawaran, dan akses laporan operasional.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/admin/reports"
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">bar_chart</span>
                  Reports
                </Link>
                <Link
                  href="/admin/audit"
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">history</span>
                  Audit Log
                </Link>
                <Link
                  href="/admin/orders/new"
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-sm">post_add</span>
                  Pesanan Manual
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">No Invoice</th>
                    <th className="py-3 px-4">Tanggal Kirim</th>
                    <th className="py-3 px-4">Atas Nama</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Total Biaya</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {orders.slice(0, 10).map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-amber-900 text-xs">{ord.vendorInvoiceNo}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-600">{ord.orderDetails?.deliveryDate || '-'}</td>
                      <td className="py-4 px-4 font-bold text-stone-900 text-xs">{ord.atasNama}</td>
                      <td className="py-4 px-4 uppercase text-xs font-semibold text-stone-700">{ord.jenisOrder}</td>
                      <td className="py-4 px-4 font-mono font-bold text-stone-900 text-xs">
                        {ord.quotationPrice ? `Rp ${ord.quotationPrice.toLocaleString('id-ID')}` : 'Belum Quotation'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/customer/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Detail
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
