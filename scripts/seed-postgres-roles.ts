import { getPostgresPool } from '../src/lib/postgres.ts';

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

const rolesList = [
  { id: 'role-master-admin', name: 'master_admin', desc: 'Master Administrator' },
  { id: 'role-admin', name: 'admin', desc: 'Administrator Sistem' },
  { id: 'role-kandang', name: 'kandang', desc: 'Petugas Kandang & Sembelih' },
  { id: 'role-dapur', name: 'dapur', desc: 'Petugas Dapur A & R' },
  { id: 'role-driver', name: 'driver', desc: 'Kurir Pengantaran' },
  { id: 'role-customer', name: 'customer', desc: 'Shohibul Qurban / Customer' },
];

const pool = getPostgresPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const now = new Date();
  for (const r of rolesList) {
    await client.query(
      `INSERT INTO roles (id, name, description, is_system_role, created_at, updated_at)
       VALUES ($1, $2, $3, true, $4, $4)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, updated_at = EXCLUDED.updated_at`,
      [r.id, r.name, r.desc, now],
    );
  }
  for (let i = 0; i < permissionsList.length; i++) {
    const p = permissionsList[i];
    await client.query(
      `INSERT INTO permissions (id, key, name, module, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, module = EXCLUDED.module`,
      [`perm-${i + 1}`, p.key, p.name, p.module, p.name, now],
    );
  }
  const perms = await client.query<{ id: string; key: string }>('SELECT id, key FROM permissions');
  for (const p of perms.rows) {
    await client.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', ['role-master-admin', p.id]);
    if (!p.key.startsWith('roles.')) {
      await client.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', ['role-admin', p.id]);
    }
  }
  await client.query('COMMIT');
  console.log('Roles and permissions seeded successfully.');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
  await pool.end();
}
