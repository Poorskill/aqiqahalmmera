'use client';

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.print();
        }
      }}
      className="px-6 py-3 bg-[#f39c0d] text-[#2c1609] brutalist-btn text-xs font-bold uppercase"
    >
      🖨️ {label}
    </button>
  );
}
