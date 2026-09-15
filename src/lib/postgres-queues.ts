import { queryPostgres } from './postgres';

export async function getPostgresKandangQueue() {
  const result = await queryPostgres(`SELECT k.id,k.order_id,k.animal_type,k.animal_qty,k.slaughter_schedule,k.notes,k.prep_status,o.vendor_invoice_no,o.atas_nama,o.status AS order_status,d.delivery_date FROM kandang_orders k JOIN orders o ON o.id=k.order_id LEFT JOIN order_details d ON d.order_id=o.id ORDER BY k.created_at DESC`);
  return result.rows.map(row => ({ ...row, id: row.id, orderId: row.order_id, animalType: row.animal_type, animalQty: row.animal_qty, slaughterSchedule: row.slaughter_schedule, prepStatus: row.prep_status, vendorInvoiceNo: row.vendor_invoice_no, atasNama: row.atas_nama, orderStatus: row.order_status, deliveryDate: row.delivery_date }));
}

export async function getPostgresDapurQueue() {
  const result = await queryPostgres(`SELECT d.id,d.order_id,d.menu,d.portion,d.cooking_schedule,d.notes,d.kitchen_status,o.vendor_invoice_no,o.atas_nama,o.status AS order_status FROM dapur_orders d JOIN orders o ON o.id=d.order_id ORDER BY d.created_at DESC`);
  return result.rows.map(row => ({ ...row, id: row.id, orderId: row.order_id, menu: row.menu, portion: row.portion, cookingSchedule: row.cooking_schedule, kitchenStatus: row.kitchen_status, vendorInvoiceNo: row.vendor_invoice_no, atasNama: row.atas_nama, orderStatus: row.order_status }));
}

export async function getPostgresDriverQueue(driverId?: string) {
  const result = await queryPostgres(`SELECT dr.id,dr.order_id,dr.driver_id,dr.delivery_address,dr.contact_person,dr.delivery_schedule,dr.status,dr.arrived_at,dr.delivered_at,dr.delivery_proof,dr.delivery_note,dr.received_at,o.vendor_invoice_no,o.atas_nama,o.status AS order_status FROM driver_orders dr JOIN orders o ON o.id=dr.order_id ${driverId ? 'WHERE dr.driver_id IS NULL OR dr.driver_id=$1' : ''} ORDER BY dr.received_at DESC`, driverId ? [driverId] : []);
  return result.rows.map(row => ({ ...row, id: row.id, status: row.status, orderId: row.order_id, driverId: row.driver_id, deliveryAddress: row.delivery_address, contactPerson: row.contact_person, deliverySchedule: row.delivery_schedule, arrivedAt: row.arrived_at, deliveredAt: row.delivered_at, deliveryProof: row.delivery_proof, deliveryNote: row.delivery_note, receivedAt: row.received_at, vendorInvoiceNo: row.vendor_invoice_no, atasNama: row.atas_nama, orderStatus: row.order_status }));
}
