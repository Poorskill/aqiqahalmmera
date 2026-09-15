import { requireAuth } from '@/lib/auth';
import { getPostgresKandangQueue } from '@/lib/postgres-queues';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KandangDashboardPage() {
  const user = await requireAuth(['kandang', 'admin']);
  const kandangOrders = await getPostgresKandangQueue();

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="OPERASIONAL KANDANG" subtitle="MANAJEMEN HEWAN AQIQAH & PENYEMBELIHAN" role={user.role} />

        <main className="p-8 space-y-6">
          <div className="brutalist-card p-6 bg-white space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#775847] border-b-2 border-[#775847] pb-3">
              DAFTAR TUGAS KANDANG & PERSIAPAN ({kandangOrders.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#775847] text-xs font-bold text-[#775847] uppercase">
                    <th className="p-3">No Invoice</th>
                    <th className="p-3">Atas Nama</th>
                    <th className="p-3">Jenis Hewan & Qty</th>
                    <th className="p-3">Jadwal Sembelih</th>
                    <th className="p-3">Status Persiapan</th>
                    <th className="p-3 text-right">Aksi Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#775847]/10 text-sm">
                  {kandangOrders.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f3f4f5]">
                      <td className="p-3 font-mono font-bold text-[#865300]">{item.vendorInvoiceNo}</td>
                      <td className="p-3 font-bold">{item.atasNama}</td>
                      <td className="p-3 font-medium">{item.animalType} ({item.animalQty} ekor)</td>
                      <td className="p-3 font-medium">{item.slaughterSchedule}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase border-2 ${
                          item.prepStatus === 'slaughtered' ? 'bg-emerald-100 text-emerald-900 border-emerald-600' :
                          item.prepStatus === 'ready' ? 'bg-yellow-100 text-yellow-900 border-yellow-600' :
                          'bg-amber-100 text-amber-900 border-amber-600'
                        }`}>
                          {item.prepStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Link
                          href={`/kandang/orders/${item.orderId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-[#2c1609] brutalist-btn text-xs font-bold"
                        >
                          Detail
                        </Link>
                        <form action={`/api/kandang/${item.orderId}/update`} method="POST" className="inline-flex gap-2">
                          <input type="hidden" name="prepStatus" value="ready" />
                          <button type="submit" className="px-2.5 py-1 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold">
                            Siap
                          </button>
                        </form>
                        <form action={`/api/kandang/${item.orderId}/update`} method="POST" className="inline-flex gap-2">
                          <input type="hidden" name="prepStatus" value="slaughtered" />
                          <button type="submit" className="px-2.5 py-1 bg-emerald-600 text-white brutalist-btn text-xs font-bold">
                            Sembelih
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
