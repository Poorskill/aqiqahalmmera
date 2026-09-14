import { requireAuth } from '@/lib/auth';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import { NewOrderForm } from '@/components/forms/NewOrderForm';

export const dynamic = 'force-dynamic';

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuth(['customer']);
  const params = await searchParams;

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Buat Pesanan"
          subtitle="Formulir Pemesanan Aqiqah Almeera"
          role={user.role}
        />

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          {params.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{params.error}</span>
            </div>
          )}

          {/* Top Banner / Guidance */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 border border-amber-900/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 text-xs font-semibold rounded-full">
                <span className="material-symbols-outlined text-sm">post_add</span>
                Formulir Pemesanan Resmi
              </span>
              <h3 className="text-xl font-bold tracking-tight text-stone-900">Ajukan Pesanan Aqiqah Baru</h3>
              <p className="text-xs text-stone-600 max-w-xl">
                Isi detail pemesanan Anda dengan lengkap dan benar. Anda dapat menambahkan beberapa item pesanan dalam satu pengajuan.
              </p>
            </div>
          </div>

          <NewOrderForm user={JSON.parse(JSON.stringify(user))} />
        </main>
      </div>
    </div>
  );
}
