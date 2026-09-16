import { queryPostgres } from './postgres';
import type { OrderWithRelations } from './services';

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]));
  }
  return value;
}

function mapOrder(row: Record<string, any>, related: Record<string, any>): OrderWithRelations {
  row = serializeValue(row) as Record<string, any>;
  related = serializeValue(related) as Record<string, any>;
  const detail = related.detail ? {
    ...related.detail, orderId: related.detail.order_id, parentName: related.detail.parent_name, childName: related.detail.child_name,
    fatherName: related.detail.father_name, motherName: related.detail.mother_name, recipientName: related.detail.recipient_name,
    deliveryDate: related.detail.delivery_date, deliveryTime: related.detail.delivery_time, animalOrder: related.detail.animal_order,
    kandangNote: related.detail.kandang_note, dapurAMasakan: related.detail.dapur_a_masakan, dapurANasiBox: related.detail.dapur_a_nasi_box,
    dapurANote: related.detail.dapur_a_note, dapurRMasakan: related.detail.dapur_r_masakan, dapurRNasiBox: related.detail.dapur_r_nasi_box,
    dapurRNote: related.detail.dapur_r_note, pesanKandang: related.detail.pesan_kandang, pesanDapurA: related.detail.pesan_dapur_a,
    pesanDapurR: related.detail.pesan_dapur_r, pesanDriver: related.detail.pesan_driver, uangSakuDriver: Number(related.detail.uang_saku_driver || 0),
    pesananLainnya: related.detail.pesanan_lainnya, paymentStatus: related.detail.payment_status,
    totalPelunasan: Number(related.detail.total_pelunasan || 0), totalBayar: Number(related.detail.total_bayar || 0),
  } : undefined;
  return {
    id: row.id, invoiceNo: row.invoice_no, vendorInvoiceNo: row.vendor_invoice_no, customerId: row.customer_id, orderDate: row.order_date,
     jenisOrder: row.jenis_order, orderType: row.order_type || 'ONLINE', atasNama: row.atas_nama, status: row.status, quotationPrice: row.quotation_price === null ? null : Number(row.quotation_price),
    approvedAt: row.approved_at,
    deletedAt: row.deleted_at || null,
    deletedBy: row.deleted_by || null,
    deleteReason: row.delete_reason || null,
    createdAt: row.created_at, updatedAt: row.updated_at,
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
    queryPostgres('SELECT * FROM admin_orders WHERE order_id=$1', [id]), queryPostgres('SELECT do.*, u.name AS driver_name FROM driver_orders do LEFT JOIN users u ON u.id = do.driver_id WHERE do.order_id=$1', [id]), queryPostgres('SELECT * FROM reviews WHERE order_id=$1', [id]),
  ]);
  const driverRow = driver.rows[0];
  const driverOrder = driverRow ? { ...driverRow, orderId: driverRow.order_id, driverId: driverRow.driver_id, driverName: driverRow.driver_name, deliveryAddress: driverRow.delivery_address, contactPerson: driverRow.contact_person, deliverySchedule: driverRow.delivery_schedule, arrivedAt: driverRow.arrived_at, deliveredAt: driverRow.delivered_at, deliveryProof: driverRow.delivery_proof, deliveryNote: driverRow.delivery_note, receivedAt: driverRow.received_at } : undefined;
  const kandangOrder = kandang.rows[0] ? { ...kandang.rows[0], orderId: kandang.rows[0].order_id, animalType: kandang.rows[0].animal_type, animalQty: kandang.rows[0].animal_qty, slaughterSchedule: kandang.rows[0].slaughter_schedule, prepStatus: kandang.rows[0].prep_status } : undefined;
  const dapurOrder = dapur.rows[0] ? { ...dapur.rows[0], orderId: dapur.rows[0].order_id, cookingSchedule: dapur.rows[0].cooking_schedule, kitchenStatus: dapur.rows[0].kitchen_status } : undefined;
  return mapOrder(row, { customer: customer.rows[0], detail: detail.rows[0], items: items.rows, quotation: quotation.rows[0], kandang: kandangOrder, dapur: dapurOrder, admin: admin.rows[0], driver: driverOrder, review: review.rows[0] });
}

export async function getPostgresOrderById(orderId: string) {
  const result = await queryPostgres('SELECT * FROM orders WHERE id=$1', [orderId]);
  return result.rows[0] ? enrich(result.rows[0]) : null;
}

export async function getPostgresOrders(filters?: { customerId?: string; status?: string; excludeStatuses?: string[]; search?: string }) {
  const values: string[] = []; const conditions = ['1=1'];
  if (filters?.customerId) { values.push(filters.customerId); conditions.push(`customer_id=$${values.length}`); }
  if (filters?.status) { values.push(filters.status); conditions.push(`status=$${values.length}`); }
  if (filters?.excludeStatuses && filters.excludeStatuses.length > 0) {
    const placeholders = filters.excludeStatuses.map(s => { values.push(s); return `$${values.length}`; }).join(',');
    conditions.push(`status NOT IN (${placeholders})`);
  }
  if (filters?.search) { values.push(`%${filters.search}%`); conditions.push(`(invoice_no ILIKE $${values.length} OR vendor_invoice_no ILIKE $${values.length} OR atas_nama ILIKE $${values.length})`); }
  const result = await queryPostgres(`SELECT * FROM orders WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`, values);
  return Promise.all(result.rows.map(enrich));
}

export async function getPostgresPaymentsByOrderId(orderId: string) {
  const result = await queryPostgres('SELECT * FROM payments WHERE order_id=$1 ORDER BY created_at DESC', [orderId]);
  return result.rows.map(row => ({
    ...row,
    amount: Number(row.amount || 0),
    paymentType: row.payment_type,
    paymentMethod: row.payment_method,
    paymentDate: row.payment_date,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at
  }));
}
