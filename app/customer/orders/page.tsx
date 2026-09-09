import { requireAuth } from '@/lib/auth';
import { getAllOrders } from '@/lib/services';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import CustomerOrdersContent from './CustomerOrdersContent';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const user = await requireAuth(['customer']);
  const rawOrders = getAllOrders({ customerId: user.id });
  const orders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Pesanan"
          subtitle={`Shohibul: ${user.name}`}
          role={user.role}
        />

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          <CustomerOrdersContent orders={orders} />
        </main>
      </div>
    </div>
  );
}
