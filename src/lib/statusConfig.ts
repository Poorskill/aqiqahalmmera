export interface StatusInfo {
  label: string;
  bg: string;
  text: string;
  border: string;
  stepNumber: number;
}

export const statusConfig: Record<string, StatusInfo> = {
  waiting_review: {
    label: "Menunggu Pemeriksaan Admin",
    bg: "bg-amber-100",
    text: "text-amber-900",
    border: "border-amber-600",
    stepNumber: 1,
  },
  quotation_sent: {
    label: "Penawaran Harga Dikirim",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-600",
    stepNumber: 2,
  },
  quotation_approved: {
    label: "Penawaran Disetujui Shohibul",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-600",
    stepNumber: 3,
  },
  preparing: {
    label: "Persiapan di Kandang",
    bg: "bg-yellow-100",
    text: "text-yellow-900",
    border: "border-yellow-600",
    stepNumber: 4,
  },
  slaughtering: {
    label: "Proses Penyembelihan",
    bg: "bg-orange-100",
    text: "text-orange-900",
    border: "border-orange-600",
    stepNumber: 5,
  },
  cooking: {
    label: "Pengolahan di Dapur",
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-600",
    stepNumber: 6,
  },
  packaging: {
    label: "Pengemasan Pesanan",
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    border: "border-indigo-600",
    stepNumber: 7,
  },
  delivery: {
    label: "Sedang Dikirim Kurir",
    bg: "bg-sky-100",
    text: "text-sky-900",
    border: "border-sky-600",
    stepNumber: 8,
  },
  completed: {
    label: "Pesanan Selesai",
    bg: "bg-green-200",
    text: "text-green-950",
    border: "border-green-700",
    stepNumber: 9,
  },
  cancelled: {
    label: "Dibatalkan / Ditolak",
    bg: "bg-red-100",
    text: "text-red-900",
    border: "border-red-600",
    stepNumber: 0,
  },
};

export const orderSteps = [
  { key: "waiting_review", title: "Pemeriksaan Admin" },
  { key: "quotation_sent", title: "Penawaran Harga" },
  { key: "quotation_approved", title: "Persetujuan Shohibul" },
  { key: "preparing", title: "Persiapan Kandang" },
  { key: "slaughtering", title: "Penyembelihan" },
  { key: "cooking", title: "Pengolahan Dapur" },
  { key: "packaging", title: "Pengemasan" },
  { key: "delivery", title: "Pengiriman Kurir" },
  { key: "completed", title: "Selesai" },
];
