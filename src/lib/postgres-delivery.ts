import { withPostgresTransaction } from './postgres';

export async function startPostgresDelivery(orderId: string, driverId: string) {
  return withPostgresTransaction(async client => {
    const result = await client.query<{ status: string }>('SELECT status FROM driver_orders WHERE order_id=$1 AND (driver_id=$2 OR driver_id IS NULL) FOR UPDATE', [orderId, driverId]);
    if (!result.rowCount) throw new Error('Data pengiriman tidak ditemukan atau bukan tugas driver ini.');
    if (result.rows[0].status === 'delivered') throw new Error('Pengiriman sudah selesai.');
    await client.query("UPDATE driver_orders SET driver_id=$1,status='on_delivery' WHERE order_id=$2", [driverId, orderId]);
    await client.query("UPDATE orders SET status='delivery',updated_at=$1 WHERE id=$2", [new Date(), orderId]);
  });
}
