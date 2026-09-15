import { requireAuth } from '@/lib/auth';
import { getPostgresOrders } from '@/lib/postgres-services';
import { getAllOrders } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { PrintButton } from '@/components/ui/PrintButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; jenisOrder?: string; paymentStatus?: string }>;
}) {
  const user = await requireAuth(['admin', 'master_admin']);
  const sParams = await searchParams;
  const reportType = sParams.type || 'sales';
  const statusFilter = sParams.status || '';
  const jenisFilter = sParams.jenisOrder || '';
  const paymentFilter = sParams.paymentStatus || '';

  let orders = await getPostgresOrders();
  if (!orders.length) orders = getAllOrders();

  // Filter orders based on query parameters
  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (jenisFilter && o.jenisOrder !== jenisFilter) return false;
    if (paymentFilter && o.orderDetails?.paymentStatus !== paymentFilter) return false;
    return true;
  });

  // Aggregations
  const totalRevenue = filteredOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.quotationPrice || o.orderDetails?.totalPelunasan || 0), 0);

  const totalPaid = filteredOrders
    .reduce((sum, o) => sum + (o.orderDetails?.totalBayar || 0), 0);

  const totalOutstanding = filteredOrders
    .filter(o => o.status !== 'cancelled' && o.status !== 'completed')
    .reduce((sum, o) => {
      const tot = o.quotationPrice || o.orderDetails?.totalPelunasan || 0;
      const paid = o.orderDetails?.totalBayar || 0;
      return sum + Math.max(0, tot - paid);
    }, 0);

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Laporan & Analytics"
          subtitle="Command & Management Reporting System"
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Report Category Tabs & Filters */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-6 print:hidden">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-wrap gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Kategori Laporan</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Pilih Jenis Laporan & Analytics</h3>
              </div>
              <PrintButton label="Cetak / Print Laporan" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'sales', label: 'Sales & Revenue' },
                { id: 'orders', label: 'Order Report' },
                { id: 'payments', label: 'Payment Report' },
                { id: 'production', label: 'Production (Kandang/Dapur)' },
                { id: 'delivery', label: 'Delivery Report' },
                { id: 'customers', label: 'Customer Summary' },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={`/admin/reports?type=${tab.id}`}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    reportType === tab.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Filters */}
            <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
              <input type="hidden" name="type" value={reportType} />
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Status Order</label>
                <select name="status" defaultValue={statusFilter} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs font-medium">
                  <option value="">Semua Status</option>
                  <option value="waiting_review">Waiting Review</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="quotation_approved">Quotation Approved</option>
                  <option value="preparing">Preparing</option>
                  <option value="slaughtering">Slaughtering</option>
                  <option value="cooking">Cooking</option>
                  <option value="packaging">Packaging</option>
                  <option value="delivery">Delivery</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Jenis Order</label>
                <select name="jenisOrder" defaultValue={jenisFilter} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs font-medium">
                  <option value="">Semua Jenis</option>
                  <option value="aqiqah">Aqiqah</option>
                  <option value="nazar">Nazar</option>
                  <option value="tasyakuran">Tasyakuran</option>
                  <option value="catering">Catering</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Status Pembayaran</label>
                <select name="paymentStatus" defaultValue={paymentFilter} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs font-medium">
                  <option value="">Semua Pembayaran</option>
                  <option value="lunas">Lunas</option>
                  <option value="dp">DP (Down Payment)</option>
                  <option value="kurang">Kurang</option>
                </select>
              </div>

              <div className="flex items-end">
                <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
                  Terapkan Filter
                </button>
              </div>
            </form>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Nilai / Omzet</span>
              <h3 className="text-2xl font-bold font-mono text-stone-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Dibayar / Masuk</span>
              <h3 className="text-2xl font-bold font-mono text-emerald-900">Rp {totalPaid.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Total Outstanding</span>
              <h3 className="text-2xl font-bold font-mono text-amber-950">Rp {totalOutstanding.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Hasil Laporan: {reportType.toUpperCase()} ({filteredOrders.length} Baris Data)
              </h4>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-300 rounded-xl p-8 bg-stone-50/50">
                <span className="material-symbols-outlined text-4xl text-amber-700 mb-2">folder_off</span>
                <p className="font-bold text-stone-900">Tidak ada data laporan</p>
                <p className="text-xs text-stone-500 mt-1">Sesuaikan filter pencarian laporan Anda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">No Invoice</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Atas Nama</th>
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4">Total Biaya</th>
                      <th className="py-3 px-4">Pembayaran</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-900 text-xs">{ord.vendorInvoiceNo}</td>
                        <td className="py-4 px-4 text-xs text-stone-600">{new Date(ord.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="py-4 px-4 font-bold text-stone-900 text-xs">{ord.atasNama}</td>
                        <td className="py-4 px-4 uppercase text-xs font-semibold text-stone-700">{ord.jenisOrder}</td>
                        <td className="py-4 px-4 font-mono font-bold text-stone-900 text-xs">
                          Rp {(ord.quotationPrice || ord.orderDetails?.totalPelunasan || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-4 font-medium text-stone-700 text-xs">
                          <span className="uppercase font-bold text-amber-900">{ord.orderDetails?.paymentStatus || '-'}</span> (Rp {(ord.orderDetails?.totalBayar || 0).toLocaleString('id-ID')})
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={ord.status} />
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
