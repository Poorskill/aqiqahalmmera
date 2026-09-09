'use client';

import { useState } from 'react';
import Link from 'next/link';

export function RegisterForm({ initialError }: { initialError?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (password !== confirmPassword) {
      e.preventDefault();
      setError('Konfirmasi password tidak sama.');
      return;
    }
    setIsLoading(true);
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-medium">
          <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <form
        action="/api/auth/register"
        method="POST"
        onSubmit={handleSubmit}
        className="space-y-3.5"
      >
        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-700">
            Nama lengkap
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Budi Santoso"
            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-2xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-700">
            Email aktif
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="nama@email.com"
            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-2xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-700">
            Nomor WhatsApp
          </label>
          <input
            type="text"
            name="phone"
            required
            placeholder="081234567890"
            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-2xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 karakter"
              className="w-full px-3.5 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-700">
            Konfirmasi password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="w-full px-3.5 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
              title={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <span className="material-symbols-outlined text-lg">
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-sm font-medium shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-3"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Memproses...
            </>
          ) : (
            'Daftar'
          )}
        </button>
      </form>

      <div className="pt-3 text-center">
        <p className="text-xs text-stone-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-amber-700 font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
