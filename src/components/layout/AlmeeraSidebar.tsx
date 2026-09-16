'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: string;
  userName: string;
}

export function AlmeeraSidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case 'master_admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { href: '/admin/orders', label: 'Manajemen Pesanan', icon: 'receipt_long' },
          { href: '/admin/orders/history', label: 'History Pesanan', icon: 'inventory_2' },
          { href: '/admin/payments', label: 'Manajemen Pembayaran', icon: 'payments' },
          { href: '/admin/orders/new', label: 'Buat Pesanan Manual', icon: 'post_add' },
          { href: '/admin/calendar', label: 'Kalender Operasional', icon: 'calendar_month' },
          { href: '/admin/reports', label: 'Laporan & Reports', icon: 'bar_chart' },
          { href: '/admin/audit', label: 'Audit Log & Control', icon: 'history' },
          { href: '/admin/customers', label: 'Manajemen Customer', icon: 'group' },
          { href: '/admin/staff', label: 'Manajemen Staff', icon: 'admin_panel_settings' },
          { href: '/admin/access-management', label: 'Access Management', icon: 'security' },
        ];
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { href: '/admin/orders', label: 'Manajemen Pesanan', icon: 'receipt_long' },
          { href: '/admin/orders/history', label: 'History Pesanan', icon: 'inventory_2' },
          { href: '/admin/payments', label: 'Manajemen Pembayaran', icon: 'payments' },
          { href: '/admin/orders/new', label: 'Buat Pesanan Manual', icon: 'post_add' },
          { href: '/admin/calendar', label: 'Kalender Operasional', icon: 'calendar_month' },
          { href: '/admin/reports', label: 'Laporan & Reports', icon: 'bar_chart' },
        ];
      case 'customer':
        return [
          { href: '/customer/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { href: '/customer/orders', label: 'Pesanan Saya', icon: 'receipt_long' },
          { href: '/customer/orders/new', label: 'Buat Pesanan Baru', icon: 'post_add' },
          { href: '/customer/profile', label: 'Profil Customer', icon: 'person' },
        ];
      case 'kandang':
        return [
          { href: '/kandang/dashboard', label: 'Dashboard Kandang', icon: 'pets' },
        ];
      case 'dapur':
        return [
          { href: '/dapur/dashboard', label: 'Dashboard Dapur', icon: 'skillet' },
        ];
      case 'driver':
        return [
          { href: '/driver/dashboard', label: 'Dashboard Driver', icon: 'local_shipping' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const roleDisplay = role === 'customer' ? 'Pelanggan' : role.replace('_', ' ');

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 shadow-xs flex flex-col shrink-0 select-none">
      <div>
        {/* Brand Header - Compact & Professional */}
        <div className="px-5 py-4 border-b border-stone-100 bg-[#faf9f6] flex items-center gap-3">
          <img src="/logo-almeera.png" alt="Logo Resmi Aqiqah Almeera" className="h-10 w-auto object-contain" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-stone-900 tracking-tight truncate">Aqiqah Almeera</span>
            <span className="text-[10px] text-stone-500 font-medium truncate">Layanan Aqiqah & Qurban</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3.5 space-y-1">
          <p className="px-3 text-xs font-semibold text-stone-400 tracking-wider mb-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 font-medium text-sm rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-stone-700 hover:bg-amber-50/80 hover:text-amber-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Area at Bottom */}
      <div className="p-3.5 border-t border-stone-100 bg-stone-50/60 mt-auto space-y-3">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-stone-200/60 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
            {userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-stone-800 truncate">{userName || 'User'}</span>
            <span className="text-[10px] text-stone-500 font-medium capitalize truncate">{roleDisplay}</span>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch('/api/auth/logout', {
                method: 'POST',
              });
              if (res.ok || res.redirected) {
                window.location.href = res.url || '/login';
              } else {
                window.location.href = '/login';
              }
            } catch {
              window.location.href = '/login';
            }
          }}
        >
          <button
            type="submit"
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Keluar Sistem
          </button>
        </form>
      </div>
    </aside>
  );
}
