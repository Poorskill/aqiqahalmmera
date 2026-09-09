import Link from 'next/link';

export default async function LoginPage({
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

        <form action="/api/auth/login" method="POST" className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#775847] mb-1">
              Email Operator / Customer
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="contoh: customer@almeera.com"
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
            <span className="material-symbols-outlined text-lg">login</span>
            MASUK KE SISTEM
          </button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-[#775847] text-center">
          <p className="text-xs text-[#775847] font-medium">
            Belum punya akun customer?{' '}
            <Link href="/register" className="text-[#865300] font-bold underline">
              Daftar Sekarang
            </Link>
          </p>
          <div className="mt-4 p-3 bg-[#f3f4f5] border-2 border-[#775847] text-left text-xs font-mono space-y-1">
            <p className="font-bold uppercase text-[#865300]">Demo Credentials:</p>
            <p>Admin: admin@almeera.com / password123</p>
            <p>Customer: customer@almeera.com / password123</p>
            <p>Kandang: kandang@almeera.com / password123</p>
            <p>Dapur: dapur@almeera.com / password123</p>
            <p>Driver: driver@almeera.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
