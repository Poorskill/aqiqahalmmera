'use client';

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.print();
        }
      }}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
    >
      <span className="material-symbols-outlined text-base">print</span>
      <span>{label}</span>
    </button>
  );
}
