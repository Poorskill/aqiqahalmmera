import React from 'react';

interface POProps {
  type: 'kandang' | 'dapur-a' | 'dapur-r' | 'driver';
  order: any;
}

export function PurchaseOrderDocument({ type, order }: POProps) {
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
      case 'kandang': return 'Purchase Order Persiapan Kandang';
      case 'dapur-a': return 'Purchase Order Persiapan Dapur A';
      case 'dapur-r': return 'Purchase Order Persiapan Dapur R';
      case 'driver': return 'Purchase Order Pengantaran';
    }
  };

  const getPoNumber = () => {
    const code = type === 'kandang' ? 'KDG' : type === 'dapur-a' ? 'DPA' : type === 'dapur-r' ? 'DPR' : 'DRV';
    return `PO-${code}-${order.vendorInvoiceNo || '0001'}`;
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black p-8 md:p-12 print:p-0 font-sans border border-gray-300 print:border-none shadow-sm print:shadow-none">
      {/* Company Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo-almeera.png"
            alt="Logo Aqiqah Almeera"
            className="h-16 w-auto object-contain shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">AQIQAH ALMEERA</h1>
            <p className="text-xs font-semibold text-gray-700 uppercase">Layanan Aqiqah &amp; Catering Profesional</p>
            <p className="text-xs text-gray-600 mt-1">
              Jl. Flores No.28B, Rawapasung, Sidanegara, Kec. Cilacap Tengah, Kab. Cilacap, Jawa Tengah
            </p>
            <p className="text-xs text-gray-600">Telp / WA: 0816-516-546 | Email: info@aqiqahalmeera.com</p>
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-base font-bold uppercase tracking-widest border-b border-black pb-1.5 inline-block">
          {getPoTitle()}
        </h2>
        <p className="text-xs text-gray-600 mt-1 font-medium">{getPoSubtitle()}</p>
      </div>

      {/* Metadata / Identification Two-Column */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-gray-400 p-4 bg-gray-50 print:bg-white rounded-sm">
        <div className="space-y-1.5">
          <div className="flex"><span className="w-32 font-bold">No. PO</span><span className="mr-2">:</span><span className="font-mono font-bold">{getPoNumber()}</span></div>
          <div className="flex"><span className="w-32 font-bold">No. Invoice</span><span className="mr-2">:</span><span>{order.invoiceNo || order.vendorInvoiceNo}</span></div>
          <div className="flex"><span className="w-32 font-bold">Vendor Invoice</span><span className="mr-2">:</span><span>{order.vendorInvoiceNo}</span></div>
        </div>
        <div className="space-y-1.5">
          <div className="flex"><span className="w-32 font-bold">Tanggal Cetak</span><span className="mr-2">:</span><span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span></div>
          <div className="flex"><span className="w-32 font-bold">Jenis Order</span><span className="mr-2">:</span><span className="uppercase font-bold">{order.jenisOrder}</span></div>
          <div className="flex"><span className="w-32 font-bold">Status Pesanan</span><span className="mr-2">:</span><span className="uppercase font-bold">{order.status}</span></div>
          {type === 'driver' && (
            <div className="flex"><span className="w-32 font-bold">Uang Saku Driver</span><span className="mr-2">:</span><span className="font-mono font-bold text-gray-900">Rp {(details.uangSakuDriver || 50000).toLocaleString('id-ID')}</span></div>
          )}
        </div>
      </div>

      {/* 1. Order & Customer Information */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1.5 mb-2">
          1. Informasi Shohibul & Pengiriman
        </h3>
        <table className="w-full text-xs border-collapse border border-gray-400">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold w-1/3 border-r border-gray-300 bg-gray-50 print:bg-white">Nama Pemesan</td>
              <td className="p-2 font-medium">{order.atasNama}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Nama Ayah</td>
              <td className="p-2">{details.fatherName || details.parentName?.split('&')[0]?.trim() || '-'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Nama Ibu</td>
              <td className="p-2">{details.motherName || details.parentName?.split('&')[1]?.trim() || '-'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Nama Anak</td>
              <td className="p-2">{details.childName || '-'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Nama Penerima Tujuan</td>
              <td className="p-2">{details.recipientName || '-'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Alamat Pengiriman</td>
              <td className="p-2">{details.address || '-'}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Jadwal Pengiriman</td>
              <td className="p-2 font-bold">{details.deliveryDate || '-'} ({details.deliveryTime || '09:00 WIB'})</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Operational Specific Details */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1.5 mb-2">
          2. {type === 'kandang' ? 'Pesanan Kambing' : type === 'dapur-a' ? 'Pesanan Dapur A' : type === 'dapur-r' ? 'Pesanan Menu' : 'Alamat Lengkap & Pengantaran'}
        </h3>
        
        {type === 'kandang' && (
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 text-left">
                <th className="p-2 border-r border-gray-400 w-12 text-center">No.</th>
                <th className="p-2 border-r border-gray-400">Jenis Komponen Hewan</th>
                <th className="p-2 border-r border-gray-400">Catatan Kandang</th>
                <th className="p-2">Jadwal Sembelih</th>
              </tr>
            </thead>
            <tbody>
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className={idx > 0 ? 'border-t border-gray-300' : ''}>
                  <td className="p-2 border-r border-gray-300 font-bold text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-300 font-bold">{it.animalOrder || details.animalOrder || 'Kambing Jantan Super'}</td>
                  <td className="p-2 border-r border-gray-300">{it.kandangNote || details.kandangNote || '-'}</td>
                  <td className="p-2 font-medium">{kandang.slaughterSchedule || `${details.deliveryDate || ''} 06:00 WIB`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'dapur-a' && (
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 text-left">
                <th className="p-2 border-r border-gray-400 w-12 text-center">No.</th>
                <th className="p-2 border-r border-gray-400">Masakan Kambing Dapur A</th>
                <th className="p-2 border-r border-gray-400">Menu Nasi Box Dapur A</th>
                <th className="p-2">Jadwal Masak</th>
              </tr>
            </thead>
            <tbody>
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className={idx > 0 ? 'border-t border-gray-300' : ''}>
                  <td className="p-2 border-r border-gray-300 font-bold text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-300 font-bold">{it.dapurAMasakan || details.dapurAMasakan || 'Gulai Kambing Standar'}</td>
                  <td className="p-2 border-r border-gray-300 font-medium">{it.dapurANasiBox || details.dapurANasiBox || 'Nasi Box Standar'}</td>
                  <td className="p-2 font-medium">{dapur.cookingSchedule || `${details.deliveryDate || ''} 07:30 WIB`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'dapur-r' && (
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 text-left">
                <th className="p-2 border-r border-gray-400 w-12 text-center">No.</th>
                <th className="p-2 border-r border-gray-400">Masakan Kambing Dapur R</th>
                <th className="p-2 border-r border-gray-400">Menu Nasi Box Dapur R</th>
                <th className="p-2">Jadwal Saji</th>
              </tr>
            </thead>
            <tbody>
              {(order.items && order.items.length > 0 ? order.items : [details]).map((it: any, idx: number) => (
                <tr key={idx} className={idx > 0 ? 'border-t border-gray-300' : ''}>
                  <td className="p-2 border-r border-gray-300 font-bold text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-300 font-bold">{it.dapurRMasakan || details.dapurRMasakan || 'Sate Kambing Tambahan'}</td>
                  <td className="p-2 border-r border-gray-300 font-medium">{it.dapurRNasiBox || details.dapurRNasiBox || 'Kerupuk & Buah'}</td>
                  <td className="p-2 font-medium">08:00 WIB</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'driver' && (
          <table className="w-full text-xs border-collapse border border-gray-400">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2 font-bold w-1/3 border-r border-gray-300 bg-gray-50 print:bg-white">Kontak Penerima</td>
                <td className="p-2">{details.recipientName} ({details.phone})</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-gray-300 bg-gray-50 print:bg-white">Info Driver / Kendaraan</td>
                <td className="p-2 font-bold">{details.driverInfo || 'Joko (Avanza Hitam R 1234 AB)'}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Operational Notes / Info Kandang / Info Dapur / Info Driver */}
      {details.pesananLainnya && (
        <div className="mb-4 border border-gray-400 p-3 text-xs bg-gray-50 print:bg-white rounded-sm">
          <p className="font-bold uppercase mb-1 text-amber-900">Pesanan Lainnya (Tambahan):</p>
          <p className="text-gray-800 font-medium">{details.pesananLainnya}</p>
        </div>
      )}

      <div className="mb-8 border border-gray-400 p-3 text-xs bg-gray-50 print:bg-white rounded-sm space-y-2">
        <p className="font-bold uppercase mb-1">
          {type === 'kandang' ? 'Pesan & Catatan Kandang' : type === 'dapur-a' ? 'Pesan & Catatan Dapur A' : type === 'dapur-r' ? 'Pesan & Catatan Dapur R' : 'Pesan & Catatan Driver'}:
        </p>
        <p className="text-gray-800">
          {type === 'kandang' && (details.pesanKandang || kandang.notes || details.kandangNote || 'Hewan wajib sehat, cukup umur, dan disembelih sesuai syariat Islam.')}
          {type === 'dapur-a' && (details.pesanDapurA || dapur.notes || details.dapurANote || 'Pastikan kemasan higienis, porsi tepat, dan rasa sesuai standar Almeera.')}
          {type === 'dapur-r' && (details.pesanDapurR || details.dapurRNote || 'Koordinasikan dengan dapur utama untuk jadwal pengiriman.')}
          {type === 'driver' && (details.pesanDriver || 'Pastikan pesanan utuh, tiba tepat waktu di lokasi shohibul, dan konfirmasi setelah selesai.')}
        </p>
        {type === 'driver' && (
          <p className="font-bold pt-1 border-t border-gray-200">
            Uang Saku Driver: Rp {(details.uangSakuDriver || 50000).toLocaleString('id-ID')}
          </p>
        )}
      </div>

      {/* 4. Signature Area */}
      <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-gray-400">
        <div className="text-center space-y-12">
          <p className="font-bold uppercase">Dibuat Oleh (Admin Almeera)</p>
          <div className="pt-8">
            <p className="border-t border-black inline-block px-12 pt-1 font-bold">( Administrator )</p>
          </div>
        </div>
        <div className="text-center space-y-12">
          <p className="font-bold uppercase">Diterima / Disetujui ({type.toUpperCase()})</p>
          <div className="pt-8">
            <p className="border-t border-black inline-block px-12 pt-1 font-bold">( Petugas Lapangan )</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-500">
        <p>AQIQAH ALMEERA CILACAP — SISTEM MANAJEMEN OPERASIONAL</p>
        <p>Halaman 1 dari 1 | Ref: {getPoNumber()}</p>
      </div>
    </div>
  );
}
