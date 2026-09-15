import { requireAuth } from '@/lib/auth';
import { getPostgresOrderById } from '@/lib/postgres-services';
import { getOrderById } from '@/lib/services';
import { PurchaseOrderDocument } from '@/components/documents/PurchaseOrderDocument';
import { PrintButton } from '@/components/ui/PrintButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PoLengkapPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(['admin', 'master_admin']);
  const { id } = await params;
  const order = (await getPostgresOrderById(id)) || getOrderById(id);

  if (!order) return <div className="p-8 font-bold">Pesanan tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 space-y-8">
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/customer/orders/${order.id}`}
          className="px-4 py-2 bg-white border border-black text-xs font-bold uppercase shadow-sm"
        >
          ← Kembali ke Detail Order
        </Link>
        <PrintButton label="Cetak / Print PO Lengkap" />
      </div>

      <div style={{ pageBreakAfter: 'always' }} className="print:break-after-page">
        <PurchaseOrderDocument type="kandang" order={order} />
      </div>

      <div style={{ pageBreakAfter: 'always' }} className="print:break-after-page">
        <PurchaseOrderDocument type="dapur-a" order={order} />
      </div>

      <div style={{ pageBreakAfter: 'always' }} className="print:break-after-page">
        <PurchaseOrderDocument type="dapur-r" order={order} />
      </div>

      <div>
        <PurchaseOrderDocument type="driver" order={order} />
      </div>
    </div>
  );
}
