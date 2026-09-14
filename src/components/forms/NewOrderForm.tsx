'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DeliverySlotPicker } from '@/components/ui/DeliverySlotPicker';

export function NewOrderForm({ user, initialData, orderId }: { user: any; initialData?: any; orderId?: string }) {
  const isEdit = Boolean(orderId);
  const [deliveryDate, setDeliveryDate] = useState(initialData?.orderDetails?.deliveryDate || '');

  return (
    <form action={isEdit ? `/api/orders/${orderId}/update` : "/api/orders/create"} method="POST" className="bg-white border border-stone-200/80 rounded-2xl p-8 space-y-8 shadow-sm">
      {/* Section 1: Informasi Utama */}
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
              Jenis Order <span className="text-amber-600">*</span>
            </label>
            <select
              name="jenisOrder"
              required
              defaultValue={initialData?.jenisOrder || 'aqiqah'}
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
            Nama Pemesan <span className="text-amber-600">*</span>
          </label>
          <input
            type="text"
            name="atasNama"
            required
            defaultValue={initialData?.atasNama || ''}
            placeholder="Contoh: Baruna Dwi Cahya"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Nama Ayah <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              name="fatherName"
              required
              defaultValue={initialData?.orderDetails?.fatherName || ''}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Nama Ibu <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              name="motherName"
              required
              defaultValue={initialData?.orderDetails?.motherName || ''}
              placeholder="Contoh: Siti Aminah"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Nama Lengkap Anak <span className="text-amber-600">*</span>
          </label>
          <input
            type="text"
            name="childName"
            required
            defaultValue={initialData?.orderDetails?.childName || ''}
            placeholder="Contoh: Muhammad Almeera"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>
      </div>

      {/* Section 2: Data Pengiriman */}
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
              defaultValue={initialData?.orderDetails?.recipientName || user?.name || ''}
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
              defaultValue={initialData?.orderDetails?.phone || user?.phone || ''}
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
            defaultValue={initialData?.orderDetails?.address || ''}
            placeholder="Contoh: Jl. Flores No. 28, RT 02/RW 04, Cilacap Tengah"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Tanggal Pengiriman <span className="text-amber-600">*</span>
          </label>
          <input
            type="date"
            name="deliveryDate"
            required
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Jam Pengiriman / Slot Waktu <span className="text-amber-600">*</span>
          </label>
          <DeliverySlotPicker deliveryDate={deliveryDate} selectedTime={initialData?.orderDetails?.deliveryTime || ''} excludeOrderId={orderId} />
        </div>
      </div>

      {/* Section 3: Detail Pesanan (Kandang & Dapur) */}
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
            defaultValue={initialData?.orderDetails?.animalOrder || ''}
            placeholder="Contoh: 1 Ekor Kambing Jantan Super"
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
              defaultValue={initialData?.orderDetails?.dapurAMasakan || ''}
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
              defaultValue={initialData?.orderDetails?.dapurANasiBox || ''}
              placeholder="Contoh: Nasi Box 100 porsi"
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Pesanan Lainnya <span className="text-stone-400 font-normal">(Opsional)</span>
          </label>
          <textarea
            name="pesananLainnya"
            rows={2}
            defaultValue={initialData?.orderDetails?.pesananLainnya || ''}
            placeholder="Contoh: Snack, minuman, buah, kerupuk, atau tambahan menu lainnya"
            className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          ></textarea>
        </div>
      </div>

      {/* Section 4: Ringkasan Pesanan */}
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
            <span className="font-bold font-mono text-amber-950 text-sm">{isEdit ? `Rp ${(initialData?.quotation?.price || initialData?.quotationPrice || initialData?.orderDetails?.totalPelunasan || 0).toLocaleString('id-ID')}` : 'Akan dikonfirmasi oleh admin'}</span>
          </div>
          <p className="text-amber-900 leading-relaxed">
            {isEdit
              ? '* Perubahan detail pesanan disimpan langsung. Sesuaikan nilai total tagihan di bawah jika perubahan order memengaruhi harga.'
              : '* Harga final, penawaran resmi (Quotation), dan instruksi pembayaran DP baru akan dikirimkan oleh admin setelah pesanan Anda direview.'}
          </p>
        </div>

        {isEdit && (
          <div className="p-4 bg-white border border-amber-300 rounded-xl space-y-2 mt-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
              Penyesuaian Total Tagihan / Quotation (Rp) *
            </label>
            <input
              type="number"
              name="quotationPrice"
              required
              defaultValue={initialData?.quotation?.price || initialData?.quotationPrice || initialData?.orderDetails?.totalPelunasan || 2500000}
              className="w-full md:w-1/2 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="text-[11px] text-stone-600">
              * Perubahan nilai ini akan menghitung selisih terhadap tagihan lama dan menyesuaikan sisa pembayaran tanpa mengubah riwayat pembayaran terverifikasi.
            </p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-4">
        <Link
          href={isEdit ? `/customer/orders/${orderId}` : "/customer/dashboard"}
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all"
        >
          Batal
        </Link>
        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-base">{isEdit ? 'save' : 'send'}</span>
          <span>{isEdit ? 'Simpan Perubahan Pesanan' : 'Ajukan Pesanan ke Admin'}</span>
        </button>
      </div>
    </form>
  );
}
