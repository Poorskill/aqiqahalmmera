'use client';

import { useState } from 'react';

interface DeleteOrderButtonProps {
  orderId: string;
  vendorInvoiceNo: string;
  customerName: string;
  deliveryDate?: string;
  status: string;
  hasVerifiedPayment?: boolean;
  isDeliveryOrCompleted?: boolean;
  redirectTo?: string;
}

const REASON_OPTIONS = [
  'Kesalahan input data',
  'Pesanan duplikat',
  'Permintaan pembatalan pelanggan',
  'Data uji coba / testing',
  'Lainnya',
];

export function DeleteOrderButton({
  orderId,
  vendorInvoiceNo,
  customerName,
  deliveryDate,
  status,
  hasVerifiedPayment = false,
  isDeliveryOrCompleted = false,
  redirectTo = '/admin/orders',
}: DeleteOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBlocked = hasVerifiedPayment || isDeliveryOrCompleted;
  const blockMessage = hasVerifiedPayment
    ? 'Pesanan tidak dapat dihapus karena memiliki pembayaran yang telah diverifikasi (ledger keuangan).'
    : isDeliveryOrCompleted
    ? 'Pesanan tidak dapat dihapus karena sudah dalam proses pengiriman atau telah selesai.'
    : '';

  const effectiveReason = selectedReason === 'Lainnya'
    ? customReason.trim()
    : `${selectedReason}${customReason.trim() ? `: ${customReason.trim()}` : ''}`;

  const isConfirmationValid = confirmInput.trim() === vendorInvoiceNo.trim();
  const isReasonValid = effectiveReason.length >= 3;
  const canDelete = isConfirmationValid && isReasonValid && !isBlocked;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
        title="Hapus Pesanan (Khusus Master Admin)"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
        Hapus Pesanan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Hapus Pesanan</h3>
                  <p className="text-xs text-stone-500">Tindakan khusus kewenangan Master Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setConfirmInput('');
                  setCustomReason('');
                }}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* If Blocked */}
            {isBlocked ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
                  <span className="material-symbols-outlined text-base text-amber-700 shrink-0 mt-0.5">block</span>
                  <div>
                    <strong className="font-semibold block mb-1">Penghapusan Ditolak Sistem</strong>
                    <span>{blockMessage}</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmation Form */
              <form
                action={`/api/admin/orders/${orderId}/delete`}
                method="POST"
                onSubmit={() => setIsSubmitting(true)}
                className="space-y-4"
              >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="reason" value={effectiveReason} />

                {/* Summary Info */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nomor Invoice:</span>
                    <span className="font-mono font-bold text-amber-900">{vendorInvoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nama Pemesan:</span>
                    <span className="font-semibold text-stone-900">{customerName}</span>
                  </div>
                  {deliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Jadwal Pengiriman:</span>
                      <span className="text-stone-800">{deliveryDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-500">Status Saat Ini:</span>
                    <span className="font-semibold uppercase text-amber-800">{status}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Tindakan ini akan menonaktifkan pesanan secara permanen dari antrian operasional dan melepaskan kapasitas slot pengiriman. Data dicatat dalam audit log sistem.
                </p>

                {/* Alasan Penghapusan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800">
                    Alasan Penghapusan <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    {REASON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder={selectedReason === 'Lainnya' ? 'Tuliskan alasan spesifik...' : 'Catatan tambahan (opsional)...'}
                    required={selectedReason === 'Lainnya'}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                {/* Konfirmasi Invoice */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800">
                    Ketik nomor invoice <span className="font-mono text-amber-900 font-bold">&quot;{vendorInvoiceNo}&quot;</span> untuk konfirmasi: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="confirmation"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={vendorInvoiceNo}
                    autoComplete="off"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                  {confirmInput && !isConfirmationValid && (
                    <p className="text-[11px] text-red-600">Nomor invoice belum cocok.</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setConfirmInput('');
                      setCustomReason('');
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!canDelete || isSubmitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isSubmitting ? 'hourglass_empty' : 'delete_forever'}
                    </span>
                    {isSubmitting ? 'Memproses...' : 'Hapus Pesanan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
