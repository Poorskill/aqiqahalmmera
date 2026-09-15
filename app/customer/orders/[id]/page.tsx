import { requireAuth } from '@/lib/auth';
import { getPostgresOrderById, getPostgresPaymentsByOrderId } from '@/lib/postgres-services';
import { getOrderById, getPaymentsByOrderId } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderStatusTimeline } from '@/components/ui/OrderStatusTimeline';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAuth(['customer', 'admin', 'master_admin']);
  const { id } = await params;
  const qParams = await searchParams;
  let order = await getPostgresOrderById(id);
  let payments: any[] = [];
  if (order) {
    payments = await getPostgresPaymentsByOrderId(order.id);
  } else {
    order = getOrderById(id);
    if (order) payments = getPaymentsByOrderId(order.id);
  }
  if (!order) return <div className="p-8 font-bold">Pesanan tidak ditemukan.</div>;
  if (user.role === 'customer' && order.customerId !== user.id) return <div className="p-8 font-bold text-red-600">Akses ditolak: Anda tidak memiliki akses ke pesanan ini.</div>;
  const totalVerifiedPaid = payments
    .filter((p: any) => p.status === 'verified')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const totalBill = order.quotationPrice || order.orderDetails?.totalPelunasan || 0;
  const remainingBalance = Math.max(0, totalBill - totalVerifiedPaid);

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Detail Pesanan & Pembayaran"
          subtitle={`Invoice: ${order.vendorInvoiceNo} (${order.atasNama})`}
          role={user.role}
        />

        <main className="p-8 space-y-8 max-w-6xl mx-auto w-full">
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

          {/* Top Summary Card */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-900 bg-stone-50 px-3 py-1 border border-stone-200 rounded-lg shadow-xs">
                  {order.vendorInvoiceNo}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">{order.atasNama}</h2>
              <p className="text-xs text-stone-500 mt-1">
                Tanggal Pesan: {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user.role === 'master_admin' && (
                <Link
                  href={`/admin/orders/${order.id}/edit`}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Pesanan
                </Link>
              )}
              {['admin', 'master_admin'].includes(user.role) && (
                <Link
                  href={`/documents/orders/${order.id}/lengkap`}
                  target="_blank"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  PO Lengkap
                </Link>
              )}
              <Link
                href={['admin', 'master_admin'].includes(user.role) ? '/admin/orders' : '/customer/orders'}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all"
              >
                ← Kembali
              </Link>
            </div>
          </div>

          {/* Timeline */}
          <OrderStatusTimeline currentStatus={order.status} />

          {/* Quotation Action Card for Customer when quotation_sent */}
          {user.role === 'customer' && order.status === 'quotation_sent' && order.quotation && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-800 tracking-wider uppercase">Penawaran Resmi Admin</span>
                  <h4 className="text-xl font-bold text-amber-950 mt-1">
                    Total Penawaran: Rp {order.quotation.price.toLocaleString('id-ID')}
                  </h4>
                </div>
                <StatusBadge status="quotation_sent" />
              </div>
              <p className="text-sm text-amber-900 font-medium">Catatan Admin: {order.quotation.note || '-'}</p>
              <div className="flex items-center gap-4 pt-2">
                <form action={`/api/orders/${order.id}/approve`} method="POST">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Setujui Penawaran
                  </button>
                </form>
                <form action={`/api/orders/${order.id}/reject`} method="POST">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Tolak Penawaran
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Admin Quotation Creator & Operational Notes */}
          {['admin', 'master_admin'].includes(user.role) && ['waiting_review', 'quotation_sent', 'quotation_approved'].includes(order.status) && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {order.status === 'waiting_review' ? 'Buat & Kirim Penawaran Harga & Pesan Operasional' : 'Ubah Penawaran Harga & Pesan Operasional'}
                </h4>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Quotation & Internal Ops
                </span>
              </div>

              <form action={`/api/orders/${order.id}/quotation`} method="POST" className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1.5">Harga Penawaran (Rp) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      defaultValue={order.quotation?.price || order.quotationPrice || order.orderDetails?.totalPelunasan || 2500000}
                      className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1.5">Uang Saku Driver (Rp) (Internal)</label>
                    <input
                      type="number"
                      name="uangSakuDriver"
                      defaultValue={order.orderDetails?.uangSakuDriver || 50000}
                      className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1.5">Catatan / Rincian Penawaran</label>
                  <input
                    type="text"
                    name="note"
                    defaultValue={order.quotation?.note || ''}
                    placeholder="Contoh: Termasuk bonus sate 50 tusuk dan ongkir Cilacap."
                    className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-amber-200/60">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    Pesan Operasional (Internal Tim)
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">Pesan untuk Kandang (Opsional)</label>
                      <textarea
                        name="pesanKandang"
                        rows={2}
                        defaultValue={order.orderDetails?.pesanKandang || ''}
                        placeholder="Contoh: Pastikan kepala dan kaki ikut dikirim."
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">Pesan untuk Dapur A (Opsional)</label>
                      <textarea
                        name="pesanDapurA"
                        rows={2}
                        defaultValue={order.orderDetails?.pesanDapurA || ''}
                        placeholder="Contoh: Pisahkan sambal dan gunakan tingkat kepedasan sedang."
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">Pesan untuk Dapur R (Opsional)</label>
                      <textarea
                        name="pesanDapurR"
                        rows={2}
                        defaultValue={order.orderDetails?.pesanDapurR || ''}
                        placeholder="Contoh: Menu tambahan dikemas terpisah."
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">Pesan untuk Driver (Opsional)</label>
                      <textarea
                        name="pesanDriver"
                        rows={2}
                        defaultValue={order.orderDetails?.pesanDriver || ''}
                        placeholder="Contoh: Hubungi penerima 30 menit sebelum sampai."
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Kirim Penawaran & Simpan Pesan Operasional</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Summary & Ledger Section */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Ledger Pembayaran</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Rincian Keuangan & Transfer</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                remainingBalance === 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Status: {remainingBalance === 0 ? 'Lunas' : 'Belum Lunas / DP'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
                <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Total Tagihan (Quotation)</span>
                <p className="text-xl font-bold font-mono text-stone-900">
                  {totalBill > 0 ? `Rp ${totalBill.toLocaleString('id-ID')}` : 'Menunggu Quotation'}
                </p>
              </div>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-xs text-emerald-800 uppercase tracking-wider font-semibold">Total Terverifikasi (Paid)</span>
                <p className="text-xl font-bold font-mono text-emerald-900">
                  Rp {totalVerifiedPaid.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs text-amber-800 uppercase tracking-wider font-semibold">Sisa Kekurangan</span>
                <p className="text-xl font-bold font-mono text-amber-950">
                  Rp {remainingBalance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">Riwayat Pembayaran & Transfer</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      <th className="py-3 px-3">Jenis</th>
                      <th className="py-3 px-3">Nominal</th>
                      <th className="py-3 px-3">Metode & Tanggal</th>
                      <th className="py-3 px-3">Bukti</th>
                      <th className="py-3 px-3">Status Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-stone-400 text-xs">
                          Belum ada transaksi pembayaran yang dikirim.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-stone-50/50">
                          <td className="py-3 px-3 font-semibold uppercase text-xs">{p.paymentType}</td>
                          <td className="py-3 px-3 font-mono font-bold text-stone-900">Rp {p.amount.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-3 text-xs text-stone-600">{p.paymentMethod} ({p.paymentDate})</td>
                          <td className="py-3 px-3">
                            {p.proof ? (
                              <a href={p.proof.startsWith('http') || p.proof.startsWith('/uploads') ? p.proof : `/api/files/view?path=${encodeURIComponent(p.proof)}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-amber-700 hover:underline">
                                Lihat Bukti
                              </a>
                            ) : '-'}
                          </td>
                          <td className="py-3 px-3">
                            {p.status === 'waiting_verification' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">Menunggu Verifikasi</span>
                            )}
                            {p.status === 'verified' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900">Terverifikasi</span>
                            )}
                            {p.status === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-900">Ditolak: {p.rejectionReason}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Payment Form for Customer when quotation is approved and balance > 0 */}
            {user.role === 'customer' && order.status !== 'waiting_review' && order.status !== 'quotation_sent' && order.status !== 'cancelled' && remainingBalance > 0 && (
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 space-y-4 mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800">Kirim Bukti Pembayaran / Transfer</h4>
                <p className="text-xs text-stone-600">
                  Silakan transfer ke rekening resmi <strong className="text-stone-800">BSI 7123456789 a.n Aqiqah Almeera</strong> atau <strong className="text-stone-800">BCA 1234567890</strong>, lalu unggah bukti transfer di bawah ini.
                </p>

                <form action={`/api/orders/${order.id}/payment`} method="POST" encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Jenis Pembayaran</label>
                    <select name="paymentType" required className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                      <option value="dp">DP (Down Payment)</option>
                      <option value="pelunasan">Pelunasan</option>
                      <option value="termin">Termin / Cicilan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nominal Transfer (Rp)</label>
                    <input
                      type="number"
                      name="amount"
                      required
                      defaultValue={remainingBalance}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Metode Pembayaran / Bank</label>
                    <select name="paymentMethod" required className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                      <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                      <option value="BCA">BCA</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="Tunai">Tunai / Bayar di Kantor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Transfer</label>
                    <input
                      type="date"
                      name="paymentDate"
                      required
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Upload Bukti Transfer (Foto / Screenshot)</label>
                    <input
                      type="file"
                      name="proofFile"
                      accept="image/*"
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2 text-xs font-medium text-stone-900 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Catatan Tambahan (Opsional)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Contoh: Transfer dari rekening Budi Santoso"
                      className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">upload</span>
                      <span>Kirim Bukti Pembayaran</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Dokumen Pesanan Section */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Arsip Dokumen</span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">Dokumen Resmi Pesanan Ini</h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">Terintegrasi dengan Order</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Invoice Doc */}
              <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-900 uppercase">Invoice Resmi</span>
                  <p className="font-mono font-bold text-stone-900 text-sm mt-1">{order.vendorInvoiceNo}</p>
                  <p className="text-xs text-stone-500">Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-stone-700">Tersedia</span>
                </div>
              </div>

              {/* Quotation Doc */}
              <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 uppercase">Quotation</span>
                  <p className="font-mono font-bold text-stone-900 text-sm mt-1">QT-{order.vendorInvoiceNo}</p>
                  <p className="text-xs text-stone-500">
                    {order.quotation ? `Rp ${order.quotation.price.toLocaleString('id-ID')}` : 'Menunggu Quotation'}
                  </p>
                </div>
                <div className="pt-2">
                  <span className={`text-xs font-semibold ${order.quotation ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {order.quotation ? `Status: ${order.quotation.status}` : 'Belum tersedia'}
                  </span>
                </div>
              </div>

              {/* Payment Receipts / Kwitansi */}
              <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 uppercase">Kwitansi Pembayaran</span>
                  <p className="font-mono font-bold text-stone-900 text-sm mt-1">
                    {payments.filter((p: any) => p.status === 'verified').length} Kwitansi Verified
                  </p>
                  <p className="text-xs text-stone-500">Total Terbayar: Rp {totalVerifiedPaid.toLocaleString('id-ID')}</p>
                </div>
                <div className="pt-2">
                  {payments.some((p: any) => p.proof && p.status === 'verified') ? (
                    <a
                      href={payments.find((p: any) => p.proof && p.status === 'verified')?.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Lihat Kwitansi
                    </a>
                  ) : (
                    <span className="text-xs text-stone-400">Belum ada bukti terverifikasi</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Shohibul info */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 border-b border-stone-100 pb-3">
                Informasi Shohibul & Pengiriman
              </h4>
              <div className="space-y-2 text-xs text-stone-700">
                <p><strong className="text-stone-900">Nama Pemesan:</strong> {order.atasNama}</p>
                <p><strong className="text-stone-900">No HP / WhatsApp:</strong> {order.orderDetails?.phone}</p>
                <p><strong className="text-stone-900">Nama Ayah:</strong> {order.orderDetails?.fatherName || order.orderDetails?.parentName?.split('&')[0]?.trim() || '-'}</p>
                <p><strong className="text-stone-900">Nama Ibu:</strong> {order.orderDetails?.motherName || order.orderDetails?.parentName?.split('&')[1]?.trim() || '-'}</p>
                <p><strong className="text-stone-900">Nama Anak:</strong> {order.orderDetails?.childName}</p>
                <p><strong className="text-stone-900">Penerima Tujuan:</strong> {order.orderDetails?.recipientName}</p>
                <p><strong className="text-stone-900">Alamat Pengiriman:</strong> {order.orderDetails?.address}</p>
                <p><strong className="text-stone-900">Jadwal Pengiriman:</strong> {order.orderDetails?.deliveryDate} ({order.orderDetails?.deliveryTime})</p>
                {order.orderDetails?.driverInfo && (
                  <p><strong className="text-stone-900">Info Driver:</strong> {order.orderDetails.driverInfo}</p>
                )}
              </div>
            </div>

            {/* Pesanan & Biaya */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 border-b border-stone-100 pb-3">
                Rincian Pesanan & Menu ({order.items?.length || 1} Item)
              </h4>
              <div className="space-y-4 text-xs text-stone-700">
                <p><strong className="text-stone-900">Jenis Order:</strong> <span className="uppercase font-semibold">{order.jenisOrder}</span></p>
                {order.items && order.items.length > 0 ? (
                  order.items.map((it: any, idx: number) => (
                    <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                      <p className="font-bold text-amber-900 uppercase">Pesanan {idx + 1}</p>
                      <p><strong className="text-stone-900">Pesanan Kambing:</strong> {it.animalOrder}</p>
                      {it.kandangNote && <p><strong className="text-stone-900">Catatan Kandang:</strong> {it.kandangNote}</p>}
                      <p><strong className="text-stone-900">Masakan Dapur A:</strong> {it.dapurAMasakan || '-'}</p>
                      <p><strong className="text-stone-900">Nasi Box Dapur A:</strong> {it.dapurANasiBox || '-'}</p>
                      {it.dapurANote && <p><strong className="text-stone-900">Catatan Dapur A:</strong> {it.dapurANote}</p>}
                    </div>
                  ))
                ) : (
                  <>
                    <p><strong className="text-stone-900">Pesanan Kambing:</strong> {order.orderDetails?.animalOrder}</p>
                    {order.orderDetails?.kandangNote && (
                      <p><strong className="text-stone-900">Catatan Kandang:</strong> {order.orderDetails.kandangNote}</p>
                    )}
                    <p><strong className="text-stone-900">Masakan Dapur A:</strong> {order.orderDetails?.dapurAMasakan || '-'}</p>
                    <p><strong className="text-stone-900">Nasi Box Dapur A:</strong> {order.orderDetails?.dapurANasiBox || '-'}</p>
                  </>
                )}
                {order.orderDetails?.pesananLainnya && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1">
                    <p className="font-bold text-amber-950 uppercase">Pesanan Lainnya</p>
                    <p className="text-stone-800">{order.orderDetails.pesananLainnya}</p>
                  </div>
                )}
                <hr className="border-stone-100 my-2" />
                <p><strong className="text-stone-900">Status Pembayaran:</strong> <span className="uppercase font-bold text-amber-900">{order.orderDetails?.paymentStatus}</span></p>
              </div>
            </div>
          </div>

          {/* Delivery Tracking & Proof Section */}
          {order.driverOrder && ['delivery', 'completed'].includes(order.status) && (
            <div className={`border rounded-2xl p-6 space-y-4 shadow-sm ${
              order.driverOrder.status === 'delivered' ? 'bg-emerald-50/70 border-emerald-300' : 'bg-blue-50/70 border-blue-300'
            }`}>
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${order.driverOrder.status === 'delivered' ? 'text-emerald-700' : 'text-blue-700'}`}>
                    {order.driverOrder.status === 'delivered' ? 'check_circle' : 'local_shipping'}
                  </span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    Status Pengiriman Pesanan
                  </h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                  order.driverOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                }`}>
                  {order.driverOrder.status === 'delivered' ? 'Terkirim & Diterima' : 'Dalam Perjalanan'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
                <div>
                  <p><strong className="text-stone-900">Tujuan Pengiriman:</strong> {order.driverOrder.deliveryAddress}</p>
                  <p className="mt-1"><strong className="text-stone-900">Penerima:</strong> {order.driverOrder.contactPerson}</p>
                </div>
                <div>
                  {order.driverOrder.deliveredAt && (
                    <p><strong className="text-stone-900">Waktu Diterima:</strong> {new Date(order.driverOrder.deliveredAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                  )}
                  {['admin', 'master_admin'].includes(user.role) && order.driverOrder.arrivedAt && (
                    <p className="mt-1"><strong className="text-stone-900">Waktu Tiba di Lokasi (Internal):</strong> {new Date(order.driverOrder.arrivedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  )}
                </div>
              </div>

              {order.driverOrder.deliveryProof && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-stone-900 block mb-1.5">Bukti Foto Penerimaan:</span>
                  <a href={order.driverOrder.deliveryProof} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <img
                      src={order.driverOrder.deliveryProof}
                      alt="Bukti Penerimaan"
                      className="w-48 h-36 object-cover rounded-xl border border-stone-300 hover:opacity-90 shadow-xs transition-opacity"
                    />
                  </a>
                </div>
              )}

              {['admin', 'master_admin'].includes(user.role) && order.driverOrder.deliveryNote && (
                <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1 text-xs">
                  <span className="font-semibold text-stone-900">Catatan Driver (Internal):</span>
                  <p className="text-stone-700">{order.driverOrder.deliveryNote}</p>
                </div>
              )}
            </div>
          )}

          {/* Review section if completed */}
          {order.status === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-950">Ulasan & Penilaian Customer</h4>
              {order.review ? (
                <div className="space-y-2 bg-white p-4 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    {'★'.repeat(order.review.rating)}{'☆'.repeat(5 - order.review.rating)}
                    <span className="text-xs text-stone-600 ml-2">({order.review.rating}/5 Bintang)</span>
                  </div>
                  <p className="text-sm font-medium text-stone-800">"{order.review.comment}"</p>
                </div>
              ) : user.role === 'customer' ? (
                <form action={`/api/orders/${order.id}/review`} method="POST" className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">Rating (1-5)</label>
                    <select name="rating" required className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900">
                      <option value="5">★★★★★ (5 - Sangat Puas)</option>
                      <option value="4">★★★★☆ (4 - Puas)</option>
                      <option value="3">★★★☆☆ (3 - Cukup)</option>
                      <option value="2">★★☆☆☆ (2 - Kurang)</option>
                      <option value="1">★☆☆☆☆ (1 - Buruk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">Komentar / Ulasan</label>
                    <textarea
                      name="comment"
                      required
                      rows={3}
                      placeholder="Bagikan pengalaman pelayanan Aqiqah Almeera..."
                      className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-900"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    Kirim Ulasan Pesanan
                  </button>
                </form>
              ) : (
                <p className="text-xs text-stone-600">Belum ada ulasan dari customer.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
