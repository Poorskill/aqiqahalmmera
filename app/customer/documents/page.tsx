import { requireAuth } from '@/lib/auth';
import { getPostgresCustomerDocuments } from '@/lib/postgres-reports';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomerDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const user = await requireAuth(['customer']);
  const sParams = await searchParams;
  const filterType = sParams.type || 'all';
  const searchQuery = (sParams.search || '').toLowerCase();

  const allDocs = await getPostgresCustomerDocuments(user.id);

  const filteredDocs = allDocs.filter((doc) => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (searchQuery) {
      const matchText = `${doc.number} ${doc.title} ${doc.vendorInvoiceNo} ${doc.atasNama}`.toLowerCase();
      if (!matchText.includes(searchQuery)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Pusat Dokumen"
          subtitle="Akses dan Kelola Dokumen Resmi Pesanan Anda"
          role={user.role}
        />

        <main className="p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 text-xs font-semibold rounded-full">
                <span className="material-symbols-outlined text-sm">folder_open</span>
                Arsip Dokumen Resmi
              </span>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">Pusat Dokumen Pelanggan</h2>
              <p className="text-sm text-stone-600 max-w-xl">
                Semua quotation, invoice resmi, dan kwitansi pembayaran dari pesanan aqiqah Anda terkumpul di sini.
              </p>
            </div>
            <Link
              href="/customer/orders"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              Lihat Pesanan Saya
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <Link
                href="/customer/documents"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  filterType === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Semua ({allDocs.length})
              </Link>
              <Link
                href="/customer/documents?type=quotation"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  filterType === 'quotation'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Quotation ({allDocs.filter((d) => d.type === 'quotation').length})
              </Link>
              <Link
                href="/customer/documents?type=invoice"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  filterType === 'invoice'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Invoice ({allDocs.filter((d) => d.type === 'invoice').length})
              </Link>
              <Link
                href="/customer/documents?type=payment"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  filterType === 'payment'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Kwitansi Pembayaran ({allDocs.filter((d) => d.type === 'payment').length})
              </Link>
            </div>

            {/* Search Input */}
            <form method="GET" action="/customer/documents" className="w-full md:w-72 flex gap-2">
              <input type="hidden" name="type" value={filterType} />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Cari nomor / pesanan..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-all"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Document List / Grid */}
          {filteredDocs.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
                <span className="material-symbols-outlined text-2xl">folder_off</span>
              </div>
              <h3 className="text-base font-bold text-stone-900">Belum Ada Dokumen</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Dokumen pesanan, penawaran harga (quotation), invoice, dan kwitansi pembayaran Anda akan muncul di sini setelah tersedia.
              </p>
              <Link
                href="/customer/orders/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all mt-2"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                Buat Pesanan Baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-stone-200/80 rounded-2xl p-6 space-y-4 hover:border-amber-400/60 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        doc.type === 'quotation'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : doc.type === 'invoice'
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}>
                        {doc.typeName}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                        {doc.number}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{doc.title}</h4>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-sm text-amber-700">receipt_long</span>
                        Ref: <strong className="text-stone-800">{doc.vendorInvoiceNo}</strong> ({doc.atasNama})
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-400">
                      {new Date(doc.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                    <Link
                      href={doc.actionUrl}
                      target={doc.type === 'payment' && doc.actionUrl.startsWith('/uploads') ? '_blank' : '_self'}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
