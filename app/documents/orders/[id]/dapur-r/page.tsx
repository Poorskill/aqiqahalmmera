import { requireAuth } from '@/lib/auth';
import { getPostgresOrderById } from '@/lib/postgres-services';
import { getOrderById } from '@/lib/services';
import { PurchaseOrderDocument } from '@/components/documents/PurchaseOrderDocument';
import { PrintButton } from '@/components/ui/PrintButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PoDapurRPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(['admin', 'master_admin', 'dapur']);
  const { id } = await params;
  const order = (await getPostgresOrderById(id)) || getOrderById(id);

  if (!order) return <div className="p-8 font-bold">Pesanan tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2c1609] p-4 md:p-8 space-y-6 print:p-0 print:bg-white">
      <div className="max-w-[210mm] mx-auto flex items-center justify-between print:hidden bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
        <Link
          href={`/customer/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Kembali ke Detail Order</span>
        </Link>
        <PrintButton label="Cetak PO Dapur R" />
      </div>

      <PurchaseOrderDocument type="dapur-r" order={order} pageNumber={1} totalPages={1} />
    </div>
  );
}
