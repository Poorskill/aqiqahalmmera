import React from 'react';

interface POProps {
  type: 'kandang' | 'dapur-a' | 'dapur-r' | 'driver';
  order: any;
  pageNumber?: number;
  totalPages?: number;
}

export function PurchaseOrderDocument({ type, order, pageNumber = 1, totalPages = 1 }: POProps) {
  const details = order.orderDetails || {};
  const kandang = order.kandangOrder || {};
  const dapur = order.dapurOrder || {};
  const driver = order.driverOrder || {};

  const getPoTitle = () => {
    switch (type) {
      case 'kandang': return 'PURCHASE ORDER — PERSIAPAN KANDANG';
      case 'dapur-a': return 'PURCHASE ORDER — PERSIAPAN DAPUR A';
      case 'dapur-r': return 'PURCHASE ORDER — PERSIAPAN DAPUR R';
      case 'driver': return 'PURCHASE ORDER — PENGANTARAN';
    }
  };

  const getPoSubtitle = () => {
    switch (type) {
      case 'kandang': return 'Instruksi Pemilihan, Penimbangan & Penyembelihan Hewan';
      case 'dapur-a': return 'Instruksi Pengolahan Masakan Utama & Paket Nasi Box';
      case 'dapur-r': return 'Instruksi Pengolahan Menu Tambahan & Perlengkapan Saji';
      case 'driver': return 'Instruksi Logistik, Rute & Pengantaran Pesanan ke Lokasi';
    }
  };

  const getPoDivisionBadge = () => {
    switch (type) {
      case 'kandang': return 'DIVISI KANDANG';
      case 'dapur-a': return 'DIVISI DAPUR A';
      case 'dapur-r': return 'DIVISI DAPUR R';
      case 'driver': return 'DIVISI LOGISTIK / DRIVER';
    }
  };

  const getPoNumber = () => {
    const code = type === 'kandang' ? 'KDG' : type === 'dapur-a' ? 'DPA' : type === 'dapur-r' ? 'DPR' : 'DRV';
    return `PO-${code}-${order.vendorInvoiceNo || '0001'}`;
  };

  const formatRupiah = (val: number | string | undefined | null) => {
    const num = Number(val || 0);
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const formatDateIndo = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTimeIndo = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white text-stone-900 p-8 md:p-10 font-sans border border-stone-200/90 rounded-2xl print:rounded-none shadow-xs print:border-none print:p-6 print:shadow-none text-xs leading-normal">
      {/* 1. Executive Document Header */}
      <div className="border-b border-stone-200 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo-almeera.png"
            alt="Logo Aqiqah Almeera"
            className="h-16 w-auto object-contain shrink-0"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900 uppercase">
                AQIQAH ALMEERA
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-100/80 text-amber-900 print:border print:border-amber-300">
                {getPoDivisionBadge()}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-amber-900 tracking-wide">
              Hospitality &amp; Catering Atelier — Syar&apos;i, Higienis &amp; Amanah
            </p>
            <p className="text-[11px] text-stone-600">
              Jl. Flores No.28B, Rawapasung, Sidanegara, Cilacap Tengah, Kab. Cilacap, Jawa Tengah
            </p>
            <p className="text-[11px] text-stone-600">
              Telp / WA: <span className="font-semibold text-stone-800">0816-516-546</span> &bull; Email: <span className="font-semibold text-stone-800">info@aqiqahalmeera.com</span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0 sm:border-l sm:border-stone-200 sm:pl-5 space-y-1">
          <span className="inline-block text-[10px] font-bold text-stone-500 uppercase tracking-widest">
            Nomor Dokumen
          </span>
          <div className="font-mono text-sm font-bold text-amber-900 bg-amber-50/70 border border-amber-200/80 rounded-lg px-2.5 py-1">
            {getPoNumber()}
          </div>
          <p className="text-[10px] text-stone-500">
            Tgl Cetak: <span className="font-medium text-stone-700">{new Date().toLocaleDateString('id-ID')}</span>
          </p>
        </div>
      </div>

      {/* 2. Document Title Section */}
      <div className="flex items-center justify-between bg-stone-50 border border-stone-200/80 rounded-xl px-4 py-2.5 mb-5">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            {getPoTitle()}
          </h2>
          <p className="text-[11px] text-stone-600 mt-0.5 font-medium">{getPoSubtitle()}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-stone-200/70 text-stone-800">
            Status: {order.status}
          </span>
        </div>
      </div>

      {/* 3. Dual-Card Metadata & Shohibul Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Card A: Identitas Pesanan & Operasional */}
        <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50 space-y-1.5">
          <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Informasi Pesanan
          </div>
          <div className="grid grid-cols-3 text-xs gap-y-1 pt-0.5">
            <span className="text-stone-500 font-medium">No. Invoice</span>
            <span className="col-span-2 font-mono font-bold text-stone-900">{order.invoiceNo || order.vendorInvoiceNo}</span>

            <span className="text-stone-500 font-medium">Vendor Ref</span>
            <span className="col-span-2 font-mono font-semibold text-stone-800">{order.vendorInvoiceNo}</span>

            <span className="text-stone-500 font-medium">Jenis Order</span>
            <span className="col-span-2 uppercase font-bold text-amber-900">{order.jenisOrder || 'Aqiqah'}</span>

            <span className="text-stone-500 font-medium">Terakhir Update</span>
            <span className="col-span-2 text-stone-700">{formatDateTimeIndo(order.updatedAt || order.createdAt)}</span>

            {type === 'driver' && (
              <>
                <span className="text-stone-500 font-medium">Uang Saku Driver</span>
                <span className="col-span-2 font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block w-fit">
                  {formatRupiah(details.uangSakuDriver || 50000)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card B: Data Shohibul & Kontak */}
        <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50 space-y-1.5">
          <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Data Shohibul &amp; Pengiriman
          </div>
          <div className="grid grid-cols-3 text-xs gap-y-1 pt-0.5">
            <span className="text-stone-500 font-medium">Atas Nama</span>
            <span className="col-span-2 font-bold text-stone-950">{order.atasNama}</span>

            <span className="text-stone-500 font-medium">Orang Tua</span>
            <span className="col-span-2 text-stone-800">
              {details.fatherName || details.parentName?.split('&')[0]?.trim() || '-'} &bull; {details.motherName || details.parentName?.split('&')[1]?.trim() || '-'}
            </span>

            <span className="text-stone-500 font-medium">Nama Anak</span>
            <span className="col-span-2 font-bold text-amber-900">{details.childName || '-'}</span>

            <span className="text-stone-500 font-medium">Penerima Lokasi</span>
            <span className="col-span-2 text-stone-900">{details.recipientName || order.atasNama} {details.phone ? `(${details.phone})` : ''}</span>
          </div>
        </div>
      </div>

      {/* 4. Jadwal & Alamat Pengiriman Banner */}
      <div className="border border-amber-900/15 bg-amber-50/40 rounded-xl p-3 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
            Alamat Pengiriman Tujuan:
          </span>
          <p className="text-stone-800 font-medium leading-snug mt-0.5">
            {details.address || '-'}
          </p>
        </div>
        <div className="sm:text-right shrink-0 bg-white border border-amber-200/80 rounded-lg px-3 py-1.5 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Jadwal Tiba Lokasi
          </span>
          <p className="font-bold text-stone-900 text-xs">
            {formatDateIndo(details.deliveryDate)}
          </p>
          <p className="text-[11px] font-semibold text-amber-900">
            Pukul {details.deliveryTime || '09:00 WIB'}
          </p>
        </div>
      </div>

      {/* 5. Division Operational Details Table */}
      <div className="mb-5 border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-stone-100/90 border-b border-stone-200 px-3.5 py-2 font-bold uppercase tracking-wider text-stone-800 text-[11px] flex items-center justify-between">
          <span>
            Spesifikasi Operasional — {getPoDivisionBadge()}
          </span>
          <span className="text-[10px] font-normal lowercase text-stone-500">
            instruksi teknis pengerjaan
          </span>
        </div>

        {type === 'kandang' && (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-left font-semibold text-stone-600">
                <th className="p-2.5 w-10 text-center">No.</th>
                <th className="p-2.5 border-l border-stone-200">Jenis / Komponen Hewan</th>
                <th className="p-2.5 border-l border-stone-200">Catatan Khusus Kandang</th>
                <th className="p-2.5 border-l border-stone-200 w-44">Jadwal Sembelih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-stone-50/50">
                  <td className="p-2.5 font-bold text-center text-stone-700">{idx + 1}</td>
                  <td className="p-2.5 border-l border-stone-200 font-bold text-stone-900">{it.animalOrder || details.animalOrder || 'Kambing Jantan Super'}</td>
                  <td className="p-2.5 border-l border-stone-200 text-stone-700">{it.kandangNote || details.kandangNote || '-'}</td>
                  <td className="p-2.5 border-l border-stone-200 font-semibold text-amber-900">{kandang.slaughterSchedule || `${details.deliveryDate || ''} 06:00 WIB`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'dapur-a' && (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-left font-semibold text-stone-600">
                <th className="p-2.5 w-10 text-center">No.</th>
                <th className="p-2.5 border-l border-stone-200">Olahan Masakan Dapur A</th>
                <th className="p-2.5 border-l border-stone-200">Paket Nasi Box Dapur A</th>
                <th className="p-2.5 border-l border-stone-200 w-44">Jadwal Masak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-stone-50/50">
                  <td className="p-2.5 font-bold text-center text-stone-700">{idx + 1}</td>
                  <td className="p-2.5 border-l border-stone-200 font-bold text-stone-900">{it.dapurAMasakan || details.dapurAMasakan || 'Gulai Kambing Standar'}</td>
                  <td className="p-2.5 border-l border-stone-200 font-medium text-stone-800">{it.dapurANasiBox || details.dapurANasiBox || 'Nasi Box Standar'}</td>
                  <td className="p-2.5 border-l border-stone-200 font-semibold text-purple-900">{dapur.cookingSchedule || `${details.deliveryDate || ''} 07:30 WIB`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'dapur-r' && (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-left font-semibold text-stone-600">
                <th className="p-2.5 w-10 text-center">No.</th>
                <th className="p-2.5 border-l border-stone-200">Olahan Masakan Dapur R</th>
                <th className="p-2.5 border-l border-stone-200">Pelengkap &amp; Kemasan</th>
                <th className="p-2.5 border-l border-stone-200 w-44">Jadwal Saji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className="hover:bg-stone-50/50">
                  <td className="p-2.5 font-bold text-center text-stone-700">{idx + 1}</td>
                  <td className="p-2.5 border-l border-stone-200 font-bold text-stone-900">{it.dapurRMasakan || details.dapurRMasakan || 'Sate Kambing Tambahan'}</td>
                  <td className="p-2.5 border-l border-stone-200 font-medium text-stone-800">{it.dapurRNasiBox || details.dapurRNasiBox || 'Kerupuk & Buah'}</td>
                  <td className="p-2.5 border-l border-stone-200 font-semibold text-amber-900">08:00 WIB</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'driver' && (
          <table className="w-full text-xs border-collapse">
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="p-2.5 font-bold w-1/3 bg-stone-50 text-stone-700">Kontak Person Penerima</td>
                <td className="p-2.5 font-bold text-stone-950">{details.recipientName || order.atasNama} {details.phone ? `(${details.phone})` : ''}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-stone-50 text-stone-700">Armada Driver / Kendaraan</td>
                <td className="p-2.5 font-bold text-stone-900">{details.driverInfo || driver.contactPerson || 'Armada Almeera Cilacap'}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-stone-50 text-stone-700">Uang Saku Driver</td>
                <td className="p-2.5 font-mono font-bold text-emerald-800">{formatRupiah(details.uangSakuDriver || 50000)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* 6. Special Orders & Operational Instructions */}
      {details.pesananLainnya && (
        <div className="mb-4 border border-amber-300/80 bg-amber-50/50 rounded-xl p-3.5 space-y-1">
          <p className="font-bold uppercase text-amber-950 text-[10px] tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
            Pesanan Tambahan / Khusus:
          </p>
          <p className="text-stone-800 font-medium leading-relaxed pl-4">{details.pesananLainnya}</p>
        </div>
      )}

      <div className="mb-6 border-l-3 border-amber-600 bg-stone-50/80 rounded-r-xl border-y border-r border-stone-200 p-3.5 space-y-1">
        <p className="font-bold uppercase text-stone-800 text-[10px] tracking-wider">
          {type === 'kandang' ? 'Instruksi Khusus Divisi Kandang' : type === 'dapur-a' ? 'Instruksi Khusus Divisi Dapur A' : type === 'dapur-r' ? 'Instruksi Khusus Divisi Dapur R' : 'Instruksi Khusus Driver'}:
        </p>
        <p className="text-stone-700 leading-relaxed text-[11px]">
          {type === 'kandang' && (details.pesanKandang || kandang.notes || details.kandangNote || 'Hewan wajib sehat, cukup umur, dan disembelih sesuai syariat Islam.')}
          {type === 'dapur-a' && (details.pesanDapurA || dapur.notes || details.dapurANote || 'Pastikan kemasan higienis, porsi tepat, dan cita rasa sesuai standar Aqiqah Almeera.')}
          {type === 'dapur-r' && (details.pesanDapurR || details.dapurRNote || 'Koordinasikan ketepatan waktu penyajian dengan divisi logistik & pengantaran.')}
          {type === 'driver' && (details.pesanDriver || 'Pastikan pesanan utuh, tiba tepat waktu sesuai jadwal, dan unggah foto bukti serah terima.')}
        </p>
      </div>

      {/* 7. Corporate Dual Signature Area */}
      <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-stone-200">
        <div className="text-center space-y-10">
          <p className="font-bold uppercase text-stone-700 tracking-wider text-[11px]">Diterbitkan Oleh (Admin Almeera)</p>
          <div className="pt-8">
            <p className="border-t border-stone-300 inline-block px-10 pt-1 font-bold text-stone-900">( Administrator Operasional )</p>
          </div>
        </div>
        <div className="text-center space-y-10">
          <p className="font-bold uppercase text-stone-700 tracking-wider text-[11px]">Diterima / Pelaksana ({type.toUpperCase()})</p>
          <div className="pt-8">
            <p className="border-t border-stone-300 inline-block px-10 pt-1 font-bold text-stone-900">( Petugas Pelaksana Lapangan )</p>
          </div>
        </div>
      </div>

      {/* 8. Professional Document Footer */}
      <div className="mt-8 pt-3 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-500">
        <p className="font-medium tracking-wide">
          AQIQAH ALMEERA CILACAP &bull; SISTEM MANAJEMEN OPERASIONAL TERPADU
        </p>
        <p className="font-mono font-semibold text-stone-600">
          Halaman {pageNumber} dari {totalPages} &bull; Ref: {getPoNumber()}
        </p>
      </div>
    </div>
  );
}
