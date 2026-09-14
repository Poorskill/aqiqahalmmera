'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#faf9f6] text-[#2c1609]">
      <div className="max-w-xl w-full bg-white border border-red-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <span className="material-symbols-outlined text-2xl">error</span>
          <h2 className="text-lg font-bold">Terjadi Kesalahan pada Server</h2>
        </div>
        <p className="text-xs text-stone-600">
          Detail error sistem untuk pemecahan masalah:
        </p>
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-mono text-red-800 break-all overflow-auto max-h-48">
          {error?.message || String(error)}
          {error?.stack && (
            <pre className="mt-2 text-[10px] text-stone-600 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all"
        >
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
}
