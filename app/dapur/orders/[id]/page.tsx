import { requireAuth } from '@/lib/auth';
import { getPostgresOrderById } from '@/lib/postgres-services';
import { getOrderById } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DapurOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAuth(['dapur', 'admin', 'master_admin']);
  const { id } = await params;
  const qParams = await searchParams;
  const order = (await getPostgresOrderById(id)) || getOrderById(id);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-lg text-red-600">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const dapur = order.dapurOrder || {
    kitchenStatus: 'waiting_cook',
    menu: `${order.orderDetails?.dapurAMasakan || 'Gulai & Sate'} / ${order.orderDetails?.dapurANasiBox || 'Nasi Box'}`,
    portion: 'Sesuai pesanan',
    cookingSchedule: `${order.orderDetails?.deliveryDate || 'Segera'} 07:30 WIB`,
    notes: order.orderDetails?.dapurANote || '',
  };

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="DETAIL OPERASIONAL DAPUR"
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
                  dapur.kitchenStatus === 'packed' ? 'bg-indigo-100 text-indigo-900 border-indigo-600' :
                  dapur.kitchenStatus === 'cooking' ? 'bg-purple-100 text-purple-900 border-purple-600' :
                  'bg-amber-100 text-amber-900 border-amber-600'
                }`}>
                  Status Dapur: {dapur.kitchenStatus}
                </span>
              </div>
              <h2 className="text-2xl font-bold uppercase text-[#2c1609]">{order.atasNama}</h2>
              <p className="text-xs text-[#775847] mt-1">
                Jadwal Masak: {dapur.cookingSchedule}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/documents/orders/${order.id}/dapur-a`}
                target="_blank"
                className="px-4 py-2.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">print</span>
                PO Dapur A
              </Link>
              <Link
                href={`/documents/orders/${order.id}/dapur-r`}
                target="_blank"
                className="px-4 py-2.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">print</span>
                PO Dapur R
              </Link>
              <Link
                href="/dapur/dashboard"
                className="px-4 py-2.5 bg-gray-200 text-[#2c1609] brutalist-btn text-xs font-bold"
              >
                ← Kembali ke Daftar Dapur
              </Link>
            </div>
          </div>

          {/* Update Status Dapur Form */}
          <div className="brutalist-card p-6 bg-purple-50 border-2 border-purple-600 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-900">
              UPDATE STATUS & CATATAN PRODUKSI DAPUR
            </h4>
            <form action={`/api/dapur/${order.id}/update`} method="POST" className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-900 mb-1">Status Dapur</label>
                <select name="kitchenStatus" defaultValue={dapur.kitchenStatus} className="w-full brutalist-input text-sm font-medium bg-white">
                  <option value="waiting_cook">Waiting Cook (Menunggu Masak)</option>
                  <option value="cooking">Cooking (Sedang Dimasak)</option>
                  <option value="packed">Packed (Packing Selesai)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-900 mb-1">Catatan Dapur</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={dapur.notes || ''}
                  placeholder="Contoh: Tingkat kepedasan sedang, siap packing"
                  className="w-full brutalist-input text-sm font-medium bg-white"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-6 bg-purple-600 text-white brutalist-btn text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Simpan Status Dapur
                </button>
              </div>
            </form>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="brutalist-card p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
                1. INFORMASI ORDER & PENGIRIMAN
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong className="text-[#775847]">No Invoice:</strong> <span className="font-mono font-bold text-[#865300]">{order.vendorInvoiceNo}</span></p>
                <p><strong className="text-[#775847]">Atas Nama (Shohibul):</strong> <span className="font-bold">{order.atasNama}</span></p>
                <p><strong className="text-[#775847]">No WhatsApp:</strong> {order.orderDetails?.phone}</p>
                <p><strong className="text-[#775847]">Penerima Tujuan:</strong> {order.orderDetails?.recipientName}</p>
                <p><strong className="text-[#775847]">Alamat Pengiriman:</strong> {order.orderDetails?.address}</p>
                <p><strong className="text-[#775847]">Jadwal Kirim:</strong> {order.orderDetails?.deliveryDate} ({order.orderDetails?.deliveryTime})</p>
              </div>
            </div>

            <div className="brutalist-card p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
                2. KEBUTUHAN MENU & PRODUKSI DAPUR
              </h4>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-[#f8f9fa] border-2 border-[#775847] space-y-1">
                  <p><strong className="text-[#775847]">Masakan Dapur A:</strong> <span className="font-bold">{order.orderDetails?.dapurAMasakan || '-'}</span></p>
                  <p><strong className="text-[#775847]">Nasi Box Dapur A:</strong> <span className="font-bold">{order.orderDetails?.dapurANasiBox || '-'}</span></p>
                  <p><strong className="text-[#775847]">Masakan Dapur R:</strong> <span className="font-bold">{order.orderDetails?.dapurRMasakan || '-'}</span></p>
                  <p><strong className="text-[#775847]">Nasi Box Dapur R:</strong> <span className="font-bold">{order.orderDetails?.dapurRNasiBox || '-'}</span></p>
                </div>
                <div className="space-y-1">
                  <p><strong className="text-[#775847]">Catatan Dapur:</strong></p>
                  <p className="p-3 bg-purple-50 border border-purple-300 text-xs font-medium text-purple-950">
                    {dapur.notes || 'Tidak ada catatan dapur.'}
                  </p>
                </div>

                {order.orderDetails?.pesanDapurA && (
                  <div className="space-y-1">
                    <p><strong className="text-[#775847]">Pesan Khusus untuk Dapur A:</strong></p>
                    <p className="p-3 bg-purple-100/70 border border-purple-600/40 rounded-xl text-xs font-bold text-purple-950">
                      {order.orderDetails.pesanDapurA}
                    </p>
                  </div>
                )}

                {order.orderDetails?.pesanDapurR && (
                  <div className="space-y-1">
                    <p><strong className="text-[#775847]">Pesan Khusus untuk Dapur R:</strong></p>
                    <p className="p-3 bg-purple-100/70 border border-purple-600/40 rounded-xl text-xs font-bold text-purple-950">
                      {order.orderDetails.pesanDapurR}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
