import { requireAuth } from '@/lib/auth';
import { getOrderById } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { NewOrderForm } from '@/components/forms/NewOrderForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminEditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuth(['master_admin']);
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

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title={`Edit Pesanan #${order.vendorInvoiceNo}`}
          subtitle={`Master Admin Edit Mode — ${order.atasNama}`}
          role={user.role}
        />

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          {qParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{qParams.error}</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-full">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Mode Edit Master Admin
              </span>
              <h3 className="text-lg font-bold text-stone-900">Perbarui Detail Pesanan</h3>
              <p className="text-xs text-stone-600">
                Semua perubahan akan diperbarui pada pesanan existing dan tercatat pada audit log sistem.
              </p>
            </div>
            <Link
              href={`/customer/orders/${order.id}`}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-all shrink-0"
            >
              ← Batal
            </Link>
          </div>

          <NewOrderForm user={JSON.parse(JSON.stringify(user))} initialData={JSON.parse(JSON.stringify(order))} orderId={order.id} />
        </main>
      </div>
    </div>
  );
}
