import { requireAuth } from '@/lib/auth';
import { getPostgresNotifications, getPostgresUnreadNotificationCount } from '@/lib/postgres-rbac';
import { AlmeeraSidebar } from '@/components/layout/AlmeeraSidebar';
import { AlmeeraTopbar } from '@/components/layout/AlmeeraTopbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatTimeAgo(dateStr: string) {
  try {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { dateStyle: 'medium' });
  } catch {
    return dateStr;
  }
}

export default async function CustomerNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; error?: string }>;
}) {
  const user = await requireAuth(['customer']);
  const sParams = await searchParams;
  const filter = sParams.filter || 'all';

  const allNotifications = await getPostgresNotifications(user.id);
  const unreadCount = await getPostgresUnreadNotificationCount(user.id);

  const filteredNotifications = allNotifications.filter((n) => {
    if (filter === 'unread' && n.readAt) return false;
    if (['pesanan', 'pembayaran', 'quotation', 'jadwal', 'pengiriman', 'sistem'].includes(filter) && n.category !== filter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#2c1609]">
      <AlmeeraSidebar role={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <AlmeeraTopbar
          title="Notifikasi"
          subtitle="Pusat Pemberitahuan Aktivitas & Pembaruan Pesanan"
          role={user.role}
          unreadCount={unreadCount}
        />

        <main className="p-8 max-w-5xl mx-auto w-full space-y-6">
          {sParams.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{sParams.error}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 text-xs font-semibold rounded-full">
                <span className="material-symbols-outlined text-sm">notifications</span>
                Pemberitahuan Sistem
              </span>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">Notifikasi Pesanan Anda</h2>
              <p className="text-sm text-stone-600 max-w-xl">
                Pantau setiap progres pesanan, konfirmasi quotation, dan verifikasi pembayaran secara real-time.
              </p>
            </div>
            {unreadCount > 0 && (
              <form action="/api/customer/notifications/read-all" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-base">done_all</span>
                  Tandai Semua Dibaca
                </button>
              </form>
            )}
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-2 overflow-x-auto shadow-xs">
            <Link
              href="/customer/notifications"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'all' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Semua ({allNotifications.length})
            </Link>
            <Link
              href="/customer/notifications?filter=unread"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'unread' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </Link>
            <Link
              href="/customer/notifications?filter=pesanan"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'pesanan' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Pesanan
            </Link>
            <Link
              href="/customer/notifications?filter=quotation"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'quotation' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Quotation
            </Link>
            <Link
              href="/customer/notifications?filter=pembayaran"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'pembayaran' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Pembayaran
            </Link>
            <Link
              href="/customer/notifications?filter=pengiriman"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'pengiriman' ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Pengiriman
            </Link>
          </div>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
                <span className="material-symbols-outlined text-2xl">notifications_off</span>
              </div>
              <h3 className="text-base font-bold text-stone-900">Belum Ada Notifikasi</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Notifikasi penting tentang pesanan, penawaran harga, dan status pembayaran Anda akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <div
                    key={notif.id}
                    className={`bg-white border rounded-2xl p-6 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isUnread ? 'border-amber-400 bg-amber-50/20' : 'border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.priority === 'high'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : notif.category === 'quotation'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : notif.category === 'pembayaran'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {notif.category === 'pembayaran' ? 'payments' : notif.category === 'quotation' ? 'request_quote' : 'receipt_long'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                            {notif.category}
                          </span>
                          {notif.priority === 'high' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                              Perhatian
                            </span>
                          )}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-stone-900">{notif.title}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed">{notif.message}</p>
                        <span className="text-[11px] text-stone-400 font-medium block pt-1">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <span>Tinjau</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      )}
                      {isUnread && (
                        <form action="/api/customer/notifications/read" method="POST">
                          <input type="hidden" name="notificationId" value={notif.id} />
                          <button
                            type="submit"
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all"
                            title="Tandai Sudah Dibaca"
                          >
                            Tandai Dibaca
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
