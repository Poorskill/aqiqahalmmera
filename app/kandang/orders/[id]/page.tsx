import { requireAuth } from '@/lib/auth';
import { getOrderById } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KandangOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAuth(['kandang', 'admin', 'master_admin']);
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

  const kandang = order.kandangOrder || {
    prepStatus: 'pending',
    animalType: order.orderDetails?.animalOrder || 'Kambing Standar',
    animalQty: 1,
    slaughterSchedule: `${order.orderDetails?.deliveryDate || 'Segera'} 06:00 WIB`,
    notes: order.orderDetails?.kandangNote || '',
  };

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="DETAIL OPERASIONAL KANDANG"
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
                  kandang.prepStatus === 'slaughtered' ? 'bg-emerald-100 text-emerald-900 border-emerald-600' :
                  kandang.prepStatus === 'ready' ? 'bg-yellow-100 text-yellow-900 border-yellow-600' :
                  'bg-amber-100 text-amber-900 border-amber-600'
                }`}>
                  Status Kandang: {kandang.prepStatus}
                </span>
              </div>
              <h2 className="text-2xl font-bold uppercase text-[#2c1609]">{order.atasNama}</h2>
              <p className="text-xs text-[#775847] mt-1">
                Jenis Order: <span className="uppercase font-bold">{order.jenisOrder}</span> | Tanggal Sembelih: {kandang.slaughterSchedule}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/documents/orders/${order.id}/kandang`}
                target="_blank"
                className="px-4 py-2.5 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">print</span>
                Cetak PO Kandang
              </Link>
              <Link
                href="/kandang/dashboard"
                className="px-4 py-2.5 bg-gray-200 text-[#2c1609] brutalist-btn text-xs font-bold"
              >
                ← Kembali ke Daftar Tugas
              </Link>
            </div>
          </div>

          {/* Update Status Kandang Form */}
          <div className="brutalist-card p-6 bg-amber-50 border-2 border-amber-600 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-900">
              UPDATE STATUS & CATATAN PERSIAPAN KANDANG
            </h4>
            <form action={`/api/kandang/${order.id}/update`} method="POST" className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-amber-900 mb-1">Status Persiapan</label>
                <select name="prepStatus" defaultValue={kandang.prepStatus} className="w-full brutalist-input text-sm font-medium bg-white">
                  <option value="pending">Pending (Menunggu Persiapan)</option>
                  <option value="ready">Ready (Hewan Siap & Dipilih)</option>
                  <option value="slaughtered">Slaughtered (Selesai Disembelih)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-amber-900 mb-1">Catatan Lapangan Kandang</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={kandang.notes || ''}
                  placeholder="Contoh: Berat 30kg, kondisi sehat walafiat"
                  className="w-full brutalist-input text-sm font-medium bg-white"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-6 bg-amber-600 text-white brutalist-btn text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Simpan Update Kandang
                </button>
              </div>
            </form>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Informasi Order */}
            <div className="brutalist-card p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
                1. INFORMASI ORDER & PENGIRIMAN
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong className="text-[#775847]">No Invoice:</strong> <span className="font-mono font-bold text-[#865300]">{order.vendorInvoiceNo}</span></p>
                <p><strong className="text-[#775847]">Nama Pemesan:</strong> {order.customer?.name}</p>
                <p><strong className="text-[#775847]">No WhatsApp:</strong> {order.orderDetails?.phone}</p>
                <p><strong className="text-[#775847]">Atas Nama (Shohibul):</strong> <span className="font-bold">{order.atasNama}</span></p>
                <p><strong className="text-[#775847]">Nama Ayah & Ibu:</strong> {order.orderDetails?.parentName}</p>
                <p><strong className="text-[#775847]">Nama Anak:</strong> {order.orderDetails?.childName}</p>
                <p><strong className="text-[#775847]">Penerima Tujuan:</strong> {order.orderDetails?.recipientName}</p>
                <p><strong className="text-[#775847]">Alamat Pengiriman:</strong> {order.orderDetails?.address}</p>
                <p><strong className="text-[#775847]">Jadwal Kirim:</strong> {order.orderDetails?.deliveryDate} ({order.orderDetails?.deliveryTime})</p>
              </div>
            </div>

            {/* 2. Kebutuhan & Detail Hewan Kandang */}
            <div className="brutalist-card p-6 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
                2. KEBUTUHAN & SPESIFIKASI HEWAN
              </h4>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-[#f8f9fa] border-2 border-[#775847] space-y-1">
                  <p><strong className="text-[#775847]">Jenis Hewan:</strong> <span className="font-bold text-base text-[#2c1609]">{kandang.animalType}</span></p>
                  <p><strong className="text-[#775847]">Jumlah:</strong> <span className="font-mono font-bold">{kandang.animalQty} Ekor</span></p>
                  <p><strong className="text-[#775847]">Jadwal Sembelih:</strong> {kandang.slaughterSchedule}</p>
                </div>

                <div className="space-y-1">
                  <p><strong className="text-[#775847]">Catatan / Permintaan Khusus:</strong></p>
                  <p className="p-3 bg-amber-50 border border-amber-500 text-xs font-medium text-amber-950">
                    {kandang.notes || order.orderDetails?.kandangNote || 'Tidak ada catatan khusus.'}
                  </p>
                </div>

                {order.orderDetails?.pesanKandang && (
                  <div className="space-y-1">
                    <p><strong className="text-[#775847]">Pesan Khusus dari Admin (Kandang):</strong></p>
                    <p className="p-3 bg-amber-100/70 border border-amber-600/40 text-xs font-bold text-amber-950 rounded-xl">
                      {order.orderDetails.pesanKandang}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Operational Checklist */}
          <div className="brutalist-card p-6 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#865300] border-b-2 border-[#775847] pb-2">
              3. CHECKLIST OPERASIONAL KANDANG
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium">
              <div className="p-3 border-2 border-[#775847] bg-[#f8f9fa] flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span>Hewan tersedia di kandang</span>
              </div>
              <div className="p-3 border-2 border-[#775847] bg-[#f8f9fa] flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span>Kondisi hewan sehat & cukup umur</span>
              </div>
              <div className="p-3 border-2 border-[#775847] bg-[#f8f9fa] flex items-center gap-3">
                <span className={`material-symbols-outlined ${kandang.prepStatus === 'slaughtered' ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {kandang.prepStatus === 'slaughtered' ? 'check_circle' : 'radio_button_unfilled'}
                </span>
                <span>Penyembelihan sesuai syariat</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
