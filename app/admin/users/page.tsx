import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireAuth(['admin']);
  const stmt = db.prepare('SELECT id, name, email, role, phone, createdAt FROM users ORDER BY createdAt DESC');
  const users = stmt.all() as any[];

  return (
    <div className="min-h-screen flex">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar title="MANAJEMEN USER & ADMIN" subtitle="PENGGUNA SISTEM AQIQAH ALMEERA" role={user.role} />

        <main className="p-8 space-y-6">
          <div className="brutalist-card p-6 bg-white space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#775847] border-b-2 border-[#775847] pb-3">
              DAFTAR AKUN PENGGUNA TERDAFTAR ({users.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#775847] text-xs font-bold text-[#775847] uppercase">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">No HP</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#775847]/10 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f3f4f5]">
                      <td className="p-3 font-bold">{u.name}</td>
                      <td className="p-3 font-mono">{u.email}</td>
                      <td className="p-3">{u.phone}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 text-xs font-bold uppercase border-2 bg-amber-100 text-amber-900 border-amber-600">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-xs font-medium">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
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
