import { withPostgresTransaction } from './postgres';

export async function startPostgresDelivery(orderId: string, driverId: string) {
  return withPostgresTransaction(async client => {
    const check = await client.query<{ payment_status: string; kitchen_status: string | null }>(`
      SELECT od.payment_status, dop.kitchen_status
      FROM orders o
      JOIN order_details od ON od.order_id = o.id
      LEFT JOIN dapur_orders dop ON dop.order_id = o.id
      WHERE o.id = $1
      FOR UPDATE
    `, [orderId]);
    if (!check.rowCount) throw new Error('Data pesanan tidak ditemukan.');
    if (check.rows[0].payment_status !== 'lunas') throw new Error('Pesanan belum lunas. Pengiriman baru dapat dimulai setelah pelunasan.');
    if (check.rows[0].kitchen_status && check.rows[0].kitchen_status !== 'packed') throw new Error('Dapur belum selesai packing. Pengiriman belum dapat dimulai.');

    const result = await client.query<{ status: string }>('SELECT status FROM driver_orders WHERE order_id=$1 AND (driver_id=$2 OR driver_id IS NULL) FOR UPDATE', [orderId, driverId]);
    if (!result.rowCount) throw new Error('Data pengiriman tidak ditemukan atau bukan tugas driver ini.');
    if (result.rows[0].status === 'delivered') throw new Error('Pengiriman sudah selesai.');
    await client.query("UPDATE driver_orders SET driver_id=$1,status='on_delivery' WHERE order_id=$2", [driverId, orderId]);
    await client.query("UPDATE orders SET status='delivery',updated_at=$1 WHERE id=$2", [new Date(), orderId]);
  });
}
