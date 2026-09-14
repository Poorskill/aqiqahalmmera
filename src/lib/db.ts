// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'aqiqah.db');
const db = new DatabaseSync(dbPath);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return password === stored;
    const hashedBuffer = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
  } catch {
    return false;
  }
}

// Initialize tables
export function initDb() {
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA busy_timeout = 5000;');
  } catch {}

  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      status TEXT NOT NULL DEFAULT 'active',
      province TEXT,
      city TEXT,
      district TEXT,
      village TEXT,
      address TEXT,
      postalCode TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    `);

    const cols = ['province', 'city', 'district', 'village', 'address', 'postalCode', 'notes', 'status', 'profileImageUrl'];
    cols.forEach(col => {
      try { db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT;`); } catch {}
    });

    const adminCols = ['status_terkini', 'monitoring_notes', 'statusTerkini', 'monitoringNotes'];
    adminCols.forEach(col => {
      try { db.exec(`ALTER TABLE admin_orders ADD COLUMN ${col} TEXT;`); } catch {}
    });

    const orderCols = ['quotationPrice', 'approvedAt'];
    orderCols.forEach(col => {
      try { db.exec(`ALTER TABLE orders ADD COLUMN ${col} REAL;`); } catch {}
    });

    const orderDetailCols = ['fatherName', 'motherName', 'pesananLainnya', 'pesanKandang', 'pesanDapurA', 'pesanDapurR', 'pesanDriver', 'uangSakuDriver', 'totalPelunasan', 'totalBayar'];
    orderDetailCols.forEach(col => {
      try { db.exec(`ALTER TABLE order_details ADD COLUMN ${col} REAL;`); } catch {}
    });

    const driverOrderCols = ['driverId', 'arrivedAt', 'deliveredAt', 'deliveryProof', 'deliveryNote'];
    driverOrderCols.forEach(col => {
      try { db.exec(`ALTER TABLE driver_orders ADD COLUMN ${col} TEXT;`); } catch {}
    });

    db.exec(`

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      isSystemRole INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      module TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      roleId TEXT NOT NULL,
      permissionId TEXT NOT NULL,
      PRIMARY KEY (roleId, permissionId),
      FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_permissions (
      userId TEXT NOT NULL,
      permissionId TEXT NOT NULL,
      effect TEXT NOT NULL DEFAULT 'allow',
      PRIMARY KEY (userId, permissionId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS access_audit_logs (
      id TEXT PRIMARY KEY,
      actorId TEXT NOT NULL,
      targetUserId TEXT NOT NULL,
      action TEXT NOT NULL,
      permissionKey TEXT,
      oldValue TEXT,
      newValue TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      invoiceNo TEXT UNIQUE NOT NULL,
      vendorInvoiceNo TEXT UNIQUE NOT NULL,
      customerId TEXT NOT NULL,
      orderDate TEXT NOT NULL,
      jenisOrder TEXT NOT NULL DEFAULT 'aqiqah',
      atasNama TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting_review',
      quotationPrice REAL,
      approvedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_details (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      parentName TEXT NOT NULL,
      childName TEXT NOT NULL,
      recipientName TEXT NOT NULL,
      address TEXT NOT NULL,
      deliveryDate TEXT NOT NULL,
      deliveryTime TEXT NOT NULL,
      phone TEXT NOT NULL,
      driverInfo TEXT,
      driverFee REAL DEFAULT 0,
      animalOrder TEXT NOT NULL,
      kandangNote TEXT,
      dapurAMasakan TEXT,
      dapurANasiBox TEXT,
      dapurANote TEXT,
      dapurRMasakan TEXT,
      dapurRNasiBox TEXT,
      dapurRNote TEXT,
      pesananLainnya TEXT,
      pesanKandang TEXT,
      pesanDapurA TEXT,
      pesanDapurR TEXT,
      pesanDriver TEXT,
      uangSakuDriver REAL DEFAULT 0,
      paymentStatus TEXT NOT NULL DEFAULT 'dp',
      totalPelunasan REAL NOT NULL DEFAULT 0,
      totalBayar REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      animalOrder TEXT NOT NULL,
      kandangNote TEXT,
      dapurAMasakan TEXT,
      dapurANasiBox TEXT,
      dapurANote TEXT,
      dapurRMasakan TEXT,
      dapurRNasiBox TEXT,
      dapurRNote TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      adminId TEXT NOT NULL,
      price REAL NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (adminId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      customerId TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS kandang_orders (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      animalType TEXT NOT NULL,
      animalQty INTEGER NOT NULL,
      slaughterSchedule TEXT NOT NULL,
      notes TEXT,
      prepStatus TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dapur_orders (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      menu TEXT NOT NULL,
      portion TEXT NOT NULL,
      cookingSchedule TEXT NOT NULL,
      notes TEXT,
      kitchenStatus TEXT NOT NULL DEFAULT 'waiting_cook',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_orders (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      status_terkini TEXT NOT NULL DEFAULT 'monitoring',
      monitoring_notes TEXT,
      receivedAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS driver_orders (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      deliveryAddress TEXT NOT NULL,
      contactPerson TEXT NOT NULL,
      deliverySchedule TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'assigned',
      receivedAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
     );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      customerId TEXT NOT NULL,
      paymentType TEXT NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentDate TEXT NOT NULL,
      proof TEXT,
      status TEXT NOT NULL DEFAULT 'waiting_verification',
      verifiedBy TEXT,
      verifiedAt TEXT,
      rejectionReason TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      actionUrl TEXT,
      relatedEntityId TEXT,
      readAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  } catch {}

  // Seed default users & permissions if empty
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userResult = userCountStmt.get() as { count: number };
  if (userResult.count === 0) {
    seedDefaultData();
  }

  // Ensure master_admin role and default users exist even if db already existed
  try {
    const masterRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('master_admin');
    if (!masterRole) {
      const now = new Date().toISOString();
      db.prepare('INSERT INTO roles (id, name, description, isSystemRole, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)').run(
        'role-master-admin',
        'master_admin',
        'Master Administrator (Full System Access)',
        now,
        now
      );
      const allPerms = db.prepare('SELECT id FROM permissions').all() as any[];
      const insertRolePerm = db.prepare('INSERT OR IGNORE INTO role_permissions (roleId, permissionId) VALUES (?, ?)');
      allPerms.forEach(p => {
        insertRolePerm.run('role-master-admin', p.id);
      });
    }

    const defaultUsers = [
      { id: 'usr-master-1', name: 'Master Admin Almeera', email: 'master@almeera.com', phone: '081234567888', role: 'master_admin' },
      { id: 'usr-admin-1', name: 'Admin Almeera', email: 'admin@almeera.com', phone: '081234567891', role: 'admin' },
      { id: 'usr-kandang-1', name: 'Pak Slamet (Kandang)', email: 'kandang@almeera.com', phone: '081234567892', role: 'kandang' },
      { id: 'usr-dapur-1', name: 'Chef Siti (Dapur)', email: 'dapur@almeera.com', phone: '081234567893', role: 'dapur' },
      { id: 'usr-driver-1', name: 'Joko (Driver)', email: 'driver@almeera.com', phone: '081234567894', role: 'driver' },
      { id: 'usr-customer-1', name: 'Budi Santoso', email: 'customer@almeera.com', phone: '081234567890', role: 'customer' },
    ];

    const now = new Date().toISOString();
    const hashedPassword = hashPassword('password123');
    const checkUser = db.prepare('SELECT id FROM users WHERE email = ?');
    const insertDefUser = db.prepare(`
      INSERT INTO users (id, name, email, password, phone, role, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `);

    defaultUsers.forEach(u => {
      const existing = checkUser.get(u.email);
      if (!existing) {
        insertDefUser.run(u.id, u.name, u.email, hashedPassword, u.phone, u.role, now, now);
      }
    });
  } catch {}
}

function seedDefaultData() {
  const now = new Date().toISOString();
  const hashedPassword = hashPassword('password123');

  // 1. Seed Permissions
  const permissionsList = [
    { key: 'orders.view', name: 'View Orders', module: 'Orders' },
    { key: 'orders.create', name: 'Create Orders', module: 'Orders' },
    { key: 'orders.edit', name: 'Edit Orders', module: 'Orders' },
    { key: 'orders.delete', name: 'Delete Orders', module: 'Orders' },
    { key: 'orders.approve', name: 'Approve Orders', module: 'Orders' },

    { key: 'quotations.view', name: 'View Quotation', module: 'Quotation' },
    { key: 'quotations.create', name: 'Create Quotation', module: 'Quotation' },
    { key: 'quotations.edit', name: 'Edit Quotation', module: 'Quotation' },
    { key: 'quotations.approve', name: 'Approve Quotation', module: 'Quotation' },
    { key: 'quotations.reject', name: 'Reject Quotation', module: 'Quotation' },

    { key: 'kandang.view', name: 'View Kandang Orders', module: 'Kandang' },
    { key: 'kandang.edit', name: 'Edit Kandang Orders', module: 'Kandang' },
    { key: 'kandang.update_status', name: 'Update Kandang Status', module: 'Kandang' },

    { key: 'dapur.view', name: 'View Dapur Orders', module: 'Dapur' },
    { key: 'dapur.edit', name: 'Edit Dapur Orders', module: 'Dapur' },
    { key: 'dapur.update_status', name: 'Update Dapur Status', module: 'Dapur' },

    { key: 'driver.view', name: 'View Delivery Orders', module: 'Driver' },
    { key: 'driver.assign', name: 'Assign Driver', module: 'Driver' },
    { key: 'driver.update_status', name: 'Update Delivery Status', module: 'Driver' },

    { key: 'po.view', name: 'View PO', module: 'Purchase Order' },
    { key: 'po.create', name: 'Generate PO', module: 'Purchase Order' },
    { key: 'po.print', name: 'Print PO', module: 'Purchase Order' },
    { key: 'po.kandang.view', name: 'View PO Kandang', module: 'Purchase Order' },
    { key: 'po.kandang.print', name: 'Print PO Kandang', module: 'Purchase Order' },
    { key: 'po.dapur_a.view', name: 'View PO Dapur A', module: 'Purchase Order' },
    { key: 'po.dapur_a.print', name: 'Print PO Dapur A', module: 'Purchase Order' },
    { key: 'po.dapur_r.view', name: 'View PO Dapur R', module: 'Purchase Order' },
    { key: 'po.dapur_r.print', name: 'Print PO Dapur R', module: 'Purchase Order' },
    { key: 'po.driver.view', name: 'View PO Driver', module: 'Purchase Order' },
    { key: 'po.driver.print', name: 'Print PO Driver', module: 'Purchase Order' },

    { key: 'customers.view', name: 'View Customers', module: 'User Management' },
    { key: 'customers.edit', name: 'Edit Customers', module: 'User Management' },
    { key: 'staff.view', name: 'View Staff', module: 'User Management' },
    { key: 'staff.create', name: 'Create Staff', module: 'User Management' },
    { key: 'staff.edit', name: 'Edit Staff', module: 'User Management' },
    { key: 'staff.deactivate', name: 'Deactivate Staff', module: 'User Management' },

    { key: 'roles.view', name: 'View Roles', module: 'Role Management' },
    { key: 'roles.edit', name: 'Edit Roles & Permissions', module: 'Role Management' },

    { key: 'reports.view', name: 'View Reports', module: 'Reports' },
    { key: 'reports.export', name: 'Export Reports', module: 'Reports' },
  ];

  const insertPerm = db.prepare('INSERT INTO permissions (id, key, name, module, createdAt) VALUES (?, ?, ?, ?, ?)');
  permissionsList.forEach((p, idx) => {
    insertPerm.run(`perm-${idx + 1}`, p.key, p.name, p.module, now);
  });

  // 2. Seed Roles
  const rolesList = [
    { id: 'role-master-admin', name: 'master_admin', desc: 'Master Administrator (Full System Access)' },
    { id: 'role-admin', name: 'admin', desc: 'Administrator Sistem (Customizable Permissions)' },
    { id: 'role-kandang', name: 'kandang', desc: 'Petugas Kandang & Sembelih' },
    { id: 'role-dapur', name: 'dapur', desc: 'Petugas Dapur A & R' },
    { id: 'role-driver', name: 'driver', desc: 'Kurir Pengantaran' },
    { id: 'role-customer', name: 'customer', desc: 'Shohibul Qurban / Customer' },
  ];

  const insertRole = db.prepare('INSERT INTO roles (id, name, description, isSystemRole, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)');
  rolesList.forEach(r => {
    insertRole.run(r.id, r.name, r.desc, now, now);
  });

  // Map default permissions to roles
  const allPerms = db.prepare('SELECT id, key FROM permissions').all() as any[];
  const insertRolePerm = db.prepare('INSERT INTO role_permissions (roleId, permissionId) VALUES (?, ?)');

  allPerms.forEach(p => {
    // Master Admin gets everything
    insertRolePerm.run('role-master-admin', p.id);

    // Admin gets operational permissions (everything except roles.* and access.*)
    if (!p.key.startsWith('roles.') && !p.key.startsWith('access.')) {
      insertRolePerm.run('role-admin', p.id);
    }

    // Kandang gets kandang & po.kandang
    if (p.key.startsWith('kandang.') || p.key.startsWith('po.kandang.') || p.key === 'orders.view') {
      insertRolePerm.run('role-kandang', p.id);
    }
    // Dapur gets dapur & po.dapur
    if (p.key.startsWith('dapur.') || p.key.startsWith('po.dapur_') || p.key === 'orders.view') {
      insertRolePerm.run('role-dapur', p.id);
    }
    // Driver gets driver & po.driver
    if (p.key.startsWith('driver.') || p.key.startsWith('po.driver.') || p.key === 'orders.view') {
      insertRolePerm.run('role-driver', p.id);
    }
    // Customer gets orders.create, orders.view
    if (['orders.create', 'orders.view', 'quotations.view', 'quotations.approve', 'quotations.reject'].includes(p.key)) {
      insertRolePerm.run('role-customer', p.id);
    }
  });

  // 3. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, phone, role, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  const customerId = 'usr-customer-1';
  const masterAdminId = 'usr-master-1';
  const adminId = 'usr-admin-1';
  const kandangId = 'usr-kandang-1';
  const dapurId = 'usr-dapur-1';
  const driverId = 'usr-driver-1';

  insertUser.run(customerId, 'Budi Santoso', 'customer@almeera.com', hashedPassword, '081234567890', 'customer', now, now);
  insertUser.run(masterAdminId, 'Master Admin Almeera', 'master@almeera.com', hashedPassword, '081234567888', 'master_admin', now, now);
  insertUser.run(adminId, 'Admin Almeera', 'admin@almeera.com', hashedPassword, '081234567891', 'admin', now, now);
  insertUser.run(kandangId, 'Pak Slamet (Kandang)', 'kandang@almeera.com', hashedPassword, '081234567892', 'kandang', now, now);
  insertUser.run(dapurId, 'Chef Siti (Dapur)', 'dapur@almeera.com', hashedPassword, '081234567893', 'dapur', now, now);
  insertUser.run(driverId, 'Joko (Driver)', 'driver@almeera.com', hashedPassword, '081234567894', 'driver', now, now);

  // Seed sample orders across different statuses
  const statuses = [
    'waiting_review',
    'quotation_sent',
    'quotation_approved',
    'preparing',
    'slaughtering',
    'cooking',
    'packaging',
    'delivery',
    'completed'
  ];

  statuses.forEach((status, idx) => {
    const orderId = `ord-${idx + 1}`;
    const invoiceNo = `INV-MGR-2026-${String(idx + 1).padStart(3, '0')}`;
    const vendorInvoiceNo = `INV-20260725-${String(idx + 1).padStart(4, '0')}`;
    const atasNama = `Ananda Anak Ke-${idx + 1} Budi`;
    const price = 2500000 + idx * 250000;

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, invoiceNo, vendorInvoiceNo, customerId, orderDate, jenisOrder, atasNama, status, quotationPrice, approvedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertOrder.run(
      orderId,
      invoiceNo,
      vendorInvoiceNo,
      customerId,
      now,
      'aqiqah',
      atasNama,
      status,
      price,
      status !== 'waiting_review' && status !== 'quotation_sent' ? now : null,
      now,
      now
    );

    const insertDetail = db.prepare(`
      INSERT INTO order_details (
        id, orderId, parentName, childName, recipientName, address, deliveryDate, deliveryTime, phone, driverInfo, driverFee,
        animalOrder, kandangNote, dapurAMasakan, dapurANasiBox, dapurANote, dapurRMasakan, dapurRNasiBox, dapurRNote,
        paymentStatus, totalPelunasan, totalBayar, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertDetail.run(
      `det-${idx + 1}`,
      orderId,
      'Budi Santoso & Ani',
      atasNama,
      'Budi Santoso',
      'Jl. Flores No. 28, Cilacap Tengah',
      '2026-07-25',
      '09:00 WIB',
      '081234567890',
      'Joko (Avanza Hitam R 1234 AB)',
      50000,
      '1 Ekor Kambing Jantan Super',
      'Kambing sehat, umur cukup',
      'Gulai Kambing 100 porsi',
      'Nasi Box 100 porsi',
      'Sedang',
      'Sate Kambing 100 tusuk',
      'Kerupuk & Buah',
      'Manis sedang',
      idx % 2 === 0 ? 'lunas' : 'dp',
      price,
      idx % 2 === 0 ? price : price / 2,
      now
    );

    if (status !== 'waiting_review' && status !== 'quotation_sent') {
      const insertQuotation = db.prepare(`
        INSERT INTO quotations (id, orderId, adminId, price, note, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)
      `);
      insertQuotation.run(`quo-${idx + 1}`, orderId, adminId, price, 'Penawaran resmi Aqiqah Almeera Cilacap', now, now);

      const insertKandang = db.prepare(`
        INSERT INTO kandang_orders (id, orderId, animalType, animalQty, slaughterSchedule, notes, prepStatus, createdAt)
        VALUES (?, ?, ?, 1, ?, ?, 'pending', ?)
      `);
      insertKandang.run(`kan-${idx + 1}`, orderId, 'Kambing Jantan Super', '2026-07-25 06:00 WIB', 'Siap sembelih', status === 'preparing' ? 'ready' : 'slaughtered', now);

      const insertDapur = db.prepare(`
        INSERT INTO dapur_orders (id, orderId, menu, portion, cookingSchedule, notes, kitchenStatus, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 'waiting_cook', ?)
      `);
      insertDapur.run(`dap-${idx + 1}`, orderId, 'Gulai & Sate + Nasi Box', '100 porsi', '2026-07-25 07:30 WIB', 'Bumbu rempah spesial', status === 'cooking' ? 'cooking' : 'packed', now);

      const insertAdminOrd = db.prepare(`
        INSERT INTO admin_orders (id, orderId, status_terkini, monitoring_notes, receivedAt)
        VALUES (?, ?, 'monitoring', 'Distribusi otomatis sukses', ?)
      `);
      insertAdminOrd.run(`adm-ord-${idx + 1}`, orderId, now);

      const insertDriver = db.prepare(`
        INSERT INTO driver_orders (id, orderId, deliveryAddress, contactPerson, deliverySchedule, status, receivedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertDriver.run(`drv-${idx + 1}`, orderId, 'Jl. Flores No. 28, Cilacap', 'Budi Santoso', '2026-07-25 09:00 WIB', status === 'delivery' ? 'on_delivery' : status === 'completed' ? 'delivered' : 'assigned', now);
    } else if (status === 'quotation_sent') {
      const insertQuotation = db.prepare(`
        INSERT INTO quotations (id, orderId, adminId, price, note, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `);
      insertQuotation.run(`quo-${idx + 1}`, orderId, adminId, price, 'Menunggu persetujuan shohibul qurban', now, now);
    }
  });
}

export { db };
