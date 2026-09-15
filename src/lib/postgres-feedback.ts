import { queryPostgres, withPostgresTransaction } from './postgres';

export async function markPostgresNotificationRead(notificationId: string, userId: string) {
  await queryPostgres('UPDATE notifications SET read_at=$1 WHERE id=$2 AND user_id=$3', [new Date(), notificationId, userId]);
}

export async function markAllPostgresNotificationsRead(userId: string) {
  await queryPostgres('UPDATE notifications SET read_at=$1 WHERE user_id=$2 AND read_at IS NULL', [new Date(), userId]);
}

export async function createPostgresReview(orderId: string, customerId: string, rating: number, comment: string) {
  return withPostgresTransaction(async client => {
    const now = new Date();
    await client.query(`INSERT INTO reviews (id,order_id,customer_id,rating,comment,created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (order_id) DO UPDATE SET rating=EXCLUDED.rating, comment=EXCLUDED.comment`, [`rev-${crypto.randomUUID()}`, orderId, customerId, rating, comment, now]);
    await client.query(`INSERT INTO notifications (id,user_id,category,title,message,priority,action_url,related_entity_id,created_at) VALUES ($1,$2,'pesanan','Ulasan Diterima',$3,'low',$4,$5,$6)`, [`not-${crypto.randomUUID()}`, customerId, `Terima kasih atas ulasan bintang ${rating}.`, `/customer/orders/${orderId}`, orderId, now]);
  });
}

export async function rejectPostgresQuotation(orderId: string) {
  return withPostgresTransaction(async client => {
    const now = new Date();
    await client.query("UPDATE quotations SET status='rejected',updated_at=$1 WHERE order_id=$2", [now, orderId]);
    await client.query("UPDATE orders SET status='cancelled',updated_at=$1 WHERE id=$2", [now, orderId]);
  });
}
