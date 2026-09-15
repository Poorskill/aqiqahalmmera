import alasql from 'alasql';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const dataDir = isServerless ? '/tmp' : path.join(process.cwd(), 'data');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch {}

const dbPath = path.join(dataDir, 'aqiqah_store.json');

function persistDb() {
  try {
    const dbObj = (alasql as any).databases?.alasql;
    if (!dbObj || !dbObj.tables) return;
    const dump: Record<string, any[]> = {};
    for (const tableName of Object.keys(dbObj.tables)) {
      dump[tableName] = dbObj.tables[tableName].data || [];
    }
    fs.writeFileSync(dbPath, JSON.stringify(dump));
  } catch {}
}

function restoreDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const dump = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      const dbObj = (alasql as any).databases?.alasql;
      if (dbObj && dbObj.tables) {
        for (const tableName of Object.keys(dump)) {
          if (dbObj.tables[tableName]) {
            dbObj.tables[tableName].data = dump[tableName];
          }
        }
      }
    }
  } catch {}
}

function parseInsertOrReplace(sql: string): { table: string; firstCol: string } | null {
  const m = sql.match(/^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
  if (!m) return null;
  return { table: m[1], firstCol: m[2].split(',')[0].trim() };
}

function sanitize(sql: string): string {
  return sql
    .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO')
    .replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'INSERT INTO')
    .replace(/\bAS\s+count\b/gi, 'AS [count]')
    .replace(/PRAGMA\s+[^;]+;?/gi, '')
    .replace(/AUTOINCREMENT/gi, '')
    .replace(/COLLATE\s+\w+/gi, '');
}

const db = {
  exec(sql: string) {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const s of statements) {
      if (/^\s*(BEGIN|COMMIT|ROLLBACK|PRAGMA)/i.test(s)) continue;
      try {
        alasql(sanitize(s));
      } catch {}
    }
    persistDb();
  },
  prepare(sql: string) {
    if (/^\s*(BEGIN|COMMIT|ROLLBACK|PRAGMA)/i.test(sql)) {
      return {
        get: () => undefined,
        all: () => [],
        run: () => ({ changes: 0, lastInsertRowid: 0 })
      };
    }
    const replaceInfo = parseInsertOrReplace(sql);
    const cleanSql = sanitize(sql);
    return {
      get(...params: any[]) {
        try {
          const res = alasql(cleanSql, params);
          if (Array.isArray(res)) {
            return res.length > 0 ? res[0] : undefined;
          }
          return res || undefined;
        } catch {
          return undefined;
        }
      },
      all(...params: any[]) {
        try {
          const res = alasql(cleanSql, params);
          return Array.isArray(res) ? res : (res ? [res] : []);
        } catch {
          return [];
        }
      },
      run(...params: any[]) {
        try {
          if (replaceInfo) {
            try { alasql(`DELETE FROM ${replaceInfo.table} WHERE ${replaceInfo.firstCol} = ?`, [params[0]]); } catch {}
          }
          const res = alasql(cleanSql, params);
          persistDb();
          return { changes: Array.isArray(res) ? res.length : 1, lastInsertRowid: 0 };
        } catch {
          return { changes: 0, lastInsertRowid: 0 };
        }
      }
    };
  }
};

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

let isInitialized = false;

// Initialize tables
export function initDb() {
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  if (isInitialized) return;
  isInitialized = true;

  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id STRING PRIMARY KEY,
      name STRING NOT NULL,
      email STRING UNIQUE NOT NULL,
      password STRING NOT NULL,
      phone STRING NOT NULL,
      role STRING NOT NULL DEFAULT 'customer',
      status STRING NOT NULL DEFAULT 'active',
      province STRING,
      city STRING,
      district STRING,
      village STRING,
      address STRING,
      postalCode STRING,
      notes STRING,
      profileImageUrl STRING,
      createdAt STRING NOT NULL,
      updatedAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id STRING PRIMARY KEY,
      name STRING UNIQUE NOT NULL,
      description STRING,
      isSystemRole INT DEFAULT 1,
      createdAt STRING NOT NULL,
      updatedAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id STRING PRIMARY KEY,
      key STRING UNIQUE NOT NULL,
      name STRING NOT NULL,
      module STRING NOT NULL,
      description STRING,
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      roleId STRING NOT NULL,
      permissionId STRING NOT NULL,
      PRIMARY KEY (roleId, permissionId)
    );

    CREATE TABLE IF NOT EXISTS user_permissions (
      userId STRING NOT NULL,
      permissionId STRING NOT NULL,
      effect STRING NOT NULL DEFAULT 'allow',
      PRIMARY KEY (userId, permissionId)
    );

    CREATE TABLE IF NOT EXISTS access_audit_logs (
      id STRING PRIMARY KEY,
      actorId STRING NOT NULL,
      targetUserId STRING NOT NULL,
      action STRING NOT NULL,
      permissionKey STRING,
      oldValue STRING,
      newValue STRING,
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id STRING PRIMARY KEY,
      invoiceNo STRING UNIQUE NOT NULL,
      vendorInvoiceNo STRING UNIQUE NOT NULL,
      customerId STRING NOT NULL,
      orderDate STRING NOT NULL,
      jenisOrder STRING NOT NULL DEFAULT 'aqiqah',
      atasNama STRING NOT NULL,
      status STRING NOT NULL DEFAULT 'waiting_review',
      quotationPrice NUMERIC,
      approvedAt STRING,
      createdAt STRING NOT NULL,
      updatedAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_details (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      parentName STRING NOT NULL,
      childName STRING NOT NULL,
      recipientName STRING NOT NULL,
      address STRING NOT NULL,
      deliveryDate STRING NOT NULL,
      deliveryTime STRING NOT NULL,
      phone STRING NOT NULL,
      driverInfo STRING,
      driverFee NUMERIC DEFAULT 0,
      animalOrder STRING NOT NULL,
      kandangNote STRING,
      dapurAMasakan STRING,
      dapurANasiBox STRING,
      dapurANote STRING,
      dapurRMasakan STRING,
      dapurRNasiBox STRING,
      dapurRNote STRING,
      fatherName STRING,
      motherName STRING,
      pesananLainnya STRING,
      pesanKandang STRING,
      pesanDapurA STRING,
      pesanDapurR STRING,
      pesanDriver STRING,
      uangSakuDriver NUMERIC DEFAULT 0,
      paymentStatus STRING NOT NULL DEFAULT 'dp',
      totalPelunasan NUMERIC NOT NULL DEFAULT 0,
      totalBayar NUMERIC NOT NULL DEFAULT 0,
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id STRING PRIMARY KEY,
      orderId STRING NOT NULL,
      animalOrder STRING NOT NULL,
      kandangNote STRING,
      dapurAMasakan STRING,
      dapurANasiBox STRING,
      dapurANote STRING,
      dapurRMasakan STRING,
      dapurRNasiBox STRING,
      dapurRNote STRING,
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      adminId STRING NOT NULL,
      price NUMERIC NOT NULL,
      note STRING,
      status STRING NOT NULL DEFAULT 'pending',
      createdAt STRING NOT NULL,
      updatedAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      customerId STRING NOT NULL,
      rating INT NOT NULL,
      comment STRING NOT NULL,
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kandang_orders (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      animalType STRING NOT NULL,
      animalQty INT NOT NULL,
      slaughterSchedule STRING NOT NULL,
      notes STRING,
      prepStatus STRING NOT NULL DEFAULT 'pending',
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dapur_orders (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      menu STRING NOT NULL,
      portion STRING NOT NULL,
      cookingSchedule STRING NOT NULL,
      notes STRING,
      kitchenStatus STRING NOT NULL DEFAULT 'waiting_cook',
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_orders (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      status_terkini STRING NOT NULL DEFAULT 'monitoring',
      monitoring_notes STRING,
      receivedAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS driver_orders (
      id STRING PRIMARY KEY,
      orderId STRING UNIQUE NOT NULL,
      driverId STRING,
      deliveryAddress STRING NOT NULL,
      contactPerson STRING NOT NULL,
      deliverySchedule STRING NOT NULL,
      status STRING NOT NULL DEFAULT 'assigned',
      arrivedAt STRING,
      deliveredAt STRING,
      deliveryProof STRING,
      deliveryNote STRING,
      receivedAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id STRING PRIMARY KEY,
      orderId STRING NOT NULL,
      customerId STRING NOT NULL,
      paymentType STRING NOT NULL,
      amount NUMERIC NOT NULL,
      paymentMethod STRING NOT NULL,
      paymentDate STRING NOT NULL,
      proof STRING,
      status STRING NOT NULL DEFAULT 'waiting_verification',
      verifiedBy STRING,
      verifiedAt STRING,
      rejectionReason STRING,
      notes STRING,
      createdAt STRING NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id STRING PRIMARY KEY,
      userId STRING NOT NULL,
      category STRING NOT NULL,
      title STRING NOT NULL,
      message STRING NOT NULL,
      priority STRING NOT NULL DEFAULT 'medium',
      actionUrl STRING,
      relatedEntityId STRING,
      readAt STRING,
      createdAt STRING NOT NULL
    );
    `);
  } catch {}

  // Restore persisted data if available
  restoreDb();

  // Check if users exist; if not, seed default data
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userResult = userCountStmt.get() as { count: number } | undefined;
  if (!userResult || !userResult.count || userResult.count === 0) {
    seedDefaultUsers();
  }
}

function seedDefaultUsers() {
  const now = new Date().toISOString();
  const hashedPassword = hashPassword('password123');
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, phone, role, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);
  insertUser.run('usr-customer-1', 'Budi Santoso', 'customer@almeera.com', hashedPassword, '081234567890', 'customer', now, now);
  insertUser.run('usr-master-1', 'Master Admin Almeera', 'master@almeera.com', hashedPassword, '081234567888', 'master_admin', now, now);
  insertUser.run('usr-admin-1', 'Admin Almeera', 'admin@almeera.com', hashedPassword, '081234567891', 'admin', now, now);
  insertUser.run('usr-kandang-1', 'Pak Slamet (Kandang)', 'kandang@almeera.com', hashedPassword, '081234567892', 'kandang', now, now);
  insertUser.run('usr-dapur-1', 'Chef Siti (Dapur)', 'dapur@almeera.com', hashedPassword, '081234567893', 'dapur', now, now);
  insertUser.run('usr-driver-1', 'Joko (Driver)', 'driver@almeera.com', hashedPassword, '081234567894', 'driver', now, now);
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
    insertRolePerm.run('role-master-admin', p.id);
    if (!p.key.startsWith('roles.') && !p.key.startsWith('access.')) {
      insertRolePerm.run('role-admin', p.id);
    }
    if (p.key.startsWith('kandang.') || p.key.startsWith('po.kandang.') || p.key === 'orders.view') {
      insertRolePerm.run('role-kandang', p.id);
    }
    if (p.key.startsWith('dapur.') || p.key.startsWith('po.dapur_') || p.key === 'orders.view') {
      insertRolePerm.run('role-dapur', p.id);
    }
    if (p.key.startsWith('driver.') || p.key.startsWith('po.driver.') || p.key === 'orders.view') {
      insertRolePerm.run('role-driver', p.id);
    }
    if (['orders.create', 'orders.view', 'quotations.view', 'quotations.approve', 'quotations.reject'].includes(p.key)) {
      insertRolePerm.run('role-customer', p.id);
    }
  });

  // 3. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, phone, role, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  insertUser.run('usr-customer-1', 'Budi Santoso', 'customer@almeera.com', hashedPassword, '081234567890', 'customer', now, now);
  insertUser.run('usr-master-1', 'Master Admin Almeera', 'master@almeera.com', hashedPassword, '081234567888', 'master_admin', now, now);
  insertUser.run('usr-admin-1', 'Admin Almeera', 'admin@almeera.com', hashedPassword, '081234567891', 'admin', now, now);
  insertUser.run('usr-kandang-1', 'Pak Slamet (Kandang)', 'kandang@almeera.com', hashedPassword, '081234567892', 'kandang', now, now);
  insertUser.run('usr-dapur-1', 'Chef Siti (Dapur)', 'dapur@almeera.com', hashedPassword, '081234567893', 'dapur', now, now);
  insertUser.run('usr-driver-1', 'Joko (Driver)', 'driver@almeera.com', hashedPassword, '081234567894', 'driver', now, now);

  // 4. Seed sample orders
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
      'usr-customer-1',
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
        fatherName, motherName, pesananLainnya, pesanKandang, pesanDapurA, pesanDapurR, pesanDriver, uangSakuDriver,
        paymentStatus, totalPelunasan, totalBayar, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      'Budi Santoso',
      'Ani',
      'Bonus kalender & sertifikat aqiqah',
      'Pastikan tanduk utuh',
      'Rempah sedang',
      'Kemasan rapi',
      'Kirim tepat waktu jam 9 pagi',
      50000,
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
      insertQuotation.run(`quo-${idx + 1}`, orderId, 'usr-admin-1', price, 'Penawaran resmi Aqiqah Almeera Cilacap', now, now);

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
        INSERT INTO driver_orders (id, orderId, driverId, deliveryAddress, contactPerson, deliverySchedule, status, receivedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertDriver.run(`drv-${idx + 1}`, orderId, 'usr-driver-1', 'Jl. Flores No. 28, Cilacap', 'Budi Santoso', '2026-07-25 09:00 WIB', status === 'delivery' ? 'on_delivery' : status === 'completed' ? 'delivered' : 'assigned', now);
    } else if (status === 'quotation_sent') {
      const insertQuotation = db.prepare(`
        INSERT INTO quotations (id, orderId, adminId, price, note, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `);
      insertQuotation.run(`quo-${idx + 1}`, orderId, 'usr-admin-1', price, 'Menunggu persetujuan shohibul qurban', now, now);
    }
  });

  persistDb();
}

export { db };
