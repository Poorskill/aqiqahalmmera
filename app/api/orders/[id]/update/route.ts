import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateOrderService } from '@/lib/services';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(['master_admin']);
    const { id } = await params;
    const formData = await request.formData();

    const jenisOrder = formData.get('jenisOrder') as string;
    const atasNama = formData.get('atasNama') as string;
    const fatherName = formData.get('fatherName') as string || formData.get('parentName') as string || '';
    const motherName = formData.get('motherName') as string || '';
    const childName = formData.get('childName') as string;
    const recipientName = formData.get('recipientName') as string;
    const address = formData.get('address') as string;
    const deliveryDate = formData.get('deliveryDate') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const phone = formData.get('phone') as string;
    const animalOrder = formData.get('animalOrder') as string || 'Kambing Standar';
    const dapurAMasakan = formData.get('dapurAMasakan') as string || '';
    const dapurANasiBox = formData.get('dapurANasiBox') as string || '';
    const pesananLainnya = formData.get('pesananLainnya') as string || '';
    const quotationPrice = parseFloat(formData.get('quotationPrice') as string);

    if (!atasNama || !fatherName || !motherName || !childName || !recipientName || !address || !deliveryDate || !deliveryTime) {
      return NextResponse.redirect(new URL(`/admin/orders/${id}/edit?error=Kolom wajib bertanda * harus diisi`, request.url));
    }

    const result = updateOrderService(id, user.id, {
      jenisOrder,
      atasNama,
      fatherName,
      motherName,
      childName,
      recipientName,
      address,
      deliveryDate,
      deliveryTime,
      phone,
      animalOrder,
      dapurAMasakan,
      dapurANasiBox,
      pesananLainnya,
      quotationPrice: isNaN(quotationPrice) ? undefined : quotationPrice,
    });

    let successMsg = 'Pesanan berhasil diperbarui oleh Master Admin';
    if (result.diff > 0) {
      successMsg = `Pesanan diperbarui. Total tagihan bertambah Rp${result.diff.toLocaleString('id-ID')}.`;
    } else if (result.diff < 0) {
      successMsg = `Pesanan diperbarui. Total tagihan berkurang Rp${Math.abs(result.diff).toLocaleString('id-ID')} (Lebih Bayar Rp${Math.abs(result.diff).toLocaleString('id-ID')}).`;
    }

    return NextResponse.redirect(new URL(`/customer/orders/${id}?success=${encodeURIComponent(successMsg)}`, request.url));
  } catch (err: any) {
    const { id } = await params;
    return NextResponse.redirect(new URL(`/admin/orders/${id}/edit?error=${encodeURIComponent(err.message || 'Gagal memperbarui pesanan')}`, request.url));
  }
}
