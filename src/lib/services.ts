import { db, initDb, hashPassword, verifyPassword } from './db';

// Ensure DB is initialized
initDb();

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status?: string;
  profileImageUrl?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  address?: string;
  postalCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderWithRelations {
  id: string;
  invoiceNo: string;
  vendorInvoiceNo: string;
  customerId: string;
  orderDate: string;
  jenisOrder: string;
  orderType?: string;
  atasNama: string;
  status: string;
  quotationPrice: number | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { name: string; email: string; phone: string };
  orderDetails?: any;
  items?: any[];
  quotation?: any;
  kandangOrder?: any;
  dapurOrder?: any;
  adminOrder?: any;
  driverOrder?: any;
  review?: any;
}

// User Services
export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as any;
}

export function getUserById(id: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as any;
}

export function createUser(data: { name: string; email: string; password: string; phone: string; role?: string }) {
  const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const hashedPassword = hashPassword(data.password);
  const now = new Date().toISOString();
  const role = data.role || 'customer';

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, phone, role, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.name, data.email, hashedPassword, data.phone, role, now, now);
  return getUserById(id);
}

// Order Services
export function generateVendorInvoiceNo(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countStmt = db.prepare('SELECT COUNT(*) AS [count] FROM orders WHERE vendorInvoiceNo LIKE ?');
  const res = countStmt.get(`INV-${dateStr}-%`) as { count: number };
  const seq = String(res.count + 1).padStart(4, '0');
  return `INV-${dateStr}-${seq}`;
}

export function getSlotOccupancy(deliveryDate: string, deliveryTime: string): number {
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) AS [count] FROM orders o
      JOIN order_details od ON o.id = od.orderId
      WHERE od.deliveryDate = ? AND od.deliveryTime = ? AND o.status != 'cancelled'
    `);
    const res = stmt.get(deliveryDate, deliveryTime) as { count: number };
    return res?.count || 0;
  } catch {
    return 0;
  }
}

export function getSlotCapacitiesForDate(deliveryDate: string): Record<string, number> {
  const slots = [
    '07.00 WIB', '08.00 WIB', '09.00 WIB', '10.00 WIB', '11.00 WIB',
    '12.00 WIB', '13.00 WIB', '14.00 WIB', '15.00 WIB', '16.00 WIB', '17.00 WIB'
  ];
  const result: Record<string, number> = {};
  slots.forEach(slot => {
    result[slot] = getSlotOccupancy(deliveryDate, slot);
  });
  return result;
}

export function getSlotOccupancyExcludingOrder(deliveryDate: string, deliveryTime: string, excludeOrderId: string): number {
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) AS [count] FROM orders o
      JOIN order_details od ON o.id = od.orderId
      WHERE od.deliveryDate = ? AND od.deliveryTime = ? AND o.status != 'cancelled' AND o.id != ?
    `);
    const res = stmt.get(deliveryDate, deliveryTime, excludeOrderId) as { count: number };
    return res?.count || 0;
  } catch {
    return 0;
  }
}

export function updateOrderService(
  orderId: string,
  adminId: string,
  data: {
  jenisOrder: string;
  orderType?: string;
  atasNama: string;
    fatherName: string;
    motherName: string;
    childName: string;
    recipientName: string;
    address: string;
    deliveryDate: string;
    deliveryTime: string;
    phone: string;
    animalOrder: string;
    dapurAMasakan?: string;
    dapurANasiBox?: string;
    pesananLainnya?: string;
    quotationPrice?: number;
  }
) {
  const existingOrder = getOrderById(orderId);
  if (!existingOrder) throw new Error('Pesanan tidak ditemukan');

  db.exec('BEGIN EXCLUSIVE TRANSACTION;');
  try {
    const otherCount = getSlotOccupancyExcludingOrder(data.deliveryDate, data.deliveryTime, orderId);
    if (otherCount >= 2) {
      throw new Error(`Slot ${data.deliveryTime} untuk tanggal ${data.deliveryDate} sudah penuh (2/2). Silakan pilih waktu lainnya.`);
    }

    const now = new Date().toISOString();
    const pName = `${data.fatherName} & ${data.motherName}`;
    const oldTotal = existingOrder.quotationPrice || existingOrder.orderDetails?.totalPelunasan || 0;
    const newTotal = data.quotationPrice !== undefined ? data.quotationPrice : oldTotal;
    const diff = newTotal - oldTotal;

    db.prepare('UPDATE orders SET jenisOrder = ?, atasNama = ?, quotationPrice = ?, updatedAt = ? WHERE id = ?')
      .run(data.jenisOrder, data.atasNama, newTotal, now, orderId);

    const quo = db.prepare('SELECT id FROM quotations WHERE orderId = ?').get(orderId);
    if (quo) {
      db.prepare('UPDATE quotations SET price = ?, updatedAt = ? WHERE orderId = ?').run(newTotal, now, orderId);
    } else if (newTotal > 0) {
      const quoId = `quo-${Date.now()}`;
      db.prepare('INSERT INTO quotations (id, orderId, adminId, price, note, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(quoId, orderId, adminId, newTotal, 'Auto-created on order update', 'pending', now, now);
    }

    db.prepare(`
      UPDATE order_details
      SET parentName = ?, fatherName = ?, motherName = ?, childName = ?, recipientName = ?, address = ?, deliveryDate = ?, deliveryTime = ?, phone = ?, animalOrder = ?, dapurAMasakan = ?, dapurANasiBox = ?, pesananLainnya = ?, totalPelunasan = ?
      WHERE orderId = ?
    `).run(
      pName,
      data.fatherName,
      data.motherName,
      data.childName,
      data.recipientName,
      data.address,
      data.deliveryDate,
      data.deliveryTime,
      data.phone,
      data.animalOrder,
      data.dapurAMasakan || '',
      data.dapurANasiBox || '',
      data.pesananLainnya || '',
      newTotal,
      orderId
    );

    db.prepare('DELETE FROM order_items WHERE orderId = ?').run(orderId);
    db.prepare(`
      INSERT INTO order_items (id, orderId, animalOrder, dapurAMasakan, dapurANasiBox, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`item-${Date.now()}-0`, orderId, data.animalOrder, data.dapurAMasakan || '', data.dapurANasiBox || '', now);

    const auditId = `aud-${Date.now()}`;
    db.prepare(`
      INSERT INTO access_audit_logs (id, actorId, targetUserId, action, permissionKey, oldValue, newValue, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      adminId,
      existingOrder.customerId,
      'UPDATE_ORDER_WITH_PRICE',
      'orders.edit',
      JSON.stringify({ atasNama: existingOrder.atasNama, total: oldTotal, deliveryDate: existingOrder.orderDetails?.deliveryDate }),
      JSON.stringify({ atasNama: data.atasNama, total: newTotal, deliveryDate: data.deliveryDate, diff }),
      now
    );

    db.exec('COMMIT;');
    return { order: getOrderById(orderId), oldTotal, newTotal, diff };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function createOrderService(customerId: string, data: {
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
  driverInfo?: string;
  driverFee?: number;
  animalOrder?: string;
  kandangNote?: string;
  dapurAMasakan?: string;
  dapurANasiBox?: string;
  dapurANote?: string;
  dapurRMasakan?: string;
  dapurRNasiBox?: string;
  dapurRNote?: string;
  items?: Array<{
    animalOrder: string;
    kandangNote?: string;
    dapurAMasakan?: string;
    dapurANasiBox?: string;
    dapurANote?: string;
    dapurRMasakan?: string;
    dapurRNasiBox?: string;
    dapurRNote?: string;
  }>;
  paymentStatus: string;
  pesananLainnya?: string;
  totalPelunasan: number;
  totalBayar: number;
}) {
  db.exec('BEGIN EXCLUSIVE TRANSACTION;');
  try {
    const currentCount = getSlotOccupancy(data.deliveryDate, data.deliveryTime);
    if (currentCount >= 2) {
      throw new Error(`Slot ${data.deliveryTime} untuk tanggal ${data.deliveryDate} sudah penuh (2/2). Silakan pilih waktu lainnya.`);
    }

    const orderId = `ord-${Date.now()}`;
    const vendorInvoiceNo = generateVendorInvoiceNo();
    const now = new Date().toISOString();
    const pName = data.parentName || `${data.fatherName} & ${data.motherName}`;

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, invoiceNo, vendorInvoiceNo, customerId, orderDate, jenisOrder, atasNama, status, quotationPrice, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting_review', ?, ?, ?)
    `);
    insertOrder.run(orderId, data.invoiceNo || vendorInvoiceNo, vendorInvoiceNo, customerId, now, data.jenisOrder, data.atasNama, data.totalPelunasan || 0, now, now);

    const orderItems = data.items && data.items.length > 0 ? data.items : [{
      animalOrder: data.animalOrder || 'Kambing Standar',
      kandangNote: data.kandangNote,
      dapurAMasakan: data.dapurAMasakan,
      dapurANasiBox: data.dapurANasiBox,
      dapurANote: data.dapurANote,
      dapurRMasakan: data.dapurRMasakan,
      dapurRNasiBox: data.dapurRNasiBox,
      dapurRNote: data.dapurRNote,
    }];

    const firstItem = orderItems[0];

    const insertDetail = db.prepare(`
      INSERT INTO order_details (
        id, orderId, parentName, fatherName, motherName, childName, recipientName, address, deliveryDate, deliveryTime, phone, driverInfo, driverFee,
        animalOrder, kandangNote, dapurAMasakan, dapurANasiBox, dapurANote, dapurRMasakan, dapurRNasiBox, dapurRNote, pesananLainnya,
        paymentStatus, totalPelunasan, totalBayar, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertDetail.run(
      `det-${Date.now()}`,
      orderId,
      pName,
      data.fatherName,
      data.motherName,
      data.childName,
      data.recipientName,
      data.address,
      data.deliveryDate,
      data.deliveryTime,
      data.phone,
      data.driverInfo || '',
      data.driverFee || 0,
      firstItem.animalOrder,
      firstItem.kandangNote || '',
      firstItem.dapurAMasakan || '',
      firstItem.dapurANasiBox || '',
      firstItem.dapurANote || '',
      firstItem.dapurRMasakan || '',
      firstItem.dapurRNasiBox || '',
      firstItem.dapurRNote || '',
      data.pesananLainnya || '',
      data.paymentStatus,
      data.totalPelunasan,
      data.totalBayar,
      now
    );

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (id, orderId, animalOrder, kandangNote, dapurAMasakan, dapurANasiBox, dapurANote, dapurRMasakan, dapurRNasiBox, dapurRNote, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    orderItems.forEach((it, idx) => {
      insertItemStmt.run(
        `item-${Date.now()}-${idx}`,
        orderId,
        it.animalOrder,
        it.kandangNote || '',
        it.dapurAMasakan || '',
        it.dapurANasiBox || '',
        it.dapurANote || '',
        it.dapurRMasakan || '',
        it.dapurRNasiBox || '',
        it.dapurRNote || '',
        now
      );
    });

    createNotification({
      userId: customerId,
      category: 'pesanan',
      title: 'Pesanan Berhasil Diajukan',
      message: `Pesanan baru #${vendorInvoiceNo} untuk ${data.atasNama} telah diajukan dan menunggu peninjauan admin.`,
      priority: 'medium',
      actionUrl: `/customer/orders/${orderId}`,
      relatedEntityId: orderId,
    });

    db.exec('COMMIT;');
    return getOrderById(orderId);
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function getAllOrders(filters?: { customerId?: string; role?: string; status?: string; search?: string }) {
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (filters?.customerId) {
    query += ' AND customerId = ?';
    params.push(filters.customerId);
  }
  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters?.search) {
    query += ' AND (invoiceNo LIKE ? OR vendorInvoiceNo LIKE ? OR atasNama LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY createdAt DESC';
  const stmt = db.prepare(query);
  const orders = stmt.all(...params) as any[];

  return orders.map(o => enrichOrder(o));
}

export function getOrderById(orderId: string): OrderWithRelations | null {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const order = stmt.get(orderId) as any;
  if (!order) return null;
  return enrichOrder(order);
}

function enrichOrder(order: any): OrderWithRelations {
  const custStmt = db.prepare('SELECT name, email, phone FROM users WHERE id = ?');
  const customer = custStmt.get(order.customerId);

  const detailStmt = db.prepare('SELECT * FROM order_details WHERE orderId = ?');
  const orderDetails = detailStmt.get(order.id);

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE orderId = ?');
  let items = itemsStmt.all(order.id) as any[];
  if (!items || items.length === 0) {
    if (orderDetails) {
      items = [{
        id: orderDetails.id || `item-${order.id}-1`,
        orderId: order.id,
        animalOrder: orderDetails.animalOrder || '',
        kandangNote: orderDetails.kandangNote || '',
        dapurAMasakan: orderDetails.dapurAMasakan || '',
        dapurANasiBox: orderDetails.dapurANasiBox || '',
        dapurANote: orderDetails.dapurANote || '',
        dapurRMasakan: orderDetails.dapurRMasakan || '',
        dapurRNasiBox: orderDetails.dapurRNasiBox || '',
        dapurRNote: orderDetails.dapurRNote || '',
        createdAt: orderDetails.createdAt || order.createdAt
      }];
    } else {
      items = [];
    }
  }

  const quoStmt = db.prepare('SELECT * FROM quotations WHERE orderId = ?');
  const quotation = quoStmt.get(order.id);

  const kanStmt = db.prepare('SELECT * FROM kandang_orders WHERE orderId = ?');
  const kandangOrder = kanStmt.get(order.id);

  const dapStmt = db.prepare('SELECT * FROM dapur_orders WHERE orderId = ?');
  const dapurOrder = dapStmt.get(order.id);

  const admStmt = db.prepare('SELECT * FROM admin_orders WHERE orderId = ?');
  const adminOrder = admStmt.get(order.id);

  const drvStmt = db.prepare('SELECT * FROM driver_orders WHERE orderId = ?');
  const driverOrder = drvStmt.get(order.id);

  const revStmt = db.prepare('SELECT * FROM reviews WHERE orderId = ?');
  const review = revStmt.get(order.id);

  return {
    ...order,
    customer,
    orderDetails,
    items,
    quotation,
    kandangOrder,
    dapurOrder,
    adminOrder,
    driverOrder,
    review
  };
}

// Quotation & Operational Distribution
export function createQuotationService(
  orderId: string,
  adminId: string,
  price: number,
  note: string,
  operational?: {
    pesanKandang?: string;
    pesanDapurA?: string;
    pesanDapurR?: string;
    pesanDriver?: string;
    uangSakuDriver?: number;
  }
) {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM quotations WHERE orderId = ?').get(orderId);

  db.exec('BEGIN TRANSACTION;');
  try {
    if (existing) {
      db.prepare('UPDATE quotations SET price = ?, note = ?, status = \'pending\', updatedAt = ? WHERE orderId = ?').run(price, note, now, orderId);
    } else {
      const id = `quo-${Date.now()}`;
      db.prepare('INSERT INTO quotations (id, orderId, adminId, price, note, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, \'pending\', ?, ?)').run(id, orderId, adminId, price, note, now, now);
    }

    db.prepare('UPDATE orders SET status = \'quotation_sent\', quotationPrice = ?, updatedAt = ? WHERE id = ?').run(price, now, orderId);
    db.prepare('UPDATE order_details SET totalPelunasan = ? WHERE orderId = ?').run(price, orderId);

    if (operational) {
      db.prepare(`
        UPDATE order_details 
        SET pesanKandang = ?, pesanDapurA = ?, pesanDapurR = ?, pesanDriver = ?, uangSakuDriver = ?
        WHERE orderId = ?
      `).run(
        operational.pesanKandang || '',
        operational.pesanDapurA || '',
        operational.pesanDapurR || '',
        operational.pesanDriver || '',
        operational.uangSakuDriver || 0,
        orderId
      );
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  const updatedOrder = getOrderById(orderId);
  if (updatedOrder) {
    createNotification({
      userId: updatedOrder.customerId,
      category: 'quotation',
      title: 'Quotation / Penawaran Harga Tersedia',
      message: `Quotation resmi untuk pesanan #${updatedOrder.vendorInvoiceNo} (${updatedOrder.atasNama}) telah dikirim. Total: Rp ${price.toLocaleString('id-ID')}.`,
      priority: 'high',
      actionUrl: `/customer/orders/${orderId}`,
      relatedEntityId: orderId,
    });
  }
  return updatedOrder;
}

export function approveQuotationService(orderId: string) {
  const now = new Date().toISOString();
  const order = getOrderById(orderId);
  if (!order || order.status !== 'quotation_sent') {
    throw new Error('Pesanan tidak dapat disetujui karena quotation sudah tidak berstatus pending/sent.');
  }

  // Transactional distribution
  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('UPDATE quotations SET status = \'approved\', updatedAt = ? WHERE orderId = ?').run(now, orderId);
    db.prepare('UPDATE orders SET status = \'quotation_approved\', approvedAt = ?, updatedAt = ? WHERE id = ?').run(now, now, orderId);

    // Create Kandang Order
    const detail = order.orderDetails;
    const animalType = detail?.animalOrder || 'Kambing Standar';
    db.prepare(`
      INSERT OR REPLACE INTO kandang_orders (id, orderId, animalType, animalQty, slaughterSchedule, notes, prepStatus, createdAt)
      VALUES (?, ?, ?, 1, ?, ?, 'pending', ?)
    `).run(`kan-${orderId}`, orderId, animalType, `${detail?.deliveryDate || 'Segera'} 06:00 WIB`, detail?.kandangNote || 'Sesuai permintaan', now);

    // Create Dapur Order
    db.prepare(`
      INSERT OR REPLACE INTO dapur_orders (id, orderId, menu, portion, cookingSchedule, notes, kitchenStatus, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'waiting_cook', ?)
    `).run(
      `dap-${orderId}`,
      orderId,
      `${detail?.dapurAMasakan || 'Gulai & Sate'} / ${detail?.dapurANasiBox || 'Nasi Box'}`,
      'Sesuai pesanan',
      `${detail?.deliveryDate || 'Segera'} 07:30 WIB`,
      detail?.dapurANote || '',
      now
    );

    // Create Admin Monitoring Order
    db.prepare(`
      INSERT OR REPLACE INTO admin_orders (id, orderId, status_terkini, monitoring_notes, receivedAt)
      VALUES (?, ?, 'monitoring', 'Distribusi operasional otomatis berhasil', ?)
    `).run(`adm-${orderId}`, orderId, now);

    // Create Driver Order
    db.prepare(`
      INSERT OR REPLACE INTO driver_orders (id, orderId, deliveryAddress, contactPerson, deliverySchedule, status, receivedAt)
      VALUES (?, ?, ?, ?, ?, 'assigned', ?)
    `).run(
      `drv-${orderId}`,
      orderId,
      detail?.address || '',
      detail?.recipientName || order.atasNama,
      `${detail?.deliveryDate} ${detail?.deliveryTime}`,
      now
    );

    db.exec('COMMIT');
    const approvedOrder = getOrderById(orderId);
    if (approvedOrder) {
      createNotification({
        userId: approvedOrder.customerId,
        category: 'quotation',
        title: 'Quotation Disetujui',
        message: `Quotation untuk pesanan #${approvedOrder.vendorInvoiceNo} telah disetujui. Silakan lakukan pembayaran DP.`,
        priority: 'high',
        actionUrl: `/customer/orders/${orderId}`,
        relatedEntityId: orderId,
      });
    }
    return approvedOrder;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function rejectQuotationService(orderId: string) {
  const now = new Date().toISOString();
  db.prepare('UPDATE quotations SET status = \'rejected\', updatedAt = ? WHERE orderId = ?').run(now, orderId);
  db.prepare('UPDATE orders SET status = \'cancelled\', updatedAt = ? WHERE id = ?').run(now, orderId);
  const rejectedOrder = getOrderById(orderId);
  if (rejectedOrder) {
    createNotification({
      userId: rejectedOrder.customerId,
      category: 'pesanan',
      title: 'Pesanan Dibatalkan',
      message: `Quotation untuk pesanan #${rejectedOrder.vendorInvoiceNo} ditolak dan pesanan dibatalkan.`,
      priority: 'medium',
      actionUrl: `/customer/orders/${orderId}`,
      relatedEntityId: orderId,
    });
  }
  return rejectedOrder;
}

export function updateOrderStatusService(orderId: string, nextStatus: string) {
  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?').run(nextStatus, now, orderId);
  return getOrderById(orderId);
}

export function updateKandangStatusService(orderId: string, prepStatus: string, notes?: string) {
  db.prepare('UPDATE kandang_orders SET prepStatus = ?, notes = COALESCE(?, notes) WHERE orderId = ?').run(prepStatus, notes || null, orderId);
  if (prepStatus === 'slaughtered') {
    updateOrderStatusService(orderId, 'slaughtering');
  } else if (prepStatus === 'ready') {
    updateOrderStatusService(orderId, 'preparing');
  }
  return getOrderById(orderId);
}

export function updateDapurStatusService(orderId: string, kitchenStatus: string, notes?: string) {
  db.prepare('UPDATE dapur_orders SET kitchenStatus = ?, notes = COALESCE(?, notes) WHERE orderId = ?').run(kitchenStatus, notes || null, orderId);
  if (kitchenStatus === 'cooking') {
    updateOrderStatusService(orderId, 'cooking');
  } else if (kitchenStatus === 'packed') {
    updateOrderStatusService(orderId, 'packaging');
  }
  return getOrderById(orderId);
}

export function markDriverArrived(orderId: string, driverId: string) {
  const driverOrder = db.prepare('SELECT * FROM driver_orders WHERE orderId = ?').get(orderId) as any;
  if (!driverOrder) throw new Error('Data pengiriman tidak ditemukan.');
  if (driverOrder.status !== 'on_delivery') throw new Error('Pengiriman harus berstatus "on_delivery" untuk menandai tiba.');
  if (driverOrder.arrivedAt) throw new Error('Driver sudah menandai tiba di lokasi.');
  const now = new Date().toISOString();
  db.prepare('UPDATE driver_orders SET arrivedAt = ? WHERE orderId = ?').run(now, orderId);
  logAudit(driverId, 'driver_arrived', 'driver_orders', orderId, driverOrder.status, 'arrived');
  return getOrderById(orderId);
}

export function completeDeliveryService(orderId: string, driverId: string, data: {
  deliveryProof?: string;
  deliveryNote?: string;
}) {
  const driverOrder = db.prepare('SELECT * FROM driver_orders WHERE orderId = ?').get(orderId) as any;
  if (!driverOrder) throw new Error('Data pengiriman tidak ditemukan.');
  if (driverOrder.status === 'delivered') throw new Error('Pengiriman sudah diselesaikan sebelumnya.');
  if (driverOrder.status !== 'on_delivery') throw new Error('Pengiriman harus berstatus "on_delivery" untuk diselesaikan.');
  if (!driverOrder.arrivedAt) throw new Error('Driver harus menandai "Tiba di Lokasi" terlebih dahulu.');
  if (!data.deliveryProof) throw new Error('Bukti pengiriman (foto) wajib diunggah.');

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE driver_orders SET status = 'delivered', deliveredAt = ?, deliveryProof = ?, deliveryNote = ? WHERE orderId = ?
  `).run(now, data.deliveryProof, data.deliveryNote || null, orderId);

  updateOrderStatusService(orderId, 'completed');
  logAudit(driverId, 'delivery_completed', 'driver_orders', orderId, 'on_delivery', 'delivered');

  const order = getOrderById(orderId);
  if (order) {
    createNotification({
      userId: order.customerId,
      category: 'pesanan',
      title: 'Pesanan Selesai Dikirim',
      message: `Pesanan #${order.vendorInvoiceNo} telah selesai dikirim dan diterima. Terima kasih telah menggunakan Aqiqah Almeera!`,
      priority: 'medium',
      actionUrl: `/customer/orders/${orderId}`,
      relatedEntityId: orderId,
    });

    const admins = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'master_admin') AND status = 'active'").all() as any[];
    admins.forEach(admin => {
      createNotification({
        userId: admin.id,
        category: 'pengiriman',
        title: 'Pengiriman Selesai',
        message: `Pesanan #${order.vendorInvoiceNo} telah selesai dikirim oleh driver.`,
        priority: 'medium',
        actionUrl: `/customer/orders/${orderId}`,
        relatedEntityId: orderId,
      });
    });
  }

  return getOrderById(orderId);
}

export function updateDriverStatusService(orderId: string, status: string) {
  const order = getOrderById(orderId);
  db.prepare('UPDATE driver_orders SET status = ? WHERE orderId = ?').run(status, orderId);
  if (status === 'on_delivery') {
    updateOrderStatusService(orderId, 'delivery');
    if (order) {
      createNotification({
        userId: order.customerId,
        category: 'pengiriman',
        title: 'Pesanan Sedang Dikirim',
        message: `Pesanan #${order.vendorInvoiceNo} sedang dalam perjalanan pengiriman ke lokasi Anda.`,
        priority: 'high',
        actionUrl: `/customer/orders/${orderId}`,
        relatedEntityId: orderId,
      });
    }
  } else if (status === 'delivered') {
    updateOrderStatusService(orderId, 'completed');
    if (order) {
      createNotification({
        userId: order.customerId,
        category: 'pesanan',
        title: 'Pesanan Selesai',
        message: `Pesanan #${order.vendorInvoiceNo} telah selesai. Terima kasih telah menggunakan Aqiqah Almeera!`,
        priority: 'medium',
        actionUrl: `/customer/orders/${orderId}`,
        relatedEntityId: orderId,
      });
    }
  }
  return getOrderById(orderId);
}

export function createReviewService(orderId: string, customerId: string, rating: number, comment: string) {
  const id = `rev-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO reviews (id, orderId, customerId, rating, comment, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, orderId, customerId, rating, comment, now);

  const order = getOrderById(orderId);
  if (order) {
    createNotification({
      userId: customerId,
      category: 'pesanan',
      title: 'Ulasan Berhasil Dikirim',
      message: `Terima kasih atas ulasan bintang ${rating} untuk pesanan #${order.vendorInvoiceNo}.`,
      priority: 'low',
      actionUrl: `/customer/orders/${orderId}`,
      relatedEntityId: orderId,
    });
  }
  return getOrderById(orderId);
}

// User Management Services
export function getAllCustomers() {
  const stmt = db.prepare(`
    SELECT u.*, (SELECT COUNT(*) FROM orders o WHERE o.customerId = u.id) as totalOrders
    FROM users u
    WHERE u.role = 'customer'
    ORDER BY u.createdAt DESC
  `);
  return stmt.all() as any[];
}

export function getAllStaff() {
  const stmt = db.prepare(`
    SELECT * FROM users
    WHERE role != 'customer'
    ORDER BY createdAt DESC
  `);
  return stmt.all() as any[];
}

export function updateUserRoleAndStatus(userId: string, role: string, status: string, actorId: string) {
  const user = getUserById(userId);
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET role = ?, status = ?, updatedAt = ? WHERE id = ?').run(role, status, now, userId);

  const logId = `log-${Date.now()}`;
  db.prepare('INSERT INTO access_audit_logs (id, actorId, targetUserId, action, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(logId, actorId, userId, 'UPDATE_USER_ROLE_STATUS', `role:${user?.role}, status:${user?.status}`, `role:${role}, status:${status}`, now);

  return getUserById(userId);
}

export function deleteStaffService(userId: string, actorId: string) {
  const user = getUserById(userId);
  if (!user) throw new Error('Staff tidak ditemukan.');
  if (user.role === 'master_admin') {
    throw new Error('Akun Master Admin utama tidak dapat dihapus.');
  }

  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('DELETE FROM user_permissions WHERE userId = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    const logId = `log-${Date.now()}`;
    db.prepare('INSERT INTO access_audit_logs (id, actorId, targetUserId, action, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, actorId, userId, 'DELETE_STAFF', `email:${user.email}, role:${user.role}`, 'DELETED', new Date().toISOString());

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// Permission & Role Management
export function getAllRoles() {
  return db.prepare('SELECT * FROM roles').all() as any[];
}

export function getAllPermissions() {
  return db.prepare('SELECT * FROM permissions ORDER BY module, key').all() as any[];
}

export function getRolePermissionKeys(roleName: string): string[] {
  const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName) as any;
  if (!role) {
    return [];
  }

  const perms = db.prepare(`
    SELECT p.key FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permissionId
    WHERE rp.roleId = ?
  `).all(role.id) as any[];

  return perms.map(p => p.key);
}

export function getEffectivePermissions(userId: string): string[] {
  const user = getUserById(userId);
  if (!user) return [];

  if (user.role === 'master_admin') {
    const all = db.prepare('SELECT key FROM permissions').all() as any[];
    return all.map(p => p.key);
  }

  const rolePerms = getRolePermissionKeys(user.role);
  const permSet = new Set(rolePerms);

  const overrides = db.prepare(`
    SELECT p.key, up.effect FROM user_permissions up
    JOIN permissions p ON up.permissionId = p.id
    WHERE up.userId = ?
  `).all(userId) as any[];

  overrides.forEach(o => {
    if (o.effect === 'allow') permSet.add(o.key);
    if (o.effect === 'deny') permSet.delete(o.key);
  });

  return Array.from(permSet);
}

export function hasPermission(user: any, permissionKey: string): boolean {
  if (!user) return false;
  if (user.status !== 'active') return false;
  if (user.role === 'master_admin') return true;
  const effective = getEffectivePermissions(user.id);
  return effective.includes(permissionKey);
}

export function requirePermission(user: any, permissionKey: string) {
  if (!hasPermission(user, permissionKey)) {
    throw new Error(`Forbidden: Anda memerlukan izin '${permissionKey}' untuk melakukan aksi ini.`);
  }
}

export function updateCustomerProfileService(userId: string, data: {
  name: string;
  phone: string;
  profileImageUrl?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  address?: string;
  postalCode?: string;
  notes?: string;
}) {
  const now = new Date().toISOString();
  if (data.profileImageUrl !== undefined) {
    db.prepare(`
      UPDATE users SET
        name = ?,
        phone = ?,
        profileImageUrl = COALESCE(?, profileImageUrl),
        province = ?,
        city = ?,
        district = ?,
        village = ?,
        address = ?,
        postalCode = ?,
        notes = ?,
        updatedAt = ?
      WHERE id = ? AND role = 'customer'
    `).run(
      data.name,
      data.phone,
      data.profileImageUrl,
      data.province || null,
      data.city || null,
      data.district || null,
      data.village || null,
      data.address || null,
      data.postalCode || null,
      data.notes || null,
      now,
      userId
    );
  } else {
    db.prepare(`
      UPDATE users SET
        name = ?,
        phone = ?,
        province = ?,
        city = ?,
        district = ?,
        village = ?,
        address = ?,
        postalCode = ?,
        notes = ?,
        updatedAt = ?
      WHERE id = ? AND role = 'customer'
    `).run(
      data.name,
      data.phone,
      data.province || null,
      data.city || null,
      data.district || null,
      data.village || null,
      data.address || null,
      data.postalCode || null,
      data.notes || null,
      now,
      userId
    );
  }
  return getUserById(userId);
}

export function updateRolePermissions(roleId: string, permissionKeys: string[], actorId: string) {
  const role = db.prepare('SELECT name FROM roles WHERE id = ?').get(roleId) as any;
  if (role && role.name === 'master_admin') {
    throw new Error('Master Admin adalah role superuser dengan akses penuh permanen dan tidak dapat diubah.');
  }

  const now = new Date().toISOString();
  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('DELETE FROM role_permissions WHERE roleId = ?').run(roleId);
    const insert = db.prepare('INSERT INTO role_permissions (roleId, permissionId) VALUES (?, (SELECT id FROM permissions WHERE key = ?))');
    permissionKeys.forEach(key => {
      insert.run(roleId, key);
    });

    const logId = `log-${Date.now()}`;
    db.prepare('INSERT INTO access_audit_logs (id, actorId, targetUserId, action, permissionKey, newValue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, actorId, roleId, 'UPDATE_ROLE_PERMISSIONS', null, permissionKeys.join(','), now);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function updateUserPermissionOverride(userId: string, permissionKey: string, effect: 'allow' | 'deny' | 'none', actorId: string) {
  const now = new Date().toISOString();
  const perm = db.prepare('SELECT id FROM permissions WHERE key = ?').get(permissionKey) as any;
  if (!perm) return;

  db.exec('BEGIN TRANSACTION');
  try {
    db.prepare('DELETE FROM user_permissions WHERE userId = ? AND permissionId = ?').run(userId, perm.id);
    if (effect === 'allow' || effect === 'deny') {
      db.prepare('INSERT INTO user_permissions (userId, permissionId, effect) VALUES (?, ?, ?)').run(userId, perm.id, effect);
    }

    const logId = `log-${Date.now()}`;
    db.prepare('INSERT INTO access_audit_logs (id, actorId, targetUserId, action, permissionKey, newValue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(logId, actorId, userId, 'USER_PERMISSION_OVERRIDE', permissionKey, effect, now);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function logAudit(actorId: string, action: string, entity: string, entityId: string, oldValue?: string, newValue?: string) {
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO access_audit_logs (id, actorId, targetUserId, action, permissionKey, oldValue, newValue, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, actorId, entityId, action, entity, oldValue || null, newValue || null, now);
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}

// Payment Services & Ledger
export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  paymentType: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  proof?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  customer?: { name: string; email: string; phone: string };
  order?: any;
}

export function getPaymentsByOrderId(orderId: string): Payment[] {
  const stmt = db.prepare('SELECT * FROM payments WHERE orderId = ? ORDER BY createdAt DESC');
  const payments = stmt.all(orderId) as any[];
  const custStmt = db.prepare('SELECT name, email, phone FROM users WHERE id = ?');
  return payments.map(p => ({
    ...p,
    customer: custStmt.get(p.customerId)
  }));
}

export function getAllPayments(filters?: { status?: string }) {
  let query = 'SELECT * FROM payments WHERE 1=1';
  const params: any[] = [];
  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  query += ' ORDER BY createdAt DESC';
  const payments = db.prepare(query).all(...params) as any[];
  const custStmt = db.prepare('SELECT name, email, phone FROM users WHERE id = ?');
  const orderStmt = db.prepare('SELECT vendorInvoiceNo, atasNama FROM orders WHERE id = ?');
  return payments.map(p => ({
    ...p,
    customer: custStmt.get(p.customerId),
    order: orderStmt.get(p.orderId)
  }));
}

export function createPaymentService(orderId: string, customerId: string, data: {
  paymentType: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  proof?: string;
  notes?: string;
}) {
  const order = getOrderById(orderId);
  if (!order || order.customerId !== customerId) {
    throw new Error('Pesanan tidak ditemukan atau tidak memiliki akses.');
  }
  if (order.status === 'waiting_review' || order.status === 'quotation_sent' || order.status === 'cancelled') {
    throw new Error('Pembayaran belum dapat dilakukan sebelum penawaran harga (quotation) disetujui.');
  }

  const paymentId = `pay-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO payments (id, orderId, customerId, paymentType, amount, paymentMethod, paymentDate, proof, status, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting_verification', ?, ?)
  `).run(
    paymentId,
    orderId,
    customerId,
    data.paymentType,
    data.amount,
    data.paymentMethod,
    data.paymentDate,
    data.proof || null,
    data.notes || null,
    now
  );

  logAudit(customerId, 'SUBMIT_PAYMENT', 'payments', paymentId, undefined, `amount:${data.amount}, type:${data.paymentType}`);
  createNotification({
    userId: customerId,
    category: 'pembayaran',
    title: 'Bukti Pembayaran Dikirim',
    message: `Bukti transfer sebesar Rp ${data.amount.toLocaleString('id-ID')} sedang diverifikasi oleh admin.`,
    priority: 'medium',
    actionUrl: `/customer/orders/${orderId}`,
    relatedEntityId: orderId,
  });
  return paymentId;
}

export function verifyPaymentService(paymentId: string, adminId: string, action: 'verify' | 'reject', rejectionReason?: string) {
  const payStmt = db.prepare('SELECT * FROM payments WHERE id = ?');
  const payment = payStmt.get(paymentId) as any;
  if (!payment) throw new Error('Data pembayaran tidak ditemukan.');

  const now = new Date().toISOString();
  const newStatus = action === 'verify' ? 'verified' : 'rejected';

  db.exec('BEGIN TRANSACTION');
  try {
    if (action === 'verify') {
      db.prepare(`
        UPDATE payments SET status = 'verified', verifiedBy = ?, verifiedAt = ?, rejectionReason = NULL WHERE id = ?
      `).run(adminId, now, paymentId);

      const sumStmt = db.prepare('SELECT SUM(amount) as total FROM payments WHERE orderId = ? AND status = \'verified\'');
      const sumRes = sumStmt.get(payment.orderId) as { total: number };
      const totalVerified = sumRes.total || 0;

      const order = getOrderById(payment.orderId);
      const totalBill = order?.quotationPrice || order?.orderDetails?.totalPelunasan || 0;
      const paymentStatus = totalVerified >= totalBill ? 'lunas' : 'dp';

      db.prepare(`
        UPDATE order_details SET totalBayar = ?, paymentStatus = ? WHERE orderId = ?
      `).run(totalVerified, paymentStatus, payment.orderId);

    } else {
      if (!rejectionReason) throw new Error('Alasan penolakan wajib diisi.');
      db.prepare(`
        UPDATE payments SET status = 'rejected', verifiedBy = ?, verifiedAt = ?, rejectionReason = ? WHERE id = ?
      `).run(adminId, now, rejectionReason, paymentId);
    }

    logAudit(adminId, action === 'verify' ? 'VERIFY_PAYMENT' : 'REJECT_PAYMENT', 'payments', paymentId, payment.status, newStatus);

    const order = getOrderById(payment.orderId);
    createNotification({
      userId: payment.customerId,
      category: 'pembayaran',
      title: action === 'verify' ? 'Pembayaran Telah Diverifikasi' : 'Bukti Pembayaran Perlu Diperbaiki',
      message: action === 'verify'
        ? `Pembayaran sebesar Rp ${payment.amount.toLocaleString('id-ID')} untuk pesanan #${order?.vendorInvoiceNo} telah disahkan.`
        : `Bukti pembayaran ditolak. Alasan: ${rejectionReason}. Silakan unggah ulang.`,
      priority: action === 'verify' ? 'medium' : 'high',
      actionUrl: `/customer/orders/${payment.orderId}`,
      relatedEntityId: payment.orderId,
    });

    db.exec('COMMIT');
    return getOrderById(payment.orderId);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function getCustomerDocuments(customerId: string) {
  const orders = getAllOrders({ customerId });
  const documents: any[] = [];

  orders.forEach(order => {
    // 1. Quotation Document
    if (order.quotation) {
      documents.push({
        id: `doc-quo-${order.id}`,
        type: 'quotation',
        typeName: 'Quotation / Penawaran',
        number: `QT-${order.vendorInvoiceNo}`,
        title: `Penawaran Harga Aqiqah - ${order.atasNama}`,
        orderId: order.id,
        vendorInvoiceNo: order.vendorInvoiceNo,
        atasNama: order.atasNama,
        date: order.quotation.createdAt || order.createdAt,
        status: order.quotation.status,
        amount: order.quotation.price,
        actionUrl: `/customer/orders/${order.id}`
      });
    }

    // 2. Invoice Document
    documents.push({
      id: `doc-inv-${order.id}`,
      type: 'invoice',
      typeName: 'Invoice Resmi',
      number: order.vendorInvoiceNo,
      title: `Invoice Pesanan - ${order.atasNama}`,
      orderId: order.id,
      vendorInvoiceNo: order.vendorInvoiceNo,
      atasNama: order.atasNama,
      date: order.createdAt,
      status: order.status,
      amount: order.quotationPrice || order.orderDetails?.totalPelunasan || 0,
      actionUrl: `/customer/orders/${order.id}`
    });

    // 3. Payment Receipts (Kwitansi)
    const payments = getPaymentsByOrderId(order.id);
    payments.forEach(p => {
      if (p.status === 'verified') {
        documents.push({
          id: `doc-pay-${p.id}`,
          type: 'payment',
          typeName: 'Kwitansi Pembayaran',
          number: `KW-${p.id.slice(-6).toUpperCase()}`,
          title: `Bukti Pembayaran ${p.paymentType.toUpperCase()} - Rp ${p.amount.toLocaleString('id-ID')}`,
          orderId: order.id,
          vendorInvoiceNo: order.vendorInvoiceNo,
          atasNama: order.atasNama,
          date: p.verifiedAt || p.createdAt,
          status: 'Terverifikasi',
          amount: p.amount,
          actionUrl: p.proof || `/customer/orders/${order.id}`
        });
      }
    });
  });

  return documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Notification Services
export function createNotification(data: {
  userId: string;
  category: string;
  title: string;
  message: string;
  priority?: string;
  actionUrl?: string;
  relatedEntityId?: string;
}) {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO notifications (id, userId, category, title, message, priority, actionUrl, relatedEntityId, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.userId,
    data.category,
    data.title,
    data.message,
    data.priority || 'medium',
    data.actionUrl || null,
    data.relatedEntityId || null,
    now
  );
  return id;
}

export function getNotificationsByUserId(userId: string) {
  const stmt = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC');
  return stmt.all(userId) as any[];
}

export function getUnreadNotificationCount(userId: string): number {
  const stmt = db.prepare('SELECT COUNT(*) AS [count] FROM notifications WHERE userId = ? AND readAt IS NULL');
  const res = stmt.get(userId) as { count: number };
  return res.count || 0;
}

export function markNotificationAsRead(notificationId: string, userId: string) {
  const now = new Date().toISOString();
  db.prepare('UPDATE notifications SET readAt = ? WHERE id = ? AND userId = ?').run(now, notificationId, userId);
}

export function markAllNotificationsAsRead(userId: string) {
  const now = new Date().toISOString();
  db.prepare('UPDATE notifications SET readAt = ? WHERE userId = ? AND readAt IS NULL').run(now, userId);
}
