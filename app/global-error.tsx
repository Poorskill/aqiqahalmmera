'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#faf9f6] text-[#2c1609] font-sans">
        <div className="max-w-xl w-full bg-white border border-red-300 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-red-600">Application Error</h2>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-mono text-red-800 break-all overflow-auto max-h-48">
            {error?.message || String(error)}
          </div>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
