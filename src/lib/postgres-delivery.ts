import { withPostgresTransaction } from './postgres';

export async function startPostgresDelivery(orderId: string, driverId: string) {
  return withPostgresTransaction(async client => {
    const order = await client.query<{ status: string }>('SELECT status FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
    if (!order.rowCount) throw new Error('Data pesanan tidak ditemukan.');
    if (order.rows[0].status === 'completed' || order.rows[0].status === 'cancelled') {
      throw new Error(`Pesanan sudah ${order.rows[0].status === 'completed' ? 'selesai' : 'dibatalkan'}.`);
    }

    const check = await client.query<{ payment_status: string; kitchen_status: string | null }>(`
      SELECT od.payment_status, dop.kitchen_status
      FROM order_details od
      LEFT JOIN dapur_orders dop ON dop.order_id = od.order_id
      WHERE od.order_id = $1
    `, [orderId]);
    if (!check.rowCount) throw new Error('Detail pesanan tidak ditemukan.');
    if (check.rows[0].payment_status !== 'lunas') throw new Error('Pesanan belum lunas. Pengiriman baru dapat dimulai setelah pelunasan.');
    if (check.rows[0].kitchen_status && check.rows[0].kitchen_status !== 'packed') throw new Error('Dapur belum selesai packing. Pengiriman belum dapat dimulai.');

    const checkDriver = await client.query<{ status: string; driver_id: string | null }>(
      'SELECT status, driver_id FROM driver_orders WHERE order_id = $1 FOR UPDATE',
      [orderId]
    );

    if (!checkDriver.rowCount) {
      const odRes = await client.query<{ address: string; recipient_name: string; delivery_date: string; delivery_time: string }>(
        'SELECT address, recipient_name, delivery_date, delivery_time FROM order_details WHERE order_id = $1',
        [orderId]
      );
      const od = odRes.rows[0];
      await client.query(`
        INSERT INTO driver_orders (id, order_id, driver_id, delivery_address, contact_person, delivery_schedule, status, received_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'on_delivery', $7)
        ON CONFLICT (order_id) DO UPDATE SET driver_id = $3, status = 'on_delivery'
      `, [`drv-${orderId}`, orderId, driverId, od?.address || '-', od?.recipient_name || '-', `${od?.delivery_date || ''} ${od?.delivery_time || ''}`.trim(), new Date()]);
    } else {
      const row = checkDriver.rows[0];
      if (row.status === 'delivered') throw new Error('Pengiriman sudah selesai.');
      await client.query("UPDATE driver_orders SET driver_id = $1, status = 'on_delivery' WHERE order_id = $2", [driverId, orderId]);
    }

    const now = new Date();
    await client.query("UPDATE orders SET status = 'delivery', updated_at = $1 WHERE id = $2", [now, orderId]);
    await client.query(
      `INSERT INTO audit_logs (id, actor_id, action, entity, entity_id, old_value, new_value, created_at)
       VALUES ($1, $2, 'start_delivery', 'driver_orders', $3, $4, 'on_delivery', $5)`,
      [`aud-${crypto.randomUUID()}`, driverId, orderId, checkDriver.rows[0]?.status || 'assigned', now]
    );
  });
}
