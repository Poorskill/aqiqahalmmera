import { requireAuth } from '@/lib/auth';
import { getAllPostgresPayments } from '@/lib/postgres-reports';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';
import { PaymentActionCell } from './PaymentActionCell';
import { resolveFileUrl } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; success?: string; error?: string }>;
}) {
  const user = await requireAuth(['admin', 'master_admin']);
  const sParams = await searchParams;
  const statusFilter = sParams.status || '';
  const payments = await getAllPostgresPayments(statusFilter ? { status: statusFilter } : undefined);

  const pendingCount = payments.filter((p: any) => p.status === 'waiting_verification').length;
  const verifiedCount = payments.filter((p: any) => p.status === 'verified').length;
  const totalVerifiedAmount = payments
    .filter((p: any) => p.status === 'verified')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Manajemen Pembayaran"
          subtitle="Verifikasi Bukti Transfer & Ledger Keuangan Aqiqah Almeera"
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {sParams.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{sParams.success}</span>
            </div>
          )}
          {sParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{sParams.error}</span>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-2 shadow-sm">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Menunggu Verifikasi</span>
              <h3 className="text-3xl font-bold font-mono text-stone-900">{pendingCount}</h3>
              <p className="text-xs text-stone-500">Bukti transfer baru perlu diperiksa</p>
            </div>
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-2 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Pembayaran Terverifikasi</span>
              <h3 className="text-3xl font-bold font-mono text-stone-900">{verifiedCount}</h3>
              <p className="text-xs text-stone-500">Transaksi sukses tercatat</p>
            </div>
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-2 shadow-sm">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Total Dana Masuk</span>
              <h3 className="text-2xl font-bold font-mono text-stone-900">Rp {totalVerifiedAmount.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-stone-500">Akumulasi pembayaran sah</p>
            </div>
          </div>

          {/* Filter Tabs & Table */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/admin/payments"
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    !statusFilter ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Semua Pembayaran
                </Link>
                <Link
                  href="/admin/payments?status=waiting_verification"
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === 'waiting_verification' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Pending ({pendingCount})
                </Link>
                <Link
                  href="/admin/payments?status=verified"
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === 'verified' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Terverifikasi
                </Link>
                <Link
                  href="/admin/payments?status=rejected"
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === 'rejected' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Ditolak
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice / Shohibul</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Metode & Tanggal</th>
                    <th className="py-3 px-4">Bukti Transfer</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-stone-500 text-xs">
                        Tidak ada data pembayaran ditemukan.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-amber-900 block text-xs">
                            {p.order?.vendorInvoiceNo || '-'}
                          </span>
                          <span className="font-semibold text-stone-900 text-xs block mt-0.5">
                            {p.order?.atasNama || p.customer?.name}
                          </span>
                          <span className="text-[11px] text-stone-500">{p.customer?.phone}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-800 uppercase">
                            {p.paymentType}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-stone-900">
                          Rp {p.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-4 text-xs text-stone-600">
                          <span className="font-semibold text-stone-800 block">{p.paymentMethod}</span>
                          <span>{p.paymentDate}</span>
                        </td>
                        <td className="py-4 px-4">
                          {p.proof ? (
                            <a
                              href={p.proof.startsWith('http') || p.proof.startsWith('/uploads') ? p.proof : `/api/files/view?path=${encodeURIComponent(p.proof)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>Lihat Bukti</span>
                            </a>
                          ) : (
                            <span className="text-xs text-stone-400 italic">Tanpa Bukti</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {p.status === 'waiting_verification' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                              Menunggu Verifikasi
                            </span>
                          )}
                          {p.status === 'verified' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              Terverifikasi
                            </span>
                          )}
                          {p.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
                              Ditolak ({p.rejectionReason || 'Alasan lain'})
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <PaymentActionCell paymentId={p.id} orderId={p.orderId} status={p.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
