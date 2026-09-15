import type { PoolClient } from 'pg';
import { queryPostgres, withPostgresTransaction } from './postgres';

async function notify(client: PoolClient, data: { userId: string; category: string; title: string; message: string; priority?: string; actionUrl?: string; relatedEntityId?: string }) {
  await client.query(
    `INSERT INTO notifications (id, user_id, category, title, message, priority, action_url, related_entity_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [`not-${crypto.randomUUID()}`, data.userId, data.category, data.title, data.message, data.priority || 'medium', data.actionUrl || null, data.relatedEntityId || null, new Date()],
  );
}

async function audit(client: PoolClient, actorId: string, action: string, entity: string, entityId: string, oldValue?: string, newValue?: string) {
  await client.query(
    `INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, old_value, new_value, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [`aud-${crypto.randomUUID()}`, actorId, action, entity, entityId, oldValue || null, newValue || null, new Date()],
  );
}

export async function createPostgresPayment(orderId: string, customerId: string, data: { paymentType: string; amount: number; paymentMethod: string; paymentDate: string; proof?: string; notes?: string }) {
  return withPostgresTransaction(async client => {
    const order = await client.query<{ id: string; vendor_invoice_no: string }>('SELECT id, vendor_invoice_no FROM orders WHERE id = $1 AND customer_id = $2 FOR UPDATE', [orderId, customerId]);
    if (!order.rowCount) throw new Error('Pesanan tidak ditemukan.');
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error('Nominal pembayaran tidak valid.');
    const id = `pay-${crypto.randomUUID()}`;
    await client.query(
      `INSERT INTO payments (id, order_id, customer_id, payment_type, amount, payment_method, payment_date, proof, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, orderId, customerId, data.paymentType, data.amount, data.paymentMethod, data.paymentDate, data.proof || null, data.notes || null, new Date()],
    );
    await audit(client, customerId, 'SUBMIT_PAYMENT', 'payments', id, undefined, `amount:${data.amount}`);
    return id;
  });
}

export async function createOfflineManualPayment(orderId: string, adminId: string, data: { paymentType: string; amount: number; paymentDate: string; paymentMethod: string; notes?: string }) {
  return withPostgresTransaction(async client => {
    await client.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'ONLINE'");
    if (!['dp', 'sebagian', 'pelunasan'].includes(data.paymentType)) throw new Error('Jenis pembayaran tidak valid.');
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error('Nominal pembayaran tidak valid.');
    const result = await client.query<{ customer_id: string; vendor_invoice_no: string; quotation_price: string | null }>(
      `SELECT o.customer_id, o.vendor_invoice_no, o.quotation_price FROM orders o WHERE o.id = $1 AND o.order_type = 'MANUAL' FOR UPDATE`, [orderId],
    );
    if (!result.rowCount) throw new Error('Pesanan manual tidak ditemukan.');
    if (data.paymentMethod !== 'OFFLINE') throw new Error('Pembayaran offline hanya untuk pesanan manual.');
    const row = result.rows[0];
    const now = new Date();
    const paymentId = `pay-${crypto.randomUUID()}`;
    await client.query(
      `INSERT INTO payments (id, order_id, customer_id, payment_type, amount, payment_method, payment_date, proof, status, verified_by, verified_at, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, 'OFFLINE', $6, NULL, 'verified', $7, $8, $9, $8)`,
      [paymentId, orderId, row.customer_id, data.paymentType, data.amount, data.paymentDate, adminId, now, data.notes || null],
    );
    const total = await client.query<{ total: string }>("SELECT COALESCE(SUM(amount), 0)::text AS total FROM payments WHERE order_id = $1 AND status = 'verified'", [orderId]);
    const paid = Number(total.rows[0]?.total || 0);
    const bill = Number(row.quotation_price || 0);
    await client.query('UPDATE order_details SET total_bayar = $1, payment_status = $2 WHERE order_id = $3', [paid, bill > 0 && paid >= bill ? 'lunas' : paid > 0 ? 'dp' : 'kurang', orderId]);
    await audit(client, adminId, 'CREATE_OFFLINE_PAYMENT', 'payments', paymentId, undefined, `amount:${data.amount}`);
    await notify(client, { userId: row.customer_id, category: 'payment', title: 'Pembayaran Dicatat', message: `Pembayaran Rp ${data.amount.toLocaleString('id-ID')} untuk pesanan #${row.vendor_invoice_no} telah dicatat.`, relatedEntityId: orderId });
  });
}

export async function verifyPostgresPayment(paymentId: string, adminId: string, action: 'verify' | 'reject', rejectionReason?: string) {
  return withPostgresTransaction(async client => {
    const payment = await client.query<{ order_id: string; customer_id: string; status: string; amount: string; vendor_invoice_no: string; quotation_price: string | null }>('SELECT p.order_id, p.customer_id, p.status, p.amount, o.vendor_invoice_no, o.quotation_price FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.id = $1 FOR UPDATE', [paymentId]);
    if (!payment.rowCount) throw new Error('Pembayaran tidak ditemukan.');
    if (payment.rows[0].status !== 'waiting_verification') throw new Error('Pembayaran sudah diproses.');
    const nextStatus = action === 'verify' ? 'verified' : 'rejected';
    const now = new Date();
    await client.query('UPDATE payments SET status = $1, verified_by = $2, verified_at = $3, rejection_reason = $4 WHERE id = $5', [nextStatus, adminId, now, action === 'reject' ? rejectionReason || null : null, paymentId]);
    if (action === 'verify') {
      const total = await client.query<{ total: string }>("SELECT COALESCE(SUM(amount), 0)::text AS total FROM payments WHERE order_id=$1 AND status='verified'", [payment.rows[0].order_id]);
      const paid = Number(total.rows[0]?.total || 0);
      const bill = Number(payment.rows[0].quotation_price || 0);
      await client.query('UPDATE order_details SET total_bayar=$1, payment_status=$2 WHERE order_id=$3', [paid, bill > 0 && paid >= bill ? 'lunas' : 'dp', payment.rows[0].order_id]);
    }
    await audit(client, adminId, action === 'verify' ? 'VERIFY_PAYMENT' : 'REJECT_PAYMENT', 'payments', paymentId, 'waiting_verification', nextStatus);
    await notify(client, { userId: payment.rows[0].customer_id, category: 'payment', title: action === 'verify' ? 'Pembayaran Terverifikasi' : 'Pembayaran Ditolak', message: action === 'verify' ? 'Pembayaran Anda telah diverifikasi.' : `Pembayaran Anda ditolak${rejectionReason ? `: ${rejectionReason}` : '.'}`, relatedEntityId: payment.rows[0].order_id });
  });
}

export async function markPostgresDriverArrived(orderId: string, driverId: string) {
  return withPostgresTransaction(async client => {
    const result = await client.query<{ status: string; arrived_at: string | null }>('SELECT status, arrived_at FROM driver_orders WHERE order_id = $1 AND (driver_id = $2 OR driver_id IS NULL) FOR UPDATE', [orderId, driverId]);
    if (!result.rowCount) throw new Error('Data pengiriman tidak ditemukan.');
    if (result.rows[0].status !== 'on_delivery') throw new Error('Pengiriman harus berstatus on_delivery.');
    if (result.rows[0].arrived_at) throw new Error('Driver sudah menandai tiba.');
    await client.query('UPDATE driver_orders SET driver_id = COALESCE(driver_id, $1), arrived_at = $2 WHERE order_id = $3', [driverId, new Date(), orderId]);
    await audit(client, driverId, 'driver_arrived', 'driver_orders', orderId);
  });
}

export async function completePostgresDelivery(orderId: string, driverId: string, deliveryProof: string, deliveryNote?: string) {
  return withPostgresTransaction(async client => {
    const result = await client.query<{ status: string; arrived_at: string | null; customer_id: string; vendor_invoice_no: string }>('SELECT d.status, d.arrived_at, o.customer_id, o.vendor_invoice_no FROM driver_orders d JOIN orders o ON o.id = d.order_id WHERE d.order_id = $1 AND (d.driver_id = $2 OR d.driver_id IS NULL) FOR UPDATE', [orderId, driverId]);
    if (!result.rowCount) throw new Error('Data pengiriman tidak ditemukan.');
    const row = result.rows[0];
    if (row.status === 'delivered') throw new Error('Pengiriman sudah diselesaikan.');
    if (row.status !== 'on_delivery' || !row.arrived_at) throw new Error('Driver harus menandai tiba terlebih dahulu.');
    if (!deliveryProof) throw new Error('Bukti pengiriman wajib diunggah.');
    const now = new Date();
    await client.query('UPDATE driver_orders SET status = $1, delivered_at = $2, delivery_proof = $3, delivery_note = $4 WHERE order_id = $5', ['delivered', now, deliveryProof, deliveryNote || null, orderId]);
    await client.query('UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3', ['completed', now, orderId]);
    await audit(client, driverId, 'delivery_completed', 'driver_orders', orderId, 'on_delivery', 'delivered');
    await notify(client, { userId: row.customer_id, category: 'pesanan', title: 'Pesanan Selesai Dikirim', message: `Pesanan #${row.vendor_invoice_no} telah selesai dikirim.`, actionUrl: `/customer/orders/${orderId}`, relatedEntityId: orderId });
  });
}

export async function getPostgresActiveSlotCount(deliveryDate: string, deliveryTime: string, excludeOrderId?: string) {
  const result = await queryPostgres<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM order_details d JOIN orders o ON o.id = d.order_id WHERE d.delivery_date = $1 AND d.delivery_time = $2 AND o.status <> 'cancelled' ${excludeOrderId ? 'AND o.id <> $3' : ''}`,
    excludeOrderId ? [deliveryDate, deliveryTime, excludeOrderId] : [deliveryDate, deliveryTime],
  );
  return Number(result.rows[0]?.count || 0);
}
