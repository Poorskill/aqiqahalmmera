import { requireAuth } from '@/lib/auth';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminNewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuth(['admin']);
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Pesanan Manual Admin" subtitle="Input Pesanan Baru via Operator" role={user.role} />

        <main className="p-8 max-w-4xl mx-auto w-full">
          {params.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{params.error}</span>
            </div>
          )}

          <form action="/api/orders/create" method="POST" className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-8 shadow-sm">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-semibold text-amber-800 tracking-wider uppercase">Formulir Pesanan Manual</span>
              <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">Input Pesanan Offline / Vendor</h3>
            </div>

            {/* Section 1 */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-900/10">
                1. Informasi Utama Pesanan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    No Invoice Vendor / Manual
                  </label>
                  <input
                    type="text"
                    name="invoiceNo"
                    placeholder="INV-MGR-2026-XXX"
                    className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Jenis Order *
                  </label>
                  <select name="jenisOrder" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium">
                    <option value="aqiqah">Aqiqah</option>
                    <option value="nazar">Nazar</option>
                    <option value="tasyakuran">Tasyakuran</option>
                    <option value="catering">Catering</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Atas Nama (Shohibul / Anak) *
                </label>
                <input
                  type="text"
                  name="atasNama"
                  required
                  placeholder="Ananda ..."
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Ayah & Ibu *</label>
                  <input type="text" name="parentName" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Anak *</label>
                  <input type="text" name="childName" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-900/10">
                2. Data Pengiriman
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Penerima *</label>
                  <input type="text" name="recipientName" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">No HP / WhatsApp *</label>
                  <input type="text" name="phone" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Alamat Pengiriman *</label>
                <textarea name="address" required rows={3} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Tanggal Pengiriman *</label>
                  <input type="date" name="deliveryDate" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Jam Pengiriman *</label>
                  <input type="text" name="deliveryTime" required defaultValue="09:00 WIB" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-900/10">
                3. Pesanan (Kandang & Dapur)
              </h4>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Pesanan Kambing / Domba *</label>
                <input type="text" name="animalOrder" required defaultValue="1 Ekor Kambing Jantan Super" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Keterangan Kandang</label>
                <input type="text" name="kandangNote" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Masakan Dapur A</label>
                  <input type="text" name="dapurAMasakan" defaultValue="Gulai Kambing 100 porsi" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nasi Box Dapur A</label>
                  <input type="text" name="dapurANasiBox" defaultValue="Nasi Box 100 porsi" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-900/10">
                4. Rincian Biaya
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Status Payment</label>
                  <select name="paymentStatus" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium">
                    <option value="dp">DP</option>
                    <option value="lunas">Lunas</option>
                    <option value="kurang">Kurang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Total Pelunasan (Rp)</label>
                  <input type="number" name="totalPelunasan" defaultValue={2500000} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Total Bayar (Rp)</label>
                  <input type="number" name="totalBayar" defaultValue={500000} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/admin/dashboard" className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all">
                Batal
              </Link>
              <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all">
                <span className="material-symbols-outlined text-base">save</span>
                Simpan Pesanan Manual
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
