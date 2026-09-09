import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createOrderService } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['customer', 'admin']);
    const formData = await request.formData();

    const invoiceNo = formData.get('invoiceNo') as string;
    const jenisOrder = formData.get('jenisOrder') as string;
    const atasNama = formData.get('atasNama') as string;
    const parentName = formData.get('parentName') as string;
    const childName = formData.get('childName') as string;
    const recipientName = formData.get('recipientName') as string;
    const address = formData.get('address') as string;
    const deliveryDate = formData.get('deliveryDate') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const phone = formData.get('phone') as string;
    const animalOrder = formData.get('animalOrder') as string;
    const kandangNote = formData.get('kandangNote') as string;
    const dapurAMasakan = formData.get('dapurAMasakan') as string;
    const dapurANasiBox = formData.get('dapurANasiBox') as string;
    const dapurANote = formData.get('dapurANote') as string;

    if (!atasNama || !recipientName || !address || !deliveryDate || !animalOrder) {
      return NextResponse.redirect(new URL('/customer/orders/new?error=Kolom wajib bertanda * harus diisi', request.url));
    }

    const order = createOrderService(user.role === 'admin' ? (formData.get('customerId') as string || user.id) : user.id, {
      invoiceNo: invoiceNo || `INV-MGR-${Date.now().toString().slice(-6)}`,
      jenisOrder,
      atasNama,
      parentName,
      childName,
      recipientName,
      address,
      deliveryDate,
      deliveryTime,
      phone,
      animalOrder,
      kandangNote,
      dapurAMasakan,
      dapurANasiBox,
      dapurANote,
      paymentStatus: 'dp',
      totalPelunasan: 0,
      totalBayar: 0,
    });

    if (!order) {
      throw new Error('Gagal membuat pesanan');
    }

    const redirectPath = user.role === 'admin' ? `/admin/orders/${order.id}` : `/customer/orders/${order.id}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/customer/orders/new?error=${encodeURIComponent(err.message || 'Gagal membuat pesanan')}`, request.url));
  }
}
