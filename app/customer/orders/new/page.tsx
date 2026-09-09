import { requireAuth } from '@/lib/auth';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuth(['customer']);
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Buat Pesanan"
          subtitle="Formulir Pemesanan Aqiqah Almeera"
          role={user.role}
        />

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          {params.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{params.error}</span>
            </div>
          )}

          {/* Top Banner / Guidance */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 border border-amber-900/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 text-xs font-semibold rounded-full">
                <span className="material-symbols-outlined text-sm">post_add</span>
                Formulir Pemesanan Resmi
              </span>
              <h3 className="text-xl font-bold tracking-tight text-stone-900">Form Input Order Aqiqah Almeera</h3>
              <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
                Lengkapi data shohibul, informasi pengiriman, dan pesanan menu aqiqah Anda. Pesanan akan segera ditinjau dan dihitung oleh tim admin kami.
              </p>
            </div>
            <Link
              href="/customer/orders"
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all shrink-0"
            >
              ← Kembali ke Pesanan
            </Link>
          </div>

          <form action="/api/orders/create" method="POST" className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-8 shadow-sm">
            {/* 1. Main Order Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Informasi Utama Pesanan
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    No Invoice <span className="text-stone-400 font-normal">(Opsional / Manual)</span>
                  </label>
                  <input
                    type="text"
                    name="invoiceNo"
                    placeholder="Kosongkan untuk generate otomatis"
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Jenis Order <span className="text-amber-600">*</span>
                  </label>
                  <select
                    name="jenisOrder"
                    required
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  >
                    <option value="aqiqah">Aqiqah</option>
                    <option value="nazar">Nazar</option>
                    <option value="tasyakuran">Tasyakuran</option>
                    <option value="catering">Catering</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Atas Nama <span className="text-amber-600">*</span> <span className="text-stone-400 font-normal">(Shohibul / Nama Anak)</span>
                </label>
                <input
                  type="text"
                  name="atasNama"
                  required
                  placeholder="Contoh: Ananda Muhammad Almeera"
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nama Ayah & Ibu <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    required
                    placeholder="Contoh: Budi Santoso & Siti Aminah"
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nama Lengkap Anak <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="childName"
                    required
                    placeholder="Contoh: Muhammad Almeera"
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Data Pengiriman */}
            <div className="space-y-5 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Data Pengiriman & Kontak
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nama Penerima Tujuan <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    required
                    defaultValue={user.name}
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    No HP / WhatsApp <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={user.phone}
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Alamat Pengiriman Lengkap <span className="text-amber-600">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Contoh: Jl. Flores No. 28, RT 02/RW 04, Cilacap Tengah"
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Tanggal Pengiriman <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    required
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Jam Pengiriman / Estimasi <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="deliveryTime"
                    required
                    placeholder="Contoh: 09:00 WIB"
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pesanan (Kandang & Dapur) */}
            <div className="space-y-5 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Detail Pesanan (Kandang & Dapur)
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pesanan Kambing / Domba (Kandang) <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  name="animalOrder"
                  required
                  placeholder="Contoh: 1 Ekor Kambing Jantan Super"
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Keterangan Kandang <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="kandangNote"
                  placeholder="Contoh: Minta dikirim tanduknya / kepala utuh"
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Masakan Kambing Dapur A <span className="text-stone-400 font-normal">(Gulai/Sate/Semur)</span>
                  </label>
                  <input
                    type="text"
                    name="dapurAMasakan"
                    placeholder="Contoh: Gulai Kambing 100 porsi"
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Menu Nasi Box Dapur A
                  </label>
                  <input
                    type="text"
                    name="dapurANasiBox"
                    placeholder="Contoh: Nasi Box 100 porsi"
                    className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Keterangan Dapur A <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="dapurANote"
                  placeholder="Contoh: Tingkat kepedasan sedang, pisahkan sambal"
                  className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                />
              </div>
            </div>

            {/* 4. Ringkasan Pesanan & Informasi Harga */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Ringkasan Pesanan & Informasi Harga
                </h4>
              </div>

              <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-amber-900">Total Harga Pesanan:</span>
                  <span className="font-bold font-mono text-amber-950 text-sm">Akan dikonfirmasi oleh admin</span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  * Harga final, penawaran resmi (Quotation), dan instruksi pembayaran DP baru akan dikirimkan oleh admin setelah pesanan Anda direview. Alur: <strong className="font-semibold">Order → Admin Review → Quotation → Customer Approve → Pembayaran</strong>.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-4">
              <Link
                href="/customer/dashboard"
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all"
              >
                Batal
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>Ajukan Pesanan ke Admin</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
