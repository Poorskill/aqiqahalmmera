import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPostgresPool } from '../src/lib/postgres.ts';

type Row = Record<string, unknown>;
type Dump = Record<string, Row[]>;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'data', 'aqiqah_store.json');
const schemaPath = path.join(root, 'db', 'schema.sql');

const tables = [
  ['users', 'users'], ['roles', 'roles'], ['permissions', 'permissions'],
  ['role_permissions', 'role_permissions'], ['user_permissions', 'user_permissions'],
  ['access_audit_logs', 'access_audit_logs'], ['orders', 'orders'],
  ['order_details', 'order_details'], ['order_items', 'order_items'],
  ['quotations', 'quotations'], ['reviews', 'reviews'], ['kandang_orders', 'kandang_orders'],
  ['dapur_orders', 'dapur_orders'], ['admin_orders', 'admin_orders'],
  ['driver_orders', 'driver_orders'], ['payments', 'payments'], ['notifications', 'notifications'],
] as const;

const columns: Record<string, string[]> = {
  users: ['id', 'name', 'email', 'password', 'phone', 'role', 'status', 'province', 'city', 'district', 'village', 'address', 'postal_code', 'notes', 'profile_image_url', 'created_at', 'updated_at'],
  roles: ['id', 'name', 'description', 'is_system_role', 'created_at', 'updated_at'],
  permissions: ['id', 'key', 'name', 'module', 'description', 'created_at'],
  role_permissions: ['role_id', 'permission_id'], user_permissions: ['user_id', 'permission_id', 'effect'],
  access_audit_logs: ['id', 'actor_id', 'target_user_id', 'action', 'permission_key', 'old_value', 'new_value', 'created_at'],
  orders: ['id', 'invoice_no', 'vendor_invoice_no', 'customer_id', 'order_date', 'jenis_order', 'atas_nama', 'status', 'quotation_price', 'approved_at', 'created_at', 'updated_at'],
  order_details: ['id', 'order_id', 'parent_name', 'child_name', 'recipient_name', 'address', 'delivery_date', 'delivery_time', 'phone', 'driver_info', 'driver_fee', 'animal_order', 'kandang_note', 'dapur_a_masakan', 'dapur_a_nasi_box', 'dapur_a_note', 'dapur_r_masakan', 'dapur_r_nasi_box', 'dapur_r_note', 'father_name', 'mother_name', 'pesanan_lainnya', 'pesan_kandang', 'pesan_dapur_a', 'pesan_dapur_r', 'pesan_driver', 'uang_saku_driver', 'payment_status', 'total_pelunasan', 'total_bayar', 'created_at'],
  order_items: ['id', 'order_id', 'animal_order', 'kandang_note', 'dapur_a_masakan', 'dapur_a_nasi_box', 'dapur_a_note', 'dapur_r_masakan', 'dapur_r_nasi_box', 'dapur_r_note', 'created_at'],
  quotations: ['id', 'order_id', 'admin_id', 'price', 'note', 'status', 'created_at', 'updated_at'], reviews: ['id', 'order_id', 'customer_id', 'rating', 'comment', 'created_at'],
  kandang_orders: ['id', 'order_id', 'animal_type', 'animal_qty', 'slaughter_schedule', 'notes', 'prep_status', 'created_at'],
  dapur_orders: ['id', 'order_id', 'menu', 'portion', 'cooking_schedule', 'notes', 'kitchen_status', 'created_at'],
  admin_orders: ['id', 'order_id', 'status_terkini', 'monitoring_notes', 'received_at'],
  driver_orders: ['id', 'order_id', 'driver_id', 'delivery_address', 'contact_person', 'delivery_schedule', 'status', 'arrived_at', 'delivered_at', 'delivery_proof', 'delivery_note', 'received_at'],
  payments: ['id', 'order_id', 'customer_id', 'payment_type', 'amount', 'payment_method', 'payment_date', 'proof', 'status', 'verified_by', 'verified_at', 'rejection_reason', 'notes', 'created_at'],
  notifications: ['id', 'user_id', 'category', 'title', 'message', 'priority', 'action_url', 'related_entity_id', 'read_at', 'created_at'],
};

function value(row: Row, column: string) {
  const aliases: Record<string, string> = { postal_code: 'postalCode', profile_image_url: 'profileImageUrl', is_system_role: 'isSystemRole', role_id: 'roleId', permission_id: 'permissionId', user_id: 'userId', actor_id: 'actorId', target_user_id: 'targetUserId', order_id: 'orderId', admin_id: 'adminId', customer_id: 'customerId', driver_id: 'driverId', invoice_no: 'invoiceNo', vendor_invoice_no: 'vendorInvoiceNo', order_date: 'orderDate', atas_nama: 'atasNama', quotation_price: 'quotationPrice', approved_at: 'approvedAt', created_at: 'createdAt', updated_at: 'updatedAt', parent_name: 'parentName', child_name: 'childName', recipient_name: 'recipientName', delivery_date: 'deliveryDate', delivery_time: 'deliveryTime', driver_info: 'driverInfo', driver_fee: 'driverFee', animal_order: 'animalOrder', kandang_note: 'kandangNote', dapur_a_masakan: 'dapurAMasakan', dapur_a_nasi_box: 'dapurANasiBox', dapur_a_note: 'dapurANote', dapur_r_masakan: 'dapurRMasakan', dapur_r_nasi_box: 'dapurRNasiBox', dapur_r_note: 'dapurRNote', father_name: 'fatherName', mother_name: 'motherName', pesanan_lainnya: 'pesananLainnya', pesan_kandang: 'pesanKandang', pesan_dapur_a: 'pesanDapurA', pesan_dapur_r: 'pesanDapurR', pesan_driver: 'pesanDriver', uang_saku_driver: 'uangSakuDriver', payment_status: 'paymentStatus', total_pelunasan: 'totalPelunasan', total_bayar: 'totalBayar', animal_type: 'animalType', animal_qty: 'animalQty', slaughter_schedule: 'slaughterSchedule', prep_status: 'prepStatus', cooking_schedule: 'cookingSchedule', kitchen_status: 'kitchenStatus', status_terkini: 'status_terkini', monitoring_notes: 'monitoring_notes', received_at: 'receivedAt', delivery_address: 'deliveryAddress', contact_person: 'contactPerson', delivery_schedule: 'deliverySchedule', arrived_at: 'arrivedAt', delivered_at: 'deliveredAt', delivery_proof: 'deliveryProof', delivery_note: 'deliveryNote', payment_type: 'paymentType', payment_method: 'paymentMethod', payment_date: 'paymentDate', verified_by: 'verifiedBy', verified_at: 'verifiedAt', rejection_reason: 'rejectionReason', action_url: 'actionUrl', related_entity_id: 'relatedEntityId', read_at: 'readAt' };
  return row[column] ?? row[aliases[column] || column] ?? null;
}

const source = JSON.parse(await fs.readFile(sourcePath, 'utf8')) as Dump;
const pool = getPostgresPool();
const client = await pool.connect();
try {
  await client.query(await fs.readFile(schemaPath, 'utf8'));
  await client.query('BEGIN');
  for (const [sourceTable, targetTable] of tables) {
    const targetColumns = columns[targetTable];
    for (const row of source[sourceTable] || []) {
      const values = targetColumns.map(column => value(row, column));
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      await client.query(`INSERT INTO ${targetTable} (${targetColumns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
    }
    console.log(`${sourceTable}: ${source[sourceTable]?.length || 0}`);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
