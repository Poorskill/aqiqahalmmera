'use client';

import React from 'react';
import Link from 'next/link';

export function PaymentActionCell({ paymentId, orderId, status }: { paymentId: string; orderId: string; status: string }) {
  if (status !== 'waiting_verification') {
    return (
      <Link
        href={`/customer/orders/${orderId}`}
        className="text-xs font-semibold text-stone-600 hover:text-stone-900"
      >
        Detail Order →
      </Link>
    );
  }

  const handleReject = async () => {
    const reason = prompt('Masukkan alasan penolakan pembayaran:');
    if (!reason) return;

    const formData = new FormData();
    formData.append('action', 'reject');
    formData.append('rejectionReason', reason);

    const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok || res.redirected) {
      window.location.href = res.url || '/admin/payments?success=Pembayaran+ditolak';
    } else {
      window.location.reload();
    }
  };

  const handleVerify = async () => {
    const formData = new FormData();
    formData.append('action', 'verify');

    const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok || res.redirected) {
      window.location.href = res.url || '/admin/payments?success=Pembayaran+berhasil+diverifikasi';
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={handleVerify}
        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">check</span>
        <span>Verify</span>
      </button>
      <button
        type="button"
        onClick={handleReject}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">close</span>
        <span>Reject</span>
      </button>
    </div>
  );
}
