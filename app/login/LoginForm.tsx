'use client';

import { useState } from 'react';
import Link from 'next/link';

export function LoginForm({ initialError }: { initialError?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200/60 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
          <span className="material-symbols-outlined text-base text-red-600 shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <form
        action="/api/auth/login"
        method="POST"
        onSubmit={() => setIsLoading(true)}
        className="space-y-3.5"
      >
        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="customer@almeera.com"
            className="w-full px-3 py-2 bg-stone-50/50 hover:bg-white focus:bg-white border border-stone-200/95 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 transition-all shadow-2xs"
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
              placeholder="••••••••"
              className="w-full px-3 pr-10 py-2 bg-stone-50/50 hover:bg-white focus:bg-white border border-stone-200/95 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <span className="material-symbols-outlined text-base">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-semibold tracking-wide shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </div>
      </form>

      <div className="pt-2 text-center">
        <p className="text-xs text-stone-500">
          Belum punya akun?{' '}
          <Link href="/register" className="text-amber-700 font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
