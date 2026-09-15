import { queryPostgres } from './postgres';
import { getPostgresOrders, getPostgresPaymentsByOrderId } from './postgres-services';

type PostgresUserReport = {
  id: string; name: string; email: string; phone: string; role: string; status: string;
  totalOrders?: number; profileImageUrl?: string; postalCode?: string; createdAt: string; updatedAt: string;
};

export async function getAllPostgresPayments(filters?: { status?: string }) {
  let query = 'SELECT p.*, o.vendor_invoice_no, o.atas_nama, u.name as customer_name FROM payments p JOIN orders o ON o.id=p.order_id JOIN users u ON u.id=p.customer_id';
  const params: string[] = [];
  if (filters?.status) {
    params.push(filters.status);
    query += ' WHERE p.status = $1';
  }
  query += ' ORDER BY p.created_at DESC';
  const res = await queryPostgres(query, params);
  return res.rows.map(r => ({
    id: r.id, orderId: r.order_id, customerId: r.customer_id, paymentType: r.payment_type, amount: Number(r.amount),
    paymentMethod: r.payment_method, paymentDate: r.payment_date, proof: r.proof, status: r.status, verifiedBy: r.verified_by,
    verifiedAt: r.verified_at, rejectionReason: r.rejection_reason, notes: r.notes, createdAt: r.created_at,
    vendorInvoiceNo: r.vendor_invoice_no, atasNama: r.atas_nama, customerName: r.customer_name,
  }));
}

export async function getAllPostgresCustomers(): Promise<PostgresUserReport[]> {
  const res = await queryPostgres(`SELECT u.*, (SELECT COUNT(*)::int FROM orders o WHERE o.customer_id = u.id) as total_orders FROM users u WHERE u.role = 'customer' ORDER BY u.created_at DESC`);
  return res.rows.map((u: any) => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, status: u.status,
    totalOrders: u.total_orders, profileImageUrl: u.profile_image_url, postalCode: u.postal_code, createdAt: u.created_at, updatedAt: u.updated_at
  }));
}

export async function getAllPostgresStaff(): Promise<PostgresUserReport[]> {
  const res = await queryPostgres(`SELECT * FROM users WHERE role != 'customer' ORDER BY created_at DESC`);
  return res.rows.map((u: any) => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, status: u.status,
    profileImageUrl: u.profile_image_url, postalCode: u.postal_code, createdAt: u.created_at, updatedAt: u.updated_at
  }));
}

export async function getPostgresCustomerDocuments(customerId: string) {
  const orders = await getPostgresOrders({ customerId });
  const documents: any[] = [];
  for (const order of orders) {
    if (order.status === 'quotation_sent' || order.status === 'quotation_approved') {
      documents.push({ id: `doc-quo-${order.id}`, type: 'quotation', title: 'Quotation Resmi', number: `QUO-${order.vendorInvoiceNo.replace('INV-', '')}`, orderId: order.id, vendorInvoiceNo: order.vendorInvoiceNo, atasNama: order.atasNama, date: order.createdAt, amount: order.quotationPrice || order.orderDetails?.totalPelunasan || 0, status: order.status === 'quotation_approved' ? 'Disetujui' : 'Menunggu Persetujuan', downloadUrl: `/customer/orders/${order.id}`, actionUrl: `/customer/orders/${order.id}` });
    }
    documents.push({ id: `doc-inv-${order.id}`, type: 'invoice', title: 'Invoice Pesanan', number: order.vendorInvoiceNo, orderId: order.id, vendorInvoiceNo: order.vendorInvoiceNo, atasNama: order.atasNama, date: order.orderDate, amount: order.quotationPrice || order.orderDetails?.totalPelunasan || 0, status: order.orderDetails?.paymentStatus === 'lunas' ? 'Lunas' : order.orderDetails?.paymentStatus === 'dp' ? 'DP Terbayar' : 'Belum Bayar', downloadUrl: `/customer/orders/${order.id}`, actionUrl: `/customer/orders/${order.id}` });
    const payments = await getPostgresPaymentsByOrderId(order.id);
    payments.forEach((p: any) => {
      if (p.status === 'verified') {
        documents.push({ id: `doc-rec-${p.id}`, type: 'receipt', title: `Kuitansi ${p.paymentType === 'pelunasan' ? 'Pelunasan' : 'DP / Pembayaran'}`, number: `KW-${p.id.slice(-6).toUpperCase()}`, orderId: order.id, vendorInvoiceNo: order.vendorInvoiceNo, atasNama: order.atasNama, date: p.verifiedAt || p.paymentDate || p.createdAt, amount: p.amount, status: 'Terverifikasi', downloadUrl: p.proof || `/customer/orders/${order.id}`, actionUrl: p.proof || `/customer/orders/${order.id}` });
      }
    });
  }
  return documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
