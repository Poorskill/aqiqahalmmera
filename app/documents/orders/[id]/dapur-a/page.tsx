import { requireAuth } from '@/lib/auth';
import { getOrderById } from '@/lib/services';
import { PurchaseOrderDocument } from '@/components/documents/PurchaseOrderDocument';
import { PrintButton } from '@/components/ui/PrintButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PoDapurAPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(['admin', 'master_admin', 'dapur']);
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) return <div className="p-8 font-bold">Pesanan tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/customer/orders/${order.id}`}
          className="px-4 py-2 bg-white border border-black text-xs font-bold uppercase"
        >
          ← Kembali ke Detail Order
        </Link>
        <PrintButton label="Cetak / Print PO Dapur A" />
      </div>

      <PurchaseOrderDocument type="dapur-a" order={order} />
    </div>
  );
}
