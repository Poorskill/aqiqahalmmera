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
      case 'kandang': return 'Instruksi Pemilihan & Penyembelihan Hewan';
      case 'dapur-a': return 'Instruksi Pengolahan Masakan Utama & Nasi Box';
      case 'dapur-r': return 'Instruksi Pengolahan Masakan Pendukung & Kemasan';
      case 'driver': return 'Instruksi Rute & Pengantaran Pesanan ke Pemesan';
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
    <div className="max-w-[210mm] mx-auto bg-white text-stone-900 p-8 md:p-10 font-sans border border-stone-300 print:border-none print:p-6 shadow-sm print:shadow-none text-xs leading-normal">
      {/* 1. Header with Official Branding */}
      <div className="border-b-2 border-stone-900 pb-4 mb-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="/logo-almeera.png"
            alt="Logo Aqiqah Almeera"
            className="h-16 w-auto object-contain shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 uppercase">AQIQAH ALMEERA</h1>
            <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wide">
              Layanan Aqiqah &amp; Catering Profesional — Syar&apos;i, Higienis &amp; Amanah
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Jl. Flores No.28B, Rawapasung, Sidanegara, Kec. Cilacap Tengah, Kab. Cilacap, Jawa Tengah
            </p>
            <p className="text-[11px] text-stone-600">
              Telp / WA: <span className="font-semibold text-stone-800">0816-516-546</span> | Email: <span className="font-semibold text-stone-800">info@aqiqahalmeera.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Document Title Banner */}
      <div className="text-center mb-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-950 border-b-2 border-stone-900 pb-1 inline-block">
          {getPoTitle()}
        </h2>
        <p className="text-[11px] text-stone-600 mt-1 font-medium">{getPoSubtitle()}</p>
      </div>

      {/* 3. Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-5 border border-stone-400 p-3.5 bg-stone-50 print:bg-white rounded-xs">
        <div className="space-y-1">
          <div className="flex">
            <span className="w-28 font-bold text-stone-700">No. Dokumen</span>
            <span className="mr-2">:</span>
            <span className="font-mono font-bold text-stone-950">{getPoNumber()}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-bold text-stone-700">No. Invoice</span>
            <span className="mr-2">:</span>
            <span className="font-mono text-stone-900">{order.invoiceNo || order.vendorInvoiceNo}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-bold text-stone-700">Vendor Ref</span>
            <span className="mr-2">:</span>
            <span className="font-mono font-semibold text-stone-900">{order.vendorInvoiceNo}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-bold text-stone-700">Jenis Order</span>
            <span className="mr-2">:</span>
            <span className="uppercase font-bold text-stone-900">{order.jenisOrder || 'Aqiqah'}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex">
            <span className="w-32 font-bold text-stone-700">Tanggal Cetak</span>
            <span className="mr-2">:</span>
            <span className="text-stone-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-stone-700">Terakhir Update</span>
            <span className="mr-2">:</span>
            <span className="text-stone-900">{formatDateTimeIndo(order.updatedAt || order.createdAt)}</span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-stone-700">Status Pesanan</span>
            <span className="mr-2">:</span>
            <span className="uppercase font-bold text-stone-900">{order.status}</span>
          </div>
          {type === 'driver' && (
            <div className="flex">
              <span className="w-32 font-bold text-stone-700">Uang Saku Driver</span>
              <span className="mr-2">:</span>
              <span className="font-mono font-bold text-stone-950">{formatRupiah(details.uangSakuDriver || 50000)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Section 1: Customer & Delivery Information */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider bg-stone-900 text-white px-3 py-1.5 mb-1.5">
          1. Data Shohibul &amp; Jadwal Pengiriman
        </h3>
        <table className="w-full text-xs border-collapse border border-stone-400">
          <tbody>
            <tr className="border-b border-stone-300">
              <td className="p-2 font-bold w-1/3 border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Nama Pemesan / Atas Nama</td>
              <td className="p-2 font-bold text-stone-950">{order.atasNama}</td>
            </tr>
            <tr className="border-b border-stone-300">
              <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Nama Orang Tua (Ayah / Ibu)</td>
              <td className="p-2 text-stone-900">
                {details.fatherName || details.parentName?.split('&')[0]?.trim() || '-'} / {details.motherName || details.parentName?.split('&')[1]?.trim() || '-'}
              </td>
            </tr>
            <tr className="border-b border-stone-300">
              <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Nama Anak</td>
              <td className="p-2 font-bold text-stone-950">{details.childName || '-'}</td>
            </tr>
            <tr className="border-b border-stone-300">
              <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Penerima di Lokasi</td>
              <td className="p-2 text-stone-900">{details.recipientName || order.atasNama} {details.phone ? `(${details.phone})` : ''}</td>
            </tr>
            <tr className="border-b border-stone-300">
              <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Alamat Pengiriman</td>
              <td className="p-2 text-stone-900 leading-relaxed">{details.address || '-'}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Jadwal Tiba Pengiriman</td>
              <td className="p-2 font-bold text-stone-950">
                {formatDateIndo(details.deliveryDate)} — Pukul {details.deliveryTime || '09:00 WIB'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Section 2: Division Specific Operational Details */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider bg-stone-900 text-white px-3 py-1.5 mb-1.5">
          2. {type === 'kandang' ? 'Spesifikasi Hewan & Jadwal Sembelih' : type === 'dapur-a' ? 'Spesifikasi Menu Dapur A' : type === 'dapur-r' ? 'Spesifikasi Menu Dapur R' : 'Rute & Kontak Pengiriman Driver'}
        </h3>
        
        {type === 'kandang' && (
          <table className="w-full text-xs border-collapse border border-stone-400">
            <thead>
              <tr className="bg-stone-200 print:bg-stone-100 border-b border-stone-400 text-left font-bold text-stone-900">
                <th className="p-2 border-r border-stone-400 w-10 text-center">No.</th>
                <th className="p-2 border-r border-stone-400">Tipe &amp; Komponen Hewan</th>
                <th className="p-2 border-r border-stone-400">Catatan Khusus Kandang</th>
                <th className="p-2 w-44">Jadwal Sembelih</th>
              </tr>
            </thead>
            <tbody>
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className={idx > 0 ? 'border-t border-stone-300' : ''}>
                  <td className="p-2 border-r border-stone-300 font-bold text-center text-stone-800">{idx + 1}</td>
                  <td className="p-2 border-r border-stone-300 font-bold text-stone-950">{it.animalOrder || details.animalOrder || 'Kambing Jantan Super'}</td>
                  <td className="p-2 border-r border-stone-300 text-stone-800">{it.kandangNote || details.kandangNote || '-'}</td>
                  <td className="p-2 font-medium text-stone-900">{kandang.slaughterSchedule || `${details.deliveryDate || ''} 06:00 WIB`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'dapur-a' && (
          <table className="w-full text-xs border-collapse border border-stone-400">
            <thead>
              <tr className="bg-stone-200 print:bg-stone-100 border-b border-stone-400 text-left font-bold text-stone-900">
                <th className="p-2 border-r border-stone-400 w-10 text-center">No.</th>
                <th className="p-2 border-r border-stone-400">Olahan Masakan Kambing</th>
                <th className="p-2 border-r border-stone-400">Menu Nasi Box</th>
                <th className="p-2 w-44">Jadwal Pengolahan</th>
              </tr>
            </thead>
            <tbody>
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className={idx > 0 ? 'border-t border-stone-300' : ''}>
                  <td className="p-2 border-r border-stone-300 font-bold text-center text-stone-800">{idx + 1}</td>
                  <td className="p-2 border-r border-stone-300 font-bold text-stone-950">{it.dapurAMasakan || details.dapurAMasakan || 'Gulai Kambing Standar'}</td>
                  <td className="p-2 border-r border-stone-300 font-medium text-stone-900">{it.dapurANasiBox || details.dapurANasiBox || 'Nasi Box Standar'}</td>
                  <td className="p-2 font-medium text-stone-900">{dapur.cookingSchedule || `${details.deliveryDate || ''} 07:30 WIB`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'dapur-r' && (
          <table className="w-full text-xs border-collapse border border-stone-400">
            <thead>
              <tr className="bg-stone-200 print:bg-stone-100 border-b border-stone-400 text-left font-bold text-stone-900">
                <th className="p-2 border-r border-stone-400 w-10 text-center">No.</th>
                <th className="p-2 border-r border-stone-400">Olahan Masakan Tambahan</th>
                <th className="p-2 border-r border-stone-400">Paket Nasi / Pelengkap</th>
                <th className="p-2 w-44">Jadwal Saji</th>
              </tr>
            </thead>
            <tbody>
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className={idx > 0 ? 'border-t border-stone-300' : ''}>
                  <td className="p-2 border-r border-stone-300 font-bold text-center text-stone-800">{idx + 1}</td>
                  <td className="p-2 border-r border-stone-300 font-bold text-stone-950">{it.dapurRMasakan || details.dapurRMasakan || 'Sate Kambing Tambahan'}</td>
                  <td className="p-2 border-r border-stone-300 font-medium text-stone-900">{it.dapurRNasiBox || details.dapurRNasiBox || 'Kerupuk & Buah'}</td>
                  <td className="p-2 font-medium text-stone-900">08:00 WIB</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'driver' && (
          <table className="w-full text-xs border-collapse border border-stone-400">
            <tbody>
              <tr className="border-b border-stone-300">
                <td className="p-2 font-bold w-1/3 border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Kontak Person Penerima</td>
                <td className="p-2 font-bold text-stone-950">{details.recipientName || order.atasNama} {details.phone ? `(${details.phone})` : ''}</td>
              </tr>
              <tr className="border-b border-stone-300">
                <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Armada &amp; Personil Driver</td>
                <td className="p-2 font-bold text-stone-950">{details.driverInfo || driver.contactPerson || 'Armada Almeera Cilacap'}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-stone-300 bg-stone-100 print:bg-white text-stone-800">Uang Saku Driver</td>
                <td className="p-2 font-mono font-bold text-stone-950">{formatRupiah(details.uangSakuDriver || 50000)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* 6. Section 3: Operational Notes & Special Request */}
      {details.pesananLainnya && (
        <div className="mb-4 border border-stone-400 p-3 text-xs bg-stone-50 print:bg-white rounded-xs">
          <p className="font-bold uppercase mb-1 text-stone-900">Pesanan Tambahan (Khusus):</p>
          <p className="text-stone-800 font-medium leading-relaxed">{details.pesananLainnya}</p>
        </div>
      )}

      <div className="mb-6 border border-stone-400 p-3 text-xs bg-stone-50 print:bg-white rounded-xs space-y-1.5">
        <p className="font-bold uppercase text-stone-900">
          {type === 'kandang' ? 'Instruksi Operasional Kandang' : type === 'dapur-a' ? 'Instruksi Operasional Dapur A' : type === 'dapur-r' ? 'Instruksi Operasional Dapur R' : 'Instruksi Operasional Driver'}:
        </p>
        <p className="text-stone-800 leading-relaxed">
          {type === 'kandang' && (details.pesanKandang || kandang.notes || details.kandangNote || 'Hewan wajib sehat, cukup umur, dan disembelih sesuai syariat Islam.')}
          {type === 'dapur-a' && (details.pesanDapurA || dapur.notes || details.dapurANote || 'Pastikan kemasan higienis, porsi tepat, dan rasa sesuai standar Aqiqah Almeera.')}
          {type === 'dapur-r' && (details.pesanDapurR || details.dapurRNote || 'Koordinasikan waktu penyajian dengan divisi pengantaran.')}
          {type === 'driver' && (details.pesanDriver || 'Pastikan pesanan utuh, tiba tepat waktu sesuai jadwal, dan unggah bukti serah terima.')}
        </p>
      </div>

      {/* 7. Section 4: Signature Area */}
      <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-stone-400">
        <div className="text-center space-y-10">
          <p className="font-bold uppercase text-stone-800">Diterbitkan Oleh (Admin)</p>
          <div className="pt-8">
            <p className="border-t border-stone-900 inline-block px-10 pt-1 font-bold text-stone-950">( Administrator Almeera )</p>
          </div>
        </div>
        <div className="text-center space-y-10">
          <p className="font-bold uppercase text-stone-800">Diterima / Pelaksana ({type.toUpperCase()})</p>
          <div className="pt-8">
            <p className="border-t border-stone-900 inline-block px-10 pt-1 font-bold text-stone-950">( Petugas Operasional )</p>
          </div>
        </div>
      </div>

      {/* 8. Footer with Document Number & Page Count */}
      <div className="mt-8 pt-3 border-t border-stone-300 flex justify-between items-center text-[10px] text-stone-600">
        <p className="font-medium tracking-wide">AQIQAH ALMEERA CILACAP — SISTEM MANAJEMEN OPERASIONAL</p>
        <p className="font-mono font-semibold">
          Halaman {pageNumber} dari {totalPages} | Ref: {getPoNumber()}
        </p>
      </div>
    </div>
  );
}
