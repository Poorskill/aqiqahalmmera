'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface TopbarProps {
  title: string;
  subtitle: string;
  role: string;
  unreadCount?: number;
}

export function AlmeeraTopbar({ title, subtitle, role, unreadCount: initialUnreadCount }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount || 0);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === 'customer') {
      fetch('/api/customer/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/customer/notifications/read-all', { method: 'POST' });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
    } catch {}
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const formData = new FormData();
      formData.append('notificationId', id);
      await fetch('/api/customer/notifications/read', { method: 'POST', body: formData });
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch {}
  };

  return (
    <header className="bg-white border-b border-stone-200 px-8 py-5 flex items-center justify-between shrink-0 shadow-xs relative">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 tracking-wider uppercase mb-1">
          <span>Aqiqah Almeera</span>
          <span>/</span>
          <span>{title}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">{subtitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        {role === 'customer' && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 transition-all flex items-center justify-center"
              title="Notifikasi"
            >
              <span className="material-symbols-outlined text-xl text-stone-700">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
                <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-700 text-base">notifications</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">Notifikasi Pesanan</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      Belum ada notifikasi.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 transition-colors flex items-start gap-3 ${!n.readAt ? 'bg-amber-50/40' : 'hover:bg-stone-50'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          n.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <span className="material-symbols-outlined text-base">
                            {n.category === 'pembayaran' ? 'payments' : 'receipt_long'}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-stone-900">{n.title}</h5>
                            {!n.readAt && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-[10px] text-stone-400 hover:text-stone-700"
                                title="Tandai dibaca"
                              >
                                ●
                              </button>
                            )}
                          </div>
                          <p className="text-stone-600 leading-relaxed">{n.message}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-stone-400 font-medium">
                              {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {n.actionUrl && (
                              <Link
                                href={n.actionUrl}
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-0.5"
                              >
                                Tinjau →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
                  <Link
                    href="/customer/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    Buka Halaman Notifikasi Lengkap →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700">
          <span className="material-symbols-outlined text-base text-amber-600">verified</span>
          <span>Cilacap Central Hub</span>
        </div>
        <div className="w-10 h-10 bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center shadow-sm text-sm">
          {role.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
