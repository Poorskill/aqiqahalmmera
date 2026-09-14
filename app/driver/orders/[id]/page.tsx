import { requireAuth } from '@/lib/auth';
import { getOrderById } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DriverOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAuth(['driver', 'admin', 'master_admin']);
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

  const driver = order.driverOrder || {
    status: 'assigned',
    deliveryAddress: order.orderDetails?.address || '',
    contactPerson: order.orderDetails?.recipientName || order.atasNama,
    deliverySchedule: `${order.orderDetails?.deliveryDate || ''} ${order.orderDetails?.deliveryTime || ''}`,
  };

  const statusLabel: Record<string, string> = {
    assigned: 'Ditugaskan',
    on_delivery: 'Dalam Perjalanan',
    delivered: 'Terkirim',
  };

  const statusStyle: Record<string, string> = {
    assigned: 'bg-amber-100 text-amber-900 border-amber-300',
    on_delivery: 'bg-blue-100 text-blue-900 border-blue-300',
    delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  };

  const isDelivered = driver.status === 'delivered';
  const isOnDelivery = driver.status === 'on_delivery';
  const isAssigned = driver.status === 'assigned';
  const hasArrived = !!driver.arrivedAt;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Detail Pengantaran"
          subtitle={`Invoice: ${order.vendorInvoiceNo} — ${order.atasNama}`}
          role={user.role}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {qParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{qParams.error}</span>
            </div>
          )}
          {qParams.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{qParams.success}</span>
            </div>
          )}

          {/* Top Summary */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-900 bg-stone-50 px-3 py-1 border border-stone-200 rounded-lg">
                  {order.vendorInvoiceNo}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${statusStyle[driver.status] || statusStyle.assigned}`}>
                  {statusLabel[driver.status] || driver.status}
                </span>
                {hasArrived && !isDelivered && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-900 border border-sky-300">
                    Tiba di Lokasi
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">{order.atasNama}</h2>
              <p className="text-xs text-stone-500 mt-1">
                Jadwal: {driver.deliverySchedule}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/documents/orders/${order.id}/driver`}
                target="_blank"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Cetak PO Driver
              </Link>
              <Link
                href="/driver/dashboard"
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
              >
                ← Kembali
              </Link>
            </div>
          </div>

          {/* Status Pengiriman & Actions */}
          {!isDelivered && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <span className="material-symbols-outlined text-amber-700">local_shipping</span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                  Proses Pengiriman
                </h4>
              </div>

              {/* Step Indicators */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${isAssigned ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                  <span className="material-symbols-outlined text-sm">{isAssigned ? 'radio_button_checked' : 'check_circle'}</span>
                  1. Ditugaskan
                </div>
                <span className="text-stone-300">→</span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${
                  isOnDelivery && !hasArrived ? 'bg-blue-100 text-blue-900' :
                  isOnDelivery && hasArrived ? 'bg-emerald-100 text-emerald-900' :
                  'bg-stone-100 text-stone-400'
                }`}>
                  <span className="material-symbols-outlined text-sm">{isOnDelivery ? (hasArrived ? 'check_circle' : 'radio_button_checked') : 'radio_button_unchecked'}</span>
                  2. Dalam Perjalanan
                </div>
                <span className="text-stone-300">→</span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${
                  hasArrived ? 'bg-sky-100 text-sky-900' : 'bg-stone-100 text-stone-400'
                }`}>
                  <span className="material-symbols-outlined text-sm">{hasArrived ? 'check_circle' : 'radio_button_unchecked'}</span>
                  3. Tiba di Lokasi
                </div>
                <span className="text-stone-300">→</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-stone-100 text-stone-400">
                  <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>
                  4. Selesai
                </div>
              </div>

              {/* Action: Mulai Kirim */}
              {isAssigned && (
                <form action={`/api/driver/${order.id}/update`} method="POST">
                  <input type="hidden" name="action" value="start" />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base">directions_car</span>
                    Mulai Pengiriman
                  </button>
                </form>
              )}

              {/* Action: Tiba di Lokasi */}
              {isOnDelivery && !hasArrived && (
                <form action={`/api/driver/${order.id}/update`} method="POST">
                  <input type="hidden" name="action" value="arrived" />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base">pin_drop</span>
                    Tiba di Lokasi
                  </button>
                </form>
              )}

              {/* Action: Selesaikan Pengiriman */}
              {isOnDelivery && hasArrived && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Tiba di lokasi: {new Date(driver.arrivedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <form
                    action={`/api/driver/${order.id}/update`}
                    method="POST"
                    encType="multipart/form-data"
                    className="space-y-4"
                  >
                    <input type="hidden" name="action" value="complete" />

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Bukti Pengiriman (Foto) *
                      </label>
                      <input
                        type="file"
                        name="proofFile"
                        accept="image/jpeg,image/png,image/webp"
                        required
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2 text-xs font-medium text-stone-900 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                      />
                      <p className="mt-1 text-[11px] text-stone-400">
                        Format: JPG, PNG, WebP. Maksimal 5MB.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Catatan Pengiriman (Opsional)
                      </label>
                      <textarea
                        name="deliveryNote"
                        rows={2}
                        placeholder="Contoh: Pesanan diterima oleh keluarga penerima."
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-base">task_alt</span>
                      Selesaikan Pengiriman
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Delivery Completed Summary */}
          {isDelivered && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-3">
                <span className="material-symbols-outlined text-emerald-700">verified</span>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-950">
                  Pengiriman Selesai
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
                {driver.arrivedAt && (
                  <div className="space-y-0.5">
                    <span className="font-semibold text-stone-900">Tiba di Lokasi</span>
                    <p>{new Date(driver.arrivedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                )}
                {driver.deliveredAt && (
                  <div className="space-y-0.5">
                    <span className="font-semibold text-stone-900">Waktu Selesai</span>
                    <p>{new Date(driver.deliveredAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                )}
              </div>
              {driver.deliveryProof && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-900">Bukti Pengiriman</span>
                  <a href={driver.deliveryProof} target="_blank" rel="noopener noreferrer">
                    <img
                      src={driver.deliveryProof}
                      alt="Bukti Pengiriman"
                      className="w-48 h-36 object-cover rounded-xl border border-emerald-200 hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}
              {driver.deliveryNote && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-900">Catatan Driver</span>
                  <p className="text-xs text-stone-700 bg-white border border-emerald-200 rounded-xl p-3">{driver.deliveryNote}</p>
                </div>
              )}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 border-b border-stone-100 pb-3">
                Informasi Penerima & Alamat
              </h4>
              <div className="space-y-2 text-xs text-stone-700">
                <p><strong className="text-stone-900">No Invoice:</strong> <span className="font-mono font-bold text-amber-900">{order.vendorInvoiceNo}</span></p>
                <p><strong className="text-stone-900">Nama Kontak / Penerima:</strong> <span className="font-bold">{driver.contactPerson}</span></p>
                <p><strong className="text-stone-900">No WhatsApp / Telepon:</strong> {order.orderDetails?.phone}</p>
                <div className="space-y-1">
                  <strong className="text-stone-900">Alamat Pengiriman:</strong>
                  <p className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800">
                    {driver.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 border-b border-stone-100 pb-3">
                Detail Logistik & Driver
              </h4>
              <div className="space-y-2 text-xs text-stone-700">
                <p><strong className="text-stone-900">Jadwal Pengiriman:</strong> <span className="font-bold">{driver.deliverySchedule}</span></p>
                <p><strong className="text-stone-900">Info Driver / Kendaraan:</strong> {order.orderDetails?.driverInfo || 'Ditugaskan ke Driver Almeera'}</p>
                <p><strong className="text-stone-900">Uang Saku Driver:</strong> <span className="font-mono font-bold text-emerald-700">Rp {(order.orderDetails?.uangSakuDriver || 50000).toLocaleString('id-ID')}</span></p>
                <p><strong className="text-stone-900">Status Payment Order:</strong> <span className="uppercase font-bold text-amber-900">{order.orderDetails?.paymentStatus}</span></p>

                {order.orderDetails?.pesanDriver && (
                  <div className="space-y-1 pt-2">
                    <strong className="text-stone-900">Pesan Khusus untuk Driver:</strong>
                    <p className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs font-semibold text-sky-900">
                      {order.orderDetails.pesanDriver}
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
