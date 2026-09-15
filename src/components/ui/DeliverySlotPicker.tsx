'use client';

import React, { useState, useEffect } from 'react';

interface DeliverySlotPickerProps {
  deliveryDate: string;
  selectedTime?: string;
  excludeOrderId?: string;
  onChange?: (time: string) => void;
}

const HOURLY_SLOTS = [
  '07.00 WIB', '08.00 WIB', '09.00 WIB', '10.00 WIB', '11.00 WIB',
  '12.00 WIB', '13.00 WIB', '14.00 WIB', '15.00 WIB', '16.00 WIB', '17.00 WIB'
];

export function DeliverySlotPicker({ deliveryDate, selectedTime = '', excludeOrderId, onChange }: DeliverySlotPickerProps) {
  const [capacities, setCapacities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(selectedTime);

  useEffect(() => {
    if (!deliveryDate) return;
    queueMicrotask(() => setLoading(true));
    const qs = `/api/orders/slots?date=${encodeURIComponent(deliveryDate)}${excludeOrderId ? `&exclude=${encodeURIComponent(excludeOrderId)}` : ''}`;
    fetch(qs, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.slots) {
          setCapacities(data.slots);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [deliveryDate, excludeOrderId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentTime(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="space-y-1.5">
      <select
        name="deliveryTime"
        required
        disabled={!deliveryDate || loading}
        value={currentTime}
        onChange={handleChange}
        className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
      >
        <option value="">{loading ? 'Memuat slot...' : 'Pilih jam pengiriman ▼'}</option>
        {HOURLY_SLOTS.map(slot => {
          const count = capacities[slot] !== undefined ? capacities[slot] : 0;
          const isFull = count >= 2;
          let label = slot;
          if (isFull) {
            label = `${slot} — Penuh`;
          } else if (count === 1) {
            label = `${slot} — Tersedia 1/2`;
          } else {
            label = `${slot} — Tersedia`;
          }

          return (
            <option key={slot} value={slot} disabled={isFull}>
              {label}
            </option>
          );
        })}
      </select>
      {!deliveryDate ? (
        <p className="text-[11px] text-amber-700 italic">Pilih tanggal pengiriman terlebih dahulu.</p>
      ) : (
        <p className="text-[11px] text-stone-500">Pilih jam pengiriman (07.00 s.d. 17.00 WIB). Kapasitas maksimal 2 order per slot.</p>
      )}
    </div>
  );
}
