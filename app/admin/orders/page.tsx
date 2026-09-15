import { requireAuth } from '@/lib/auth';
import { getPostgresOrders } from '@/lib/postgres-services';
import { getAllOrders } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const user = await requireAuth(['admin', 'master_admin']);
  const params = await searchParams;
  let orders = await getPostgresOrders({ search: params.search, status: params.status });
  if (!orders || orders.length === 0) {
    orders = getAllOrders({ search: params.search, status: params.status });
  }

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="MANAJEMEN PESANAN"
          subtitle="SEMUA PESANAN AQIQAH ALMEERA CILACAP"
          role={user.role}
        />

        <main className="p-8 space-y-6">
          {/* Filters & Search */}
          <div className="brutalist-card p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <form method="GET" className="flex items-center gap-3 w-full md:w-auto flex-1">
              <input
                type="text"
                name="search"
                defaultValue={params.search || ''}
                placeholder="Cari invoice atau atas nama..."
                className="brutalist-input text-sm font-medium flex-1 max-w-md"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold"
              >
                Cari
              </button>
            </form>
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Link
                href="/admin/orders/new"
                className="px-4 py-2.5 bg-[#865300] text-white brutalist-btn text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">post_add</span>
                + Pesanan Manual
              </Link>
            </div>
          </div>

          {/* Orders Table */}
          <div className="brutalist-card p-6 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#775847] text-xs font-bold text-[#775847] uppercase">
                    <th className="p-3">No Invoice</th>
                    <th className="p-3">Tanggal Pengiriman</th>
                    <th className="p-3">Atas Nama</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Total Biaya</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#775847]/10 text-sm">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#f3f4f5]">
                      <td className="p-3 font-mono font-bold text-[#865300]">{ord.vendorInvoiceNo}</td>
                      <td className="p-3 font-medium">{ord.orderDetails?.deliveryDate || '-'}</td>
                      <td className="p-3 font-bold">{ord.atasNama}</td>
                      <td className="p-3 uppercase font-medium">{ord.jenisOrder}</td>
                      <td className="p-3 font-mono font-bold">
                        {ord.quotationPrice ? `Rp ${ord.quotationPrice.toLocaleString('id-ID')}` : 'Belum Quotation'}
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
