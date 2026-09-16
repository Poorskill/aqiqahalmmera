import { requireAuth } from '@/lib/auth';
import { getPostgresOrders } from '@/lib/postgres-services';
import { getAllOrders } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    deliveryDate?: string;
    orderType?: string;
    error?: string;
    success?: string;
  }>;
}) {
  const user = await requireAuth(['admin', 'master_admin']);
  const params = await searchParams;

  // Query only completed orders
  let orders = await getPostgresOrders({
    status: 'completed',
    search: params.search,
  });

  if (!orders || orders.length === 0) {
    orders = getAllOrders({ search: params.search, status: 'completed' });
  }

  // Client/In-memory filters for additional parameters supported by existing data
  if (params.deliveryDate) {
    orders = orders.filter(
      (ord) => ord.orderDetails?.deliveryDate === params.deliveryDate
    );
  }

  if (params.orderType) {
    orders = orders.filter(
      (ord) => ord.orderType?.toUpperCase() === params.orderType?.toUpperCase()
    );
  }

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="HISTORY PESANAN"
          subtitle="RIWAYAT PESANAN SELESAI AQIQAH ALMEERA CILACAP"
          role={user.role}
        />

        <main className="p-8 space-y-6">
          {params.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{params.error}</span>
            </div>
          )}
          {params.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{params.success}</span>
            </div>
          )}

          {/* Filters & Search */}
          <div className="brutalist-card p-6 bg-white flex flex-col lg:flex-row items-center justify-between gap-4">
            <form method="GET" className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
              <input
                type="text"
                name="search"
                defaultValue={params.search || ''}
                placeholder="Cari invoice, nama, atau WhatsApp..."
                className="brutalist-input text-sm font-medium flex-1 min-w-[200px] max-w-xs"
              />

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-600">Tgl Kirim:</label>
                <input
                  type="date"
                  name="deliveryDate"
                  defaultValue={params.deliveryDate || ''}
                  className="brutalist-input text-xs font-medium px-2 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-600">Tipe:</label>
                <select
                  name="orderType"
                  defaultValue={params.orderType || ''}
                  className="brutalist-input text-xs font-medium px-2 py-2"
                >
                  <option value="">Semua Tipe</option>
                  <option value="ONLINE">Online</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold"
              >
                Filter / Cari
              </button>

              {(params.search || params.deliveryDate || params.orderType) && (
                <Link
                  href="/admin/orders/history"
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs font-medium"
                >
                  Reset
                </Link>
              )}
            </form>

            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <Link
                href="/admin/orders"
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 brutalist-btn text-xs font-bold flex items-center gap-1 border border-stone-300"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali ke Pesanan Aktif
              </Link>
            </div>
          </div>

          {/* Orders History Table */}
          <div className="brutalist-card p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Total Selesai: {orders.length} Pesanan
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#775847] text-xs font-bold text-[#775847] uppercase">
                    <th className="p-3">No Invoice</th>
                    <th className="p-3">Atas Nama</th>
                    <th className="p-3">Tanggal Pesanan</th>
                    <th className="p-3">Tanggal Pengiriman</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Tanggal Selesai</th>
                    <th className="p-3">Total Biaya</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#775847]/10 text-sm">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-stone-500 font-medium">
                        Belum ada riwayat pesanan yang selesai.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const deliveredAt = ord.driverOrder?.deliveredAt;
                      return (
                        <tr key={ord.id} className="hover:bg-[#f3f4f5]">
                          <td className="p-3 font-mono font-bold text-[#865300]">
                            {ord.vendorInvoiceNo}
                          </td>
                          <td className="p-3 font-bold">{ord.atasNama}</td>
                          <td className="p-3 font-medium text-xs text-stone-600">
                            {ord.orderDate
                              ? new Date(ord.orderDate).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>
                          <td className="p-3 font-medium">
                            {ord.orderDetails?.deliveryDate || '-'}
                          </td>
                          <td className="p-3 font-medium text-xs">
                            {ord.driverOrder?.driverName || ord.driverOrder?.contactPerson || '-'}
                          </td>
                          <td className="p-3 font-medium text-xs text-stone-600">
                            {deliveredAt
                              ? new Date(deliveredAt).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </td>
                          <td className="p-3 font-mono font-bold">
                            {ord.quotationPrice
                              ? `Rp ${ord.quotationPrice.toLocaleString('id-ID')}`
                              : 'Belum Quotation'}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={ord.status} />
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/customer/orders/${ord.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Detail / PO
                            </Link>
                          </td>
                        </tr>
                      );
                    })
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
