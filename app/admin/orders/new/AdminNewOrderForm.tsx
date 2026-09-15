'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DeliverySlotPicker } from '@/components/ui/DeliverySlotPicker';

export function AdminNewOrderForm() {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalPelunasan, setTotalPelunasan] = useState(2500000);
  const [totalBayar, setTotalBayar] = useState(500000);

  const sisaBayar = Math.max(0, totalPelunasan - totalBayar);

  return (
    <form action="/api/orders/create" method="POST" className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-8 shadow-sm">
      <div className="border-b border-stone-100 pb-4">
        <span className="text-xs font-semibold text-amber-800 tracking-wider uppercase">Formulir Pesanan Manual</span>
        <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-0.5">Input Pesanan Offline / Vendor</h3>
        <p className="text-xs text-stone-500 mt-1">Nominal harga langsung otomatis menjadi tagihan resmi pesanan tanpa melalui negosiasi ulang.</p>
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
            Nama Pemesan *
          </label>
          <input
            type="text"
            name="atasNama"
            required
            placeholder="Contoh: Baruna Dwi Cahya"
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Ayah *</label>
            <input type="text" name="fatherName" required placeholder="Contoh: Budi Santoso" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Ibu *</label>
            <input type="text" name="motherName" required placeholder="Contoh: Siti Aminah" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Nama Anak *</label>
          <input type="text" name="childName" required placeholder="Contoh: Muhammad Almeera" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
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
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Tanggal Pengiriman *</label>
          <input
            type="date"
            name="deliveryDate"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Jam Pengiriman / Slot Waktu *</label>
          <DeliverySlotPicker deliveryDate={deliveryDate} />
        </div>
      </div>

      {/* Section 3 */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-900/10">
          3. Detail Pesanan (Kandang & Dapur)
        </h4>
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Pesanan Kambing / Domba *</label>
          <input type="text" name="animalOrder" required defaultValue="1 Ekor Kambing Jantan Super" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
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
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Pesanan Lainnya (Opsional)</label>
          <textarea name="pesananLainnya" rows={2} placeholder="Contoh: Snack, minuman, buah, kerupuk, atau tambahan menu lainnya" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium"></textarea>
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
            <input type="number" name="totalPelunasan" value={totalPelunasan} onChange={(e) => setTotalPelunasan(Number(e.target.value) || 0)} min="0" required className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Total Bayar (Rp)</label>
            <input type="number" name="totalBayar" value={totalBayar} onChange={(e) => setTotalBayar(Number(e.target.value) || 0)} min="0" max={totalPelunasan} className="w-full border border-stone-300 rounded-xl px-4 py-2.5 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm">
          <div><span className="text-xs text-stone-500 block">Total Harga</span><strong>Rp {totalPelunasan.toLocaleString('id-ID')}</strong></div>
          <div><span className="text-xs text-stone-500 block">Sudah Dibayar</span><strong className="text-emerald-700">Rp {totalBayar.toLocaleString('id-ID')}</strong></div>
          <div><span className="text-xs text-stone-500 block">Sisa Pembayaran</span><strong className="text-amber-800">Rp {sisaBayar.toLocaleString('id-ID')}</strong></div>
        </div>
        <div className="space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-700">Pesan Operasional Internal</h5>
          <p className="text-xs text-stone-500">Catatan ini hanya untuk tim internal dan tidak menambah total tagihan customer.</p>
          <textarea name="pesanKandang" rows={2} placeholder="Pesan untuk tim kandang" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm" />
          <textarea name="pesanDapurA" rows={2} placeholder="Pesan untuk Dapur A" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm" />
          <textarea name="pesanDapurR" rows={2} placeholder="Pesan untuk Dapur R" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm" />
          <textarea name="pesanDriver" rows={2} placeholder="Pesan untuk driver" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm" />
          <input type="number" name="uangSakuDriver" min="0" defaultValue="0" placeholder="Uang saku driver (internal)" className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm" />
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
  );
}
