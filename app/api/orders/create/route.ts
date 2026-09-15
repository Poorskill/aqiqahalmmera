import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createPostgresOrder } from '@/lib/postgres-orders';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['customer', 'admin', 'master_admin']);
    const formData = await request.formData();

    const invoiceNo = formData.get('invoiceNo') as string;
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
    const pesananLainnya = formData.get('pesananLainnya') as string;

    const itemsJson = formData.get('itemsJson') as string;
    let items: any[] = [];
    try {
      if (itemsJson) items = JSON.parse(itemsJson);
    } catch {}

    if (!items || items.length === 0) {
      items = [{
        animalOrder: formData.get('animalOrder') as string || 'Kambing Standar',
        kandangNote: formData.get('kandangNote') as string || '',
        dapurAMasakan: formData.get('dapurAMasakan') as string || '',
        dapurANasiBox: formData.get('dapurANasiBox') as string || '',
        dapurANote: formData.get('dapurANote') as string || '',
      }];
    }

    if (!atasNama || !fatherName || !motherName || !childName || !recipientName || !address || !deliveryDate || items.some((it: any) => !it.animalOrder)) {
      const errUrl = user.role === 'admin' ? '/admin/orders/new?error=Kolom wajib bertanda * harus diisi' : '/customer/orders/new?error=Kolom wajib bertanda * harus diisi';
      return NextResponse.redirect(new URL(errUrl, request.url));
    }

    const totalPelunasan = parseFloat(formData.get('totalPelunasan') as string) || 0;
    const totalBayar = parseFloat(formData.get('totalBayar') as string) || 0;
    const isManual = user.role === 'admin' || user.role === 'master_admin';

    const order = await createPostgresOrder(user.role === 'admin' ? (formData.get('customerId') as string || user.id) : user.id, {
      invoiceNo: invoiceNo || `INV-MGR-${Date.now().toString().slice(-6)}`,
      jenisOrder,
      atasNama,
      fatherName,
      motherName,
      parentName: `${fatherName} & ${motherName}`,
      childName,
      recipientName,
      address,
      deliveryDate,
      deliveryTime,
      phone,
      pesananLainnya,
      items,
      paymentStatus: formData.get('paymentStatus') as string || (totalBayar >= totalPelunasan && totalPelunasan > 0 ? 'lunas' : 'dp'),
      totalPelunasan,
      totalBayar,
      manual: isManual,
      pesanKandang: (formData.get('pesanKandang') as string) || '',
      pesanDapurA: (formData.get('pesanDapurA') as string) || '',
      pesanDapurR: (formData.get('pesanDapurR') as string) || '',
      pesanDriver: (formData.get('pesanDriver') as string) || '',
      uangSakuDriver: parseFloat(formData.get('uangSakuDriver') as string) || 0,
    });

    if (!order) {
      throw new Error('Gagal membuat pesanan');
    }

    const redirectPath = user.role === 'admin' ? `/admin/orders/${order.id}` : `/customer/orders/${order.id}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (err: any) {
    const userRole = 'customer'; // default fallback for error redirect
    const errUrl = '/customer/orders/new';
    return NextResponse.redirect(new URL(`${errUrl}?error=${encodeURIComponent(err.message || 'Gagal membuat pesanan')}`, request.url));
  }
}
