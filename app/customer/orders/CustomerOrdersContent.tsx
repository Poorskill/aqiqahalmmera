'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';

const ACTIVE_STATUSES = [
  'waiting_review',
  'quotation_sent',
  'quotation_approved',
  'preparing',
  'slaughtering',
  'cooking',
  'packaging',
  'delivery',
];

export default function CustomerOrdersContent({ orders }: { orders: any[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const historyOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  const currentList = activeTab === 'active' ? activeOrders : historyOrders;

  const filteredOrders = currentList.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.vendorInvoiceNo?.toLowerCase().includes(term) ||
      o.atasNama?.toLowerCase().includes(term) ||
      o.jenisOrder?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 border border-amber-900/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 text-xs font-semibold rounded-full">
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Pusat Pesanan Customer
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-stone-900">Kelola Pesanan & Lacak Progress</h3>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            Semua pesanan aktif, penawaran harga, proses kandang & dapur, serta riwayat tersimpan rapi di sini.
          </p>
        </div>
        <Link
          href="/customer/orders/new"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Buat Pesanan Baru
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">hourglass_top</span>
              <span>Pesanan Aktif ({activeOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">history</span>
              <span>Riwayat Pesanan ({historyOrders.length})</span>
            </button>
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 material-symbols-outlined text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Cari No Invoice / Atas Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50/50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-300 rounded-2xl p-8 bg-stone-50/50 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">
                {activeTab === 'active' ? 'receipt_long' : 'history'}
              </span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-base">
                {activeTab === 'active' ? 'Belum ada pesanan aktif' : 'Belum ada riwayat pesanan'}
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'active'
                  ? 'Semua pesanan yang sedang berjalan akan muncul di sini.'
                  : 'Pesanan yang sudah selesai atau dibatalkan akan diarsipkan di sini.'}
              </p>
            </div>
            {activeTab === 'active' && (
              <div className="pt-2">
                <Link
                  href="/customer/orders/new"
                  className="inline-flex px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Buat Pesanan Sekarang
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((ord) => {
              const isCompleted = ord.status === 'completed';
              const hasReview = !!ord.review;

              return (
                <div
                  key={ord.id}
                  className="p-6 bg-[#faf9f6] border border-stone-200/80 rounded-2xl hover:border-amber-300 hover:bg-white transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-white px-3 py-1 border border-stone-200 rounded-lg shadow-xs">
                        {ord.vendorInvoiceNo}
                      </span>
                      <StatusBadge status={ord.status} />
                      <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg uppercase">
                        {ord.jenisOrder}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-stone-900">{ord.atasNama}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 pt-1">
                      <div>
                        <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold">Tanggal Pesan</span>
                        <span className="font-medium text-stone-800">
                          {new Date(ord.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      {ord.orderDetails?.deliveryDate && (
                        <div>
                          <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold">Pengiriman</span>
                          <span className="font-medium text-stone-800">
                            {ord.orderDetails.deliveryDate} ({ord.orderDetails.deliveryTime})
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold">Total Biaya</span>
                        <span className="font-mono font-bold text-stone-900">
                          {ord.quotationPrice
                            ? `Rp ${ord.quotationPrice.toLocaleString('id-ID')}`
                            : ord.orderDetails?.totalPelunasan
                            ? `Rp ${ord.orderDetails.totalPelunasan.toLocaleString('id-ID')}`
                            : 'Menunggu Quotation'}
                        </span>
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="pt-1 flex items-center gap-2">
                        {hasReview ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                            <span className="text-amber-500 font-bold">{'★'.repeat(ord.review.rating)}{'☆'.repeat(5 - ord.review.rating)}</span>
                            <span className="text-stone-700">({ord.review.rating}/5 Ulasan Diberikan)</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                            Belum memberikan ulasan
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                    <Link
                      href={`/customer/orders/${ord.id}`}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 w-full md:w-auto justify-center shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      <span>{activeTab === 'active' ? 'Lihat Tracking & Detail' : 'Lihat Detail & Ulasan'}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
