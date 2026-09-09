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
      case 'dapur-a': return 'PURCHASE ORDER — DAPUR UTAMA (DAPUR A)';
      case 'dapur-r': return 'PURCHASE ORDER — DAPUR REKANAN (DAPUR R)';
      case 'driver': return 'PURCHASE ORDER — PENGANTARAN / DRIVER';
    }
  };

  const getPoNumber = () => {
    const code = type === 'kandang' ? 'KDG' : type === 'dapur-a' ? 'DPA' : type === 'dapur-r' ? 'DPR' : 'DRV';
    return `PO-${code}-${order.vendorInvoiceNo || '0001'}`;
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black p-8 md:p-12 print:p-0 font-sans border border-gray-300 print:border-none shadow-sm print:shadow-none">
      {/* Company Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">AQIQAH ALMEERA</h1>
          <p className="text-xs font-semibold text-gray-700 uppercase">Layanan Aqiqah & Catering Profesional</p>
          <p className="text-xs text-gray-600 mt-1">
            Jl. Flores No.28B, Rawapasung, Sidanegara, Kec. Cilacap Tengah, Kab. Cilacap, Jawa Tengah
          </p>
          <p className="text-xs text-gray-600">Telp / WA: 0812-3456-7890 | Email: info@aqiqahalmeera.com</p>
        </div>
        <div className="text-right">
          <div className="inline-block border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
            DOKUMEN INTERNAL
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold uppercase tracking-widest border-b border-black pb-1 inline-block">
          {getPoTitle()}
        </h2>
      </div>

      {/* Metadata / Identification Two-Column */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-black p-4 bg-gray-50 print:bg-white">
        <div className="space-y-1">
          <p><strong className="w-32 inline-block">NO. PO</strong> : {getPoNumber()}</p>
          <p><strong className="w-32 inline-block">NO. INVOICE</strong> : {order.invoiceNo || order.vendorInvoiceNo}</p>
          <p><strong className="w-32 inline-block">VENDOR INVOICE</strong> : {order.vendorInvoiceNo}</p>
        </div>
        <div className="space-y-1">
          <p><strong className="w-32 inline-block">TANGGAL CETAK</strong> : {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
          <p><strong className="w-32 inline-block">JENIS ORDER</strong> : <span className="uppercase font-bold">{order.jenisOrder}</span></p>
          <p><strong className="w-32 inline-block">STATUS PESANAN</strong> : <span className="uppercase font-bold">{order.status}</span></p>
        </div>
      </div>

      {/* 1. Order & Customer Information */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1.5 mb-2">
          1. Informasi Shohibul & Pengiriman
        </h3>
        <table className="w-full text-xs border-collapse border border-black">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-2 font-bold w-1/3 border-r border-black bg-gray-50 print:bg-white">Atas Nama (Shohibul)</td>
              <td className="p-2 font-medium">{order.atasNama}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Nama Ayah & Ibu</td>
              <td className="p-2">{details.parentName || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Nama Anak</td>
              <td className="p-2">{details.childName || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Nama Penerima Tujuan</td>
              <td className="p-2">{details.recipientName || '-'}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Alamat Pengiriman</td>
              <td className="p-2">{details.address || '-'}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Jadwal Pengiriman</td>
              <td className="p-2 font-bold">{details.deliveryDate || '-'} ({details.deliveryTime || '09:00 WIB'})</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Operational Specific Details */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1.5 mb-2">
          2. Rincian Spesifik Operasional ({type.toUpperCase()})
        </h3>
        
        {type === 'kandang' && (
          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-left">
                <th className="p-2 border-r border-black">Jenis Komponen Hewan</th>
                <th className="p-2 border-r border-black">Jumlah</th>
                <th className="p-2">Jadwal Sembelih</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-r border-black font-bold">{kandang.animalType || details.animalOrder || 'Kambing Jantan Super'}</td>
                <td className="p-2 border-r border-black font-mono">{kandang.animalQty || 1} Ekor</td>
                <td className="p-2 font-medium">{kandang.slaughterSchedule || `${details.deliveryDate || ''} 06:00 WIB`}</td>
              </tr>
            </tbody>
          </table>
        )}

        {type === 'dapur-a' && (
          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-left">
                <th className="p-2 border-r border-black">Masakan Kambing Dapur A</th>
                <th className="p-2 border-r border-black">Menu Nasi Box Dapur A</th>
                <th className="p-2">Jadwal Masak</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-r border-black font-bold">{details.dapurAMasakan || 'Gulai Kambing Standar'}</td>
                <td className="p-2 border-r border-black font-medium">{details.dapurANasiBox || 'Nasi Box Standar'}</td>
                <td className="p-2 font-medium">{dapur.cookingSchedule || `${details.deliveryDate || ''} 07:30 WIB`}</td>
              </tr>
            </tbody>
          </table>
        )}

        {type === 'dapur-r' && (
          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-left">
                <th className="p-2 border-r border-black">Masakan Kambing Dapur R</th>
                <th className="p-2 border-r border-black">Menu Nasi Box Dapur R</th>
                <th className="p-2">Jadwal Saji</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-r border-black font-bold">{details.dapurRMasakan || 'Sate Kambing Tambahan'}</td>
                <td className="p-2 border-r border-black font-medium">{details.dapurRNasiBox || 'Kerupuk & Buah'}</td>
                <td className="p-2 font-medium">08:00 WIB</td>
              </tr>
            </tbody>
          </table>
        )}

        {type === 'driver' && (
          <table className="w-full text-xs border-collapse border border-black">
            <tbody>
              <tr className="border-b border-black">
                <td className="p-2 font-bold w-1/3 border-r border-black bg-gray-50 print:bg-white">Kontak Penerima</td>
                <td className="p-2">{details.recipientName} ({details.phone})</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Info Driver / Kendaraan</td>
                <td className="p-2 font-bold">{details.driverInfo || 'Joko (Avanza Hitam R 1234 AB)'}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold border-r border-black bg-gray-50 print:bg-white">Uang Saku / Biaya Driver</td>
                <td className="p-2 font-mono font-bold">Rp {(details.driverFee || 50000).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Operational Notes */}
      <div className="mb-8 border border-black p-3 text-xs">
        <p className="font-bold uppercase mb-1">Catatan / Instruksi Khusus:</p>
        <p className="text-gray-800">
          {type === 'kandang' && (kandang.notes || details.kandangNote || 'Hewan wajib sehat, cukup umur, dan disembelih sesuai syariat Islam.')}
          {type === 'dapur-a' && (dapur.notes || details.dapurANote || 'Pastikan kemasan higienis, porsi tepat, dan rasa sesuai standar Almeera.')}
          {type === 'dapur-r' && (details.dapurRNote || 'Koordinasikan dengan dapur utama untuk jadwal pengiriman.')}
          {type === 'driver' && ('Pastikan pesanan utuh, tiba tepat waktu di lokasi shohibul, dan konfirmasi setelah selesai.')}
        </p>
      </div>

      {/* 4. Signature Area */}
      <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-black">
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
      <div className="mt-12 pt-4 border-t border-gray-400 flex justify-between items-center text-[10px] text-gray-600">
        <p>AQIQAH ALMEERA CILACAP — SISTEM MANAJEMEN OPERASIONAL</p>
        <p>Halaman 1 dari 1 | Ref: {getPoNumber()}</p>
      </div>
    </div>
  );
}
