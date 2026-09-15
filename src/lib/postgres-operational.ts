import { withPostgresTransaction } from './postgres';

export async function createPostgresQuotation(orderId: string, adminId: string, price: number, note: string, operational: { pesanKandang?: string; pesanDapurA?: string; pesanDapurR?: string; pesanDriver?: string; uangSakuDriver?: number }) {
  return withPostgresTransaction(async client => {
    const now = new Date();
    const order = await client.query<{ customer_id: string }>('SELECT customer_id FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
    if (!order.rowCount) throw new Error('Pesanan tidak ditemukan.');
    await client.query(`INSERT INTO quotations (id, order_id, admin_id, price, note, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,'pending',$6,$6) ON CONFLICT (order_id) DO UPDATE SET admin_id=EXCLUDED.admin_id, price=EXCLUDED.price, note=EXCLUDED.note, status='pending', updated_at=EXCLUDED.updated_at`, [`quo-${crypto.randomUUID()}`, orderId, adminId, price, note || null, now]);
    await client.query('UPDATE orders SET status=$1, quotation_price=$2, updated_at=$3 WHERE id=$4', ['quotation_sent', price, now, orderId]);
    await client.query('UPDATE order_details SET total_pelunasan=$1, pesan_kandang=$2, pesan_dapur_a=$3, pesan_dapur_r=$4, pesan_driver=$5, uang_saku_driver=$6 WHERE order_id=$7', [price, operational.pesanKandang || null, operational.pesanDapurA || null, operational.pesanDapurR || null, operational.pesanDriver || null, operational.uangSakuDriver || 0, orderId]);
    await client.query(`INSERT INTO notifications (id,user_id,category,title,message,priority,action_url,related_entity_id,created_at) VALUES ($1,$2,'quotation','Quotation Tersedia',$3,'high',$4,$5,$6)`, [`not-${crypto.randomUUID()}`, order.rows[0].customer_id, 'Penawaran harga tersedia.', `/customer/orders/${orderId}`, orderId, now]);
  });
}

export async function approvePostgresQuotation(orderId: string) {
  return withPostgresTransaction(async client => {
    const now = new Date();
    const result = await client.query<{ customer_id: string; status: string; vendor_invoice_no: string; atas_nama: string; address: string; recipient_name: string; delivery_date: string; delivery_time: string; animal_order: string; kandang_note: string | null; dapur_a_masakan: string | null; dapur_a_nasi_box: string | null; dapur_a_note: string | null }>('SELECT o.customer_id,o.status,o.vendor_invoice_no,o.atas_nama,d.address,d.recipient_name,d.delivery_date,d.delivery_time,d.animal_order,d.kandang_note,d.dapur_a_masakan,d.dapur_a_nasi_box,d.dapur_a_note FROM orders o JOIN order_details d ON d.order_id=o.id WHERE o.id=$1 FOR UPDATE', [orderId]);
    if (!result.rowCount || result.rows[0].status !== 'quotation_sent') throw new Error('Quotation tidak dapat disetujui.');
    const row = result.rows[0];
    await client.query("UPDATE quotations SET status='approved',updated_at=$1 WHERE order_id=$2", [now, orderId]);
    await client.query("UPDATE orders SET status='quotation_approved',approved_at=$1,updated_at=$1 WHERE id=$2", [now, orderId]);
    await client.query(`INSERT INTO kandang_orders (id,order_id,animal_type,animal_qty,slaughter_schedule,notes,prep_status,created_at) VALUES ($1,$2,$3,1,$4,$5,'pending',$6) ON CONFLICT (order_id) DO NOTHING`, [`kan-${orderId}`, orderId, row.animal_order, `${row.delivery_date} 06:00 WIB`, row.kandang_note, now]);
    await client.query(`INSERT INTO dapur_orders (id,order_id,menu,portion,cooking_schedule,notes,kitchen_status,created_at) VALUES ($1,$2,$3,'Sesuai pesanan',$4,$5,'waiting_cook',$6) ON CONFLICT (order_id) DO NOTHING`, [`dap-${orderId}`, orderId, `${row.dapur_a_masakan || 'Gulai & Sate'} / ${row.dapur_a_nasi_box || 'Nasi Box'}`, `${row.delivery_date} 07:30 WIB`, row.dapur_a_note, now]);
    await client.query(`INSERT INTO admin_orders (id,order_id,status_terkini,monitoring_notes,received_at) VALUES ($1,$2,'monitoring','Distribusi operasional otomatis berhasil',$3) ON CONFLICT (order_id) DO NOTHING`, [`adm-${orderId}`, orderId, now]);
    await client.query(`INSERT INTO driver_orders (id,order_id,delivery_address,contact_person,delivery_schedule,status,received_at) VALUES ($1,$2,$3,$4,$5,'assigned',$6) ON CONFLICT (order_id) DO NOTHING`, [`drv-${orderId}`, orderId, row.address, row.recipient_name || row.atas_nama, `${row.delivery_date} ${row.delivery_time}`, now]);
    await client.query(`INSERT INTO notifications (id,user_id,category,title,message,priority,action_url,related_entity_id,created_at) VALUES ($1,$2,'quotation','Quotation Disetujui','Quotation Anda telah disetujui.','high',$3,$4,$5)`, [`not-${crypto.randomUUID()}`, row.customer_id, `/customer/orders/${orderId}`, orderId, now]);
  });
}

export async function updatePostgresKandang(orderId: string, status: string, notes?: string) {
  return withPostgresTransaction(async client => {
    const order = await client.query<{ customer_id: string; vendor_invoice_no: string; status: string }>('SELECT customer_id, vendor_invoice_no, status FROM orders WHERE id=$1 FOR UPDATE', [orderId]);
    if (!order.rowCount) throw new Error('Pesanan tidak ditemukan.');
    if (order.rows[0].status === 'cancelled') throw new Error('Pesanan sudah dibatalkan.');

    const existing = await client.query('SELECT id, prep_status FROM kandang_orders WHERE order_id = $1', [orderId]);
    if (existing.rowCount) {
      await client.query('UPDATE kandang_orders SET prep_status=$1, notes=COALESCE($2, notes) WHERE order_id=$3', [status, notes || null, orderId]);
    } else {
      const detail = await client.query('SELECT animal_order, kandang_note, delivery_date FROM order_details WHERE order_id = $1', [orderId]);
      const row = detail.rows[0];
      await client.query(
        `INSERT INTO kandang_orders (id, order_id, animal_type, animal_qty, slaughter_schedule, notes, prep_status, created_at)
         VALUES ($1, $2, $3, 1, $4, $5, $6, $7)`,
        [`kan-${orderId}`, orderId, row?.animal_order || 'Kambing', `${row?.delivery_date || 'Segera'} 06:00 WIB`, notes || row?.kandang_note || null, status, new Date()]
      );
    }

    const orderStatus = status === 'ready' ? 'preparing' : status === 'slaughtered' ? 'slaughtering' : null;
    if (orderStatus) await client.query('UPDATE orders SET status=$1, updated_at=$2 WHERE id=$3', [orderStatus, new Date(), orderId]);
  });
}

export async function updatePostgresDapur(orderId: string, status: string, notes?: string) {
  return withPostgresTransaction(async client => {
    const order = await client.query<{ customer_id: string; vendor_invoice_no: string; status: string }>('SELECT customer_id, vendor_invoice_no, status FROM orders WHERE id=$1 FOR UPDATE', [orderId]);
    if (!order.rowCount) throw new Error('Pesanan tidak ditemukan.');
    if (order.rows[0].status === 'cancelled') throw new Error('Pesanan sudah dibatalkan.');

    const existing = await client.query('SELECT id, kitchen_status FROM dapur_orders WHERE order_id = $1', [orderId]);
    if (existing.rowCount) {
      await client.query('UPDATE dapur_orders SET kitchen_status=$1, notes=COALESCE($2, notes) WHERE order_id=$3', [status, notes || null, orderId]);
    } else {
      const detail = await client.query('SELECT dapur_a_masakan, dapur_a_nasi_box, dapur_a_note, delivery_date FROM order_details WHERE order_id = $1', [orderId]);
      const row = detail.rows[0];
      const menu = `${row?.dapur_a_masakan || 'Gulai & Sate'} / ${row?.dapur_a_nasi_box || 'Nasi Box'}`;
      const schedule = `${row?.delivery_date || 'Segera'} 07:30 WIB`;
      await client.query(
        `INSERT INTO dapur_orders (id, order_id, menu, portion, cooking_schedule, notes, kitchen_status, created_at)
         VALUES ($1, $2, $3, 'Sesuai pesanan', $4, $5, $6, $7)`,
        [`dap-${orderId}`, orderId, menu, schedule, notes || row?.dapur_a_note || null, status, new Date()]
      );
    }

    const orderStatus = status === 'cooking' ? 'cooking' : status === 'packed' ? 'packaging' : status === 'waiting_cook' && ['cooking', 'packaging'].includes(order.rows[0].status) ? 'slaughtering' : null;
    if (orderStatus) await client.query('UPDATE orders SET status=$1, updated_at=$2 WHERE id=$3', [orderStatus, new Date(), orderId]);

    const statusText = status === 'cooking' ? 'sedang dimasak' : status === 'packed' ? 'selesai dimasak dan dipacking' : 'menunggu antrean masak';
    await client.query(
      `INSERT INTO notifications (id, user_id, category, title, message, priority, action_url, related_entity_id, created_at)
       VALUES ($1, $2, 'pesanan', 'Pembaruan Produksi Dapur', $3, 'medium', $4, $5, $6)`,
      [`not-${crypto.randomUUID()}`, order.rows[0].customer_id, `Pesanan #${order.rows[0].vendor_invoice_no} ${statusText}.`, `/customer/orders/${orderId}`, orderId, new Date()]
    );
  });
}
