import { requireAuth } from '@/lib/auth';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { AdminNewOrderForm } from './AdminNewOrderForm';

export const dynamic = 'force-dynamic';

export default async function AdminNewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuth(['admin', 'master_admin']);
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="Pesanan Manual Admin" subtitle="Input Pesanan Baru via Operator" role={user.role} />

        <main className="p-8 max-w-4xl mx-auto w-full">
          {params.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{params.error}</span>
            </div>
          )}

          <AdminNewOrderForm />
        </main>
      </div>
    </div>
  );
}
