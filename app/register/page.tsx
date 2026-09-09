import Link from 'next/link';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 blueprint-grid">
      <div className="w-full max-w-md brutalist-card-lg p-8 bg-white">
        <div className="flex items-center justify-center mb-6 pb-4 border-b-2 border-[#775847]">
          <img src="/logo-almeera.png" alt="Logo Resmi Aqiqah Almeera" className="h-20 w-auto max-w-full object-contain" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-[#ba1a1a] text-[#ba1a1a] text-xs font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        <form action="/api/auth/register" method="POST" className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#775847] mb-1">
              Nama Lengkap Shohibul
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="contoh: Budi Santoso"
              className="w-full brutalist-input text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#775847] mb-1">
              Email Aktif
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="contoh: budi@gmail.com"
              className="w-full brutalist-input text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#775847] mb-1">
              No HP / WhatsApp
            </label>
            <input
              type="text"
              name="phone"
              required
              placeholder="081234567890"
              className="w-full brutalist-input text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#775847] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full brutalist-input text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-sm font-bold flex items-center justify-center gap-2 mt-6"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            DAFTAR AKUN BARU
          </button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-[#775847] text-center">
          <p className="text-xs text-[#775847] font-medium">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#865300] font-bold underline">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
