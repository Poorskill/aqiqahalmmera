import crypto from 'node:crypto';
import { withPostgresTransaction } from './postgres';

export type PostgresOrderItemInput = {
  animalOrder: string;
  kandangNote?: string;
  dapurAMasakan?: string;
  dapurANasiBox?: string;
  dapurANote?: string;
  dapurRMasakan?: string;
  dapurRNasiBox?: string;
  dapurRNote?: string;
};

export async function createPostgresOrder(customerId: string, data: {
  invoiceNo: string;
  jenisOrder: string;
  atasNama: string;
  fatherName: string;
  motherName: string;
  parentName?: string;
  childName: string;
  recipientName: string;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  phone: string;
  paymentStatus: string;
  totalPelunasan: number;
  totalBayar: number;
  pesananLainnya?: string;
  items: PostgresOrderItemInput[];
}) {
  return withPostgresTransaction(async client => {
    const lockKey = `${data.deliveryDate}:${data.deliveryTime}`;
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [lockKey]);
    const slot = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM order_details d JOIN orders o ON o.id = d.order_id
       WHERE d.delivery_date = $1 AND d.delivery_time = $2 AND o.status <> 'cancelled'`,
      [data.deliveryDate, data.deliveryTime],
    );
    if (Number(slot.rows[0]?.count || 0) >= 2) throw new Error(`Slot ${data.deliveryTime} untuk tanggal ${data.deliveryDate} sudah penuh (2/2). Silakan pilih waktu lainnya.`);

    const now = new Date();
    const orderId = `ord-${crypto.randomUUID()}`;
    const vendorInvoiceNo = `INV-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const first = data.items[0];
    await client.query(
      `INSERT INTO orders (id, invoice_no, vendor_invoice_no, customer_id, order_date, jenis_order, atas_nama, status, quotation_price, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting_review', $8, $5, $5)`,
      [orderId, data.invoiceNo || vendorInvoiceNo, vendorInvoiceNo, customerId, now, data.jenisOrder || 'aqiqah', data.atasNama, data.totalPelunasan || 0],
    );
    await client.query(
      `INSERT INTO order_details (id, order_id, parent_name, father_name, mother_name, child_name, recipient_name, address, delivery_date, delivery_time, phone, animal_order, kandang_note, dapur_a_masakan, dapur_a_nasi_box, dapur_a_note, dapur_r_masakan, dapur_r_nasi_box, dapur_r_note, pesanan_lainnya, payment_status, total_pelunasan, total_bayar, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [`det-${crypto.randomUUID()}`, orderId, `${data.fatherName} & ${data.motherName}`, data.fatherName, data.motherName, data.childName, data.recipientName, data.address, data.deliveryDate, data.deliveryTime, data.phone, first.animalOrder, first.kandangNote || null, first.dapurAMasakan || null, first.dapurANasiBox || null, first.dapurANote || null, first.dapurRMasakan || null, first.dapurRNasiBox || null, first.dapurRNote || null, data.pesananLainnya || null, data.paymentStatus || 'dp', data.totalPelunasan || 0, data.totalBayar || 0, now],
    );
    for (const item of data.items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, animal_order, kandang_note, dapur_a_masakan, dapur_a_nasi_box, dapur_a_note, dapur_r_masakan, dapur_r_nasi_box, dapur_r_note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [`item-${crypto.randomUUID()}`, orderId, item.animalOrder, item.kandangNote || null, item.dapurAMasakan || null, item.dapurANasiBox || null, item.dapurANote || null, item.dapurRMasakan || null, item.dapurRNasiBox || null, item.dapurRNote || null, now],
      );
    }
    await client.query(
      `INSERT INTO notifications (id, user_id, category, title, message, priority, action_url, related_entity_id, created_at)
       VALUES ($1, $2, 'pesanan', 'Pesanan Berhasil Diajukan', $3, 'medium', $4, $5, $6)`,
      [`not-${crypto.randomUUID()}`, customerId, `Pesanan baru #${vendorInvoiceNo} telah diajukan dan menunggu peninjauan admin.`, `/customer/orders/${orderId}`, orderId, now],
    );
    return { id: orderId, vendorInvoiceNo };
  });
}
