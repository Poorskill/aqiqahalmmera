import { RegisterForm } from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#faf9f6] text-[#2c1609]">
      {/* Left Brand & Value Area (Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-amber-900/10 via-amber-50/40 to-stone-100 border-r border-amber-900/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#865300_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <img src="/logo-almeera.png" alt="Aqiqah Almeera" className="h-12 w-auto object-contain" />
          <div>
            <h1 className="text-sm font-bold text-stone-900 tracking-wider uppercase">Aqiqah Almeera</h1>
            <p className="text-[11px] text-stone-600 font-medium tracking-wide">Hospitality & Catering Atelier</p>
          </div>
        </div>

        {/* Central Value Proposition */}
        <div className="space-y-6 relative z-10 max-w-xl my-auto py-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100/90 text-amber-900 text-xs font-semibold rounded-full shadow-2xs">
            <span className="material-symbols-outlined text-sm">verified</span>
            Bergabung Bersama Kami
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 leading-snug">
            Wujudkan Ibadah Aqiqah Penuh Berkah & Sesuai Syar&apos;i
          </h2>
          <p className="text-stone-600 text-sm lg:text-base leading-relaxed">
            Daftarkan akun Anda untuk mulai membuat pesanan aqiqah, memantau persiapan hewan, sertifikat, hingga pengiriman dengan mudah dalam satu portal.
          </p>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            <div className="p-4 bg-white/80 backdrop-blur-xs border border-amber-900/10 rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">person_check</span>
                Mudah & Praktis
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                Pesan aqiqah dari rumah dengan layanan digital terpadu.
              </p>
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-xs border border-amber-900/10 rounded-2xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">verified_user</span>
                Amanah & Terpercaya
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                Didukung oleh tim profesional berpengalaman belasan tahun.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-stone-500 relative z-10 flex items-center justify-between border-t border-amber-900/10 pt-6">
          <span>© 2026 Aqiqah Almeera. Seluruh hak cipta dilindungi.</span>
          <span className="font-mono text-[11px] text-amber-900/80">Secure Portal v2.5</span>
        </div>
      </div>

      {/* Right Register Area */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[390px] space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <div className="flex justify-center">
              <img src="/logo-almeera.png" alt="Aqiqah Almeera" className="h-12 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xs font-semibold text-stone-800 tracking-wider uppercase">Aqiqah Almeera</h1>
              <p className="text-[10px] text-stone-500 font-medium">Hospitality & Catering Atelier</p>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-stone-900">Buat Akun</h2>
              <p className="text-xs text-stone-500">Daftar untuk mulai membuat dan memantau pesanan.</p>
            </div>

            <RegisterForm initialError={error} />
          </div>

          <div className="text-center">
            <p className="text-[11px] text-stone-400">© 2026 Aqiqah Almeera. Aman & Terpercaya.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
