import { queryPostgres } from './postgres';
import type { OrderWithRelations } from './services';

function mapOrder(row: Record<string, any>, related: Record<string, any>): OrderWithRelations {
  const detail = related.detail ? {
    ...related.detail, orderId: related.detail.order_id, parentName: related.detail.parent_name, childName: related.detail.child_name,
    recipientName: related.detail.recipient_name, deliveryDate: related.detail.delivery_date, deliveryTime: related.detail.delivery_time,
    totalPelunasan: Number(related.detail.total_pelunasan || 0), totalBayar: Number(related.detail.total_bayar || 0), animalOrder: related.detail.animal_order,
  } : undefined;
  return {
    id: row.id, invoiceNo: row.invoice_no, vendorInvoiceNo: row.vendor_invoice_no, customerId: row.customer_id, orderDate: row.order_date,
    jenisOrder: row.jenis_order, atasNama: row.atas_nama, status: row.status, quotationPrice: row.quotation_price === null ? null : Number(row.quotation_price),
    approvedAt: row.approved_at, createdAt: row.created_at, updatedAt: row.updated_at,
    customer: related.customer ? { name: related.customer.name, email: related.customer.email, phone: related.customer.phone } : undefined,
    orderDetails: detail, items: related.items || [], quotation: related.quotation, kandangOrder: related.kandang, dapurOrder: related.dapur,
    adminOrder: related.admin, driverOrder: related.driver, review: related.review,
  };
}

async function enrich(row: Record<string, any>) {
  const id = row.id;
  const [customer, detail, items, quotation, kandang, dapur, admin, driver, review] = await Promise.all([
    queryPostgres('SELECT name,email,phone FROM users WHERE id=$1', [row.customer_id]), queryPostgres('SELECT * FROM order_details WHERE order_id=$1', [id]),
    queryPostgres('SELECT * FROM order_items WHERE order_id=$1 ORDER BY created_at', [id]), queryPostgres('SELECT * FROM quotations WHERE order_id=$1', [id]),
    queryPostgres('SELECT * FROM kandang_orders WHERE order_id=$1', [id]), queryPostgres('SELECT * FROM dapur_orders WHERE order_id=$1', [id]),
    queryPostgres('SELECT * FROM admin_orders WHERE order_id=$1', [id]), queryPostgres('SELECT * FROM driver_orders WHERE order_id=$1', [id]), queryPostgres('SELECT * FROM reviews WHERE order_id=$1', [id]),
  ]);
  return mapOrder(row, { customer: customer.rows[0], detail: detail.rows[0], items: items.rows, quotation: quotation.rows[0], kandang: kandang.rows[0], dapur: dapur.rows[0], admin: admin.rows[0], driver: driver.rows[0], review: review.rows[0] });
}

export async function getPostgresOrderById(orderId: string) {
  const result = await queryPostgres('SELECT * FROM orders WHERE id=$1', [orderId]);
  return result.rows[0] ? enrich(result.rows[0]) : null;
}

export async function getPostgresOrders(filters?: { customerId?: string; status?: string; search?: string }) {
  const values: string[] = []; const conditions = ['1=1'];
  if (filters?.customerId) { values.push(filters.customerId); conditions.push(`customer_id=$${values.length}`); }
  if (filters?.status) { values.push(filters.status); conditions.push(`status=$${values.length}`); }
  if (filters?.search) { values.push(`%${filters.search}%`); conditions.push(`(invoice_no ILIKE $${values.length} OR vendor_invoice_no ILIKE $${values.length} OR atas_nama ILIKE $${values.length})`); }
  const result = await queryPostgres(`SELECT * FROM orders WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`, values);
  return Promise.all(result.rows.map(enrich));
}

export async function getPostgresPaymentsByOrderId(orderId: string) {
  const result = await queryPostgres('SELECT * FROM payments WHERE order_id=$1 ORDER BY created_at DESC', [orderId]);
  return result.rows.map(row => ({ ...row, paymentType: row.payment_type, paymentMethod: row.payment_method, paymentDate: row.payment_date, verifiedBy: row.verified_by, verifiedAt: row.verified_at, rejectionReason: row.rejection_reason, createdAt: row.created_at }));
}
