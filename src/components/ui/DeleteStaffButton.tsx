'use client';

export function DeleteStaffButton({ staffId }: { staffId: string }) {
  return (
    <form
      action={`/api/admin/staff/${staffId}/delete`}
      method="POST"
      onSubmit={(e) => {
        if (!confirm('Apakah Anda yakin ingin menghapus akun staff ini secara permanen?')) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
      >
        <span className="material-symbols-outlined text-base">delete</span>
        Hapus Staff Ini
      </button>
    </form>
  );
}
