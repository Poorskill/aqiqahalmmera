import { requireAuth } from '@/lib/auth';
import { getAllOrders, getNotificationsByUserId, getUnreadNotificationCount } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderStatusTimeline } from '@/components/ui/OrderStatusTimeline';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ACTIVE_STATUSES = [
  'waiting_review',
  'quotation_sent',
  'quotation_approved',
  'preparing',
  'slaughtering',
  'cooking',
  'packaging',
  'delivery',
];

export default async function CustomerDashboardPage() {
  const user = await requireAuth(['customer']);
  const orders = getAllOrders({ customerId: user.id });
  const unreadCount = getUnreadNotificationCount(user.id);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));
  const pendingQuotations = orders.filter((o) => o.status === 'quotation_sent');
  const pendingPaymentsList = orders.filter((o) => {
    const total = o.orderDetails?.totalPelunasan || o.quotationPrice || 0;
    const paid = o.orderDetails?.totalBayar || 0;
    return ['quotation_approved', 'preparing', 'slaughtering', 'cooking', 'packaging'].includes(o.status) && paid < total;
  });
  const unreviewedOrders = orders.filter((o) => o.status === 'completed' && !o.review);

  // Calculate total remaining balance across active orders
  const totalRemainingBalance = activeOrders.reduce((sum, o) => {
    const total = o.orderDetails?.totalPelunasan || o.quotationPrice || 0;
    const paid = o.orderDetails?.totalBayar || 0;
    return sum + Math.max(0, total - paid);
  }, 0);

  const primaryActiveOrder = activeOrders[0] || null;
  const latestHistoryOrder = historyOrders[0] || null;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Dashboard"
          subtitle={`Selamat Datang, ${user.name}`}
          role={user.role}
          unreadCount={unreadCount}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 border border-amber-900/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 text-xs font-semibold rounded-full">
                <span className="material-symbols-outlined text-sm">verified</span>
                Portal Pelanggan Aqiqah Almeera
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-stone-900">Halo, {user.name}!</h3>
              <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
                Pantau pesanan aqiqah, jadwal pengiriman, dan kelola ibadah aqiqah buah hati Anda dengan mudah, aman, dan transparan.
              </p>
            </div>
            <Link
              href="/customer/orders/new"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Buat Pesanan Baru
            </Link>
          </div>

          {/* Dashboard Action Center */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">task_alt</span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">Action Center — Yang Perlu Anda Tindaklanjuti</h4>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full">
                {pendingQuotations.length + pendingPaymentsList.length + unreviewedOrders.length} Tugas
              </span>
            </div>

            {pendingQuotations.length === 0 && pendingPaymentsList.length === 0 && unreviewedOrders.length === 0 ? (
              <div className="p-6 bg-stone-50/60 border border-stone-200/80 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1">check_circle</span>
                <p className="text-xs font-bold text-stone-900">Semua sudah aman</p>
                <p className="text-xs text-stone-500">Belum ada tindakan yang perlu dilakukan saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingQuotations.map(o => (
                  <div key={o.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">HIGH PRIORITY</span>
                        <span className="text-xs font-mono font-bold text-amber-900">{o.vendorInvoiceNo}</span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-900">Quotation Menunggu Persetujuan</h5>
                      <p className="text-xs text-stone-600">Total Penawaran: Rp {(o.quotation?.price || o.quotationPrice || 0).toLocaleString('id-ID')}. Perlu persetujuan Anda.</p>
                    </div>
                    <Link href={`/customer/orders/${o.id}`} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-all">
                      Tinjau & Setujui →
                    </Link>
                  </div>
                ))}

                {pendingPaymentsList.map(o => {
                  const total = o.orderDetails?.totalPelunasan || o.quotationPrice || 0;
                  const paid = o.orderDetails?.totalBayar || 0;
                  const remain = Math.max(0, total - paid);
                  return (
                    <div key={o.id} className="p-4 bg-amber-50/30 border border-amber-200/60 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">MEDIUM PRIORITY</span>
                          <span className="text-xs font-mono font-bold text-amber-900">{o.vendorInvoiceNo}</span>
                        </div>
                        <h5 className="text-xs font-bold text-stone-900">Pelunasan / Pembayaran Pesanan</h5>
                        <p className="text-xs text-stone-600">Kekurangan Sisa Pembayaran: Rp {remain.toLocaleString('id-ID')}. Silakan lakukan pembayaran.</p>
                      </div>
                      <Link href={`/customer/orders/${o.id}`} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-all">
                        Unggah Bukti Bayar →
                      </Link>
                    </div>
                  );
                })}

                {unreviewedOrders.map(o => (
                  <div key={o.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-bold rounded">LOW PRIORITY</span>
                        <span className="text-xs font-mono font-bold text-stone-800">{o.vendorInvoiceNo}</span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-900">Beri Ulasan Pesanan Selesai</h5>
                      <p className="text-xs text-stone-600">Pesanan {o.atasNama} telah selesai. Bagikan pengalaman Anda.</p>
                    </div>
                    <Link href={`/customer/orders/${o.id}`} className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-all">
                      Beri Ulasan →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pesanan Aktif</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="text-3xl font-bold font-mono text-stone-900">{activeOrders.length}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Pesanan sedang dalam proses / antrian</p>
                </div>
                <Link
                  href="/customer/orders"
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
                >
                  Lihat Pesanan
                </Link>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Sisa Pembayaran</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="text-2xl font-bold font-mono text-stone-900">
                    Rp {totalRemainingBalance.toLocaleString('id-ID')}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">Total kekurangan pelunasan aktif</p>
                </div>
                <Link
                  href="/customer/orders"
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
                >
                  Cek Pembayaran
                </Link>
              </div>
            </div>
          </div>

          {/* Main Focus: Primary Active Order or New Customer State */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                {primaryActiveOrder ? 'Pesanan Aktif Utama' : orders.length === 0 ? 'Selamat Datang di Almeera' : 'Pesanan Terakhir'}
              </h4>
              <Link
                href="/customer/orders"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                <span>Semua Pesanan ({orders.length})</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {primaryActiveOrder ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-[#faf9f6] border border-stone-200/80 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-white px-2.5 py-1 border border-stone-200 rounded-lg shadow-xs">
                        {primaryActiveOrder.vendorInvoiceNo}
                      </span>
                      <StatusBadge status={primaryActiveOrder.status} />
                      <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                        {primaryActiveOrder.jenisOrder}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 pt-0.5">{primaryActiveOrder.atasNama}</h4>
                    <div className="text-xs text-stone-600 space-y-1">
                      <p>
                        <strong className="text-stone-700">Pengiriman:</strong> {primaryActiveOrder.orderDetails?.deliveryDate || '-'} ({primaryActiveOrder.orderDetails?.deliveryTime || '-'})
                      </p>
                      <p>
                        <strong className="text-stone-700">Alamat Tujuan:</strong> {primaryActiveOrder.orderDetails?.address || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <Link
                      href={`/customer/orders/${primaryActiveOrder.id}`}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      Lihat Tracking & Detail
                    </Link>
                  </div>
                </div>

                {/* Mini Timeline */}
                <div className="pt-2">
                  <OrderStatusTimeline currentStatus={primaryActiveOrder.status} />
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-300 rounded-xl p-8 bg-stone-50/50">
                <span className="material-symbols-outlined text-4xl text-amber-700 mb-2">pets</span>
                <p className="font-bold text-stone-900">Belum ada pesanan aktif</p>
                <p className="text-xs text-stone-500 mt-1 mb-5">Mulai pesan layanan aqiqah dan katering profesional bersama Almeera dengan mudah.</p>
                <Link
                  href="/customer/orders/new"
                  className="inline-flex px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Buat Pesanan Pertama
                </Link>
              </div>
            ) : latestHistoryOrder ? (
              <div className="p-5 bg-[#faf9f6] border border-stone-200/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-amber-900 bg-white px-2.5 py-1 border border-stone-200 rounded-lg shadow-xs">
                      {latestHistoryOrder.vendorInvoiceNo}
                    </span>
                    <StatusBadge status={latestHistoryOrder.status} />
                  </div>
                  <h4 className="text-base font-bold text-stone-900">{latestHistoryOrder.atasNama}</h4>
                  <p className="text-xs text-stone-500">Pesanan telah selesai diproses.</p>
                </div>
                <Link
                  href={`/customer/orders/${latestHistoryOrder.id}`}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">visibility</span>
                  Lihat Detail & Ulasan
                </Link>
              </div>
            ) : null}
          </div>

          {/* Quick Actions Footer */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-3">
              Menu Akses Cepat
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/customer/orders/new"
                className="p-4 border border-stone-200/80 bg-stone-50/50 hover:bg-amber-50/60 hover:border-amber-300 rounded-xl transition-all text-center space-y-2 group"
              >
                <span className="material-symbols-outlined text-2xl text-amber-700 group-hover:scale-110 transition-transform">post_add</span>
                <p className="text-xs font-semibold text-stone-800">Buat Pesanan Baru</p>
              </Link>
              <Link
                href="/customer/orders"
                className="p-4 border border-stone-200/80 bg-stone-50/50 hover:bg-amber-50/60 hover:border-amber-300 rounded-xl transition-all text-center space-y-2 group"
              >
                <span className="material-symbols-outlined text-2xl text-amber-700 group-hover:scale-110 transition-transform">receipt_long</span>
                <p className="text-xs font-semibold text-stone-800">Semua Pesanan</p>
              </Link>
              <Link
                href="/customer/profile"
                className="p-4 border border-stone-200/80 bg-stone-50/50 hover:bg-amber-50/60 hover:border-amber-300 rounded-xl transition-all text-center space-y-2 group"
              >
                <span className="material-symbols-outlined text-2xl text-amber-700 group-hover:scale-110 transition-transform">person</span>
                <p className="text-xs font-semibold text-stone-800">Profil Customer</p>
              </Link>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-stone-200/80 bg-stone-50/50 hover:bg-amber-50/60 hover:border-amber-300 rounded-xl transition-all text-center space-y-2 group"
              >
                <span className="material-symbols-outlined text-2xl text-amber-700 group-hover:scale-110 transition-transform">support_agent</span>
                <p className="text-xs font-semibold text-stone-800">Hubungi Admin</p>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}