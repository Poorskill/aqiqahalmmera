import { requireAuth } from '@/lib/auth';
import { getOrderById } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DriverOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAuth(['driver', 'admin']);
  const { id } = await params;
  const qParams = await searchParams;
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-lg text-red-600">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const driver = order.driverOrder || {
    status: 'assigned',
    deliveryAddress: order.orderDetails?.address || '',
    contactPerson: order.orderDetails?.recipientName || order.atasNama,
    deliverySchedule: `${order.orderDetails?.deliveryDate || ''} ${order.orderDetails?.deliveryTime || ''}`,
  };

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="DETAIL PENGANTARAN DRIVER"
          subtitle={`INVOICE: ${order.vendorInvoiceNo} (${order.atasNama})`}
          role={user.role}
        />

        <main className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {qParams.error && (
            <div className="p-4 bg-red-100 border-2 border-[#ba1a1a] text-[#ba1a1a] text-xs font-bold uppercase tracking-wider">
              {qParams.error}
            </div>
          )}
          {qParams.success && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              {qParams.success}
            </div>
          )}

          {/* Top Summary & Actions */}
          <div className="brutalist-card-lg p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold text-[#865300] bg-[#f3f4f5] px-2.5 py-1 border border-[#775847]">
                  {order.vendorInvoiceNo}
                </span>
                <span className={`px-3 py-1 text-xs font-bold uppercase border-2 ${
                  driver.status === 'delivered' ? 'bg-green-200 text-green-950 border-green-700' :
                  driver.status === 'on_delivery' ? 'bg-sky-100 text-sky-900 border-sky-600' :
                  'bg-amber-100 text-amber-900 border-amber-600'
                }`}>
                  Status Pengiriman: {driver.status}
                </span>
              </div>
              <h2 className="text-2xl font-bold uppercase text-[#2c1609]">{order.atasNama}</h2>
              <p className="text-xs text-[#775847] mt-1">
                Jadwal Kirim: {driver.deliverySchedule}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/documents/orders/${order.id}/driver`}
                target="_blank"
                className="px-4 py-2.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">print</span>
                Cetak PO Driver
              </Link>
              <Link
                href="/driver/dashboard"
                className="px-4 py-2.5 bg-gray-200 text-[#2c1609] brutalist-btn text-xs font-bold"
              >
                ← Kembali ke Tugas Driver
              </Link>
            </div>
          </div>

          {/* Update Status Driver Form */}
          <div className="brutalist-card p-6 bg-sky-50 border-2 border-sky-600 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-sky-900">
              UPDATE STATUS PENGIRIMAN & KONFIRMASI DRIVER
            </h4>
            <form action={`/api/driver/${order.id}/update`} method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-sky-900 mb-1">Status Pengiriman</label>
                <select name="status" defaultValue={driver.status} className="w-full brutalist-input text-sm font-medium bg-white">
                  <option value="assigned">Assigned (Ditugaskan)</option>
                  <option value="on_delivery">On Delivery (Dalam Perjalanan)</option>
                  <option value="delivered">Delivered (Terkirim / Selesai)</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-6 bg-sky-600 text-white brutalist-btn text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">local_shipping</span>
                  Simpan Status Pengiriman
                </button>
              </div>
            </form>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="brutalist-card p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
                1. INFORMASI PENERIMA & ALAMAT
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong className="text-[#775847]">No Invoice:</strong> <span className="font-mono font-bold text-[#865300]">{order.vendorInvoiceNo}</span></p>
                <p><strong className="text-[#775847]">Nama Kontak / Penerima:</strong> <span className="font-bold">{driver.contactPerson}</span></p>
                <p><strong className="text-[#775847]">No WhatsApp / Telepon:</strong> {order.orderDetails?.phone}</p>
                <p><strong className="text-[#775847]">Alamat Pengiriman Lengkap:</strong></p>
                <p className="p-3 bg-[#f8f9fa] border-2 border-[#775847] font-medium text-gray-800">
                  {driver.deliveryAddress}
                </p>
              </div>
            </div>

            <div className="brutalist-card p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
                2. DETAIL LOGISTIK & DRIVER
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong className="text-[#775847]">Jadwal Pengiriman:</strong> <span className="font-bold">{driver.deliverySchedule}</span></p>
                <p><strong className="text-[#775847]">Info Driver / Kendaraan:</strong> {order.orderDetails?.driverInfo || 'Ditugaskan ke Driver Almeera'}</p>
                <p><strong className="text-[#775847]">Uang Saku / Biaya Kirim:</strong> Rp {(order.orderDetails?.driverFee || 50000).toLocaleString('id-ID')}</p>
                <p><strong className="text-[#775847]">Status Payment Order:</strong> <span className="uppercase font-bold text-[#865300]">{order.orderDetails?.paymentStatus}</span></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
