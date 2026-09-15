import { getPostgresPool } from '../src/lib/postgres.ts';

const tables = [
  'users',
  'roles',
  'permissions',
  'role_permissions',
  'user_permissions',
  'access_audit_logs',
  'orders',
  'order_details',
  'order_items',
  'quotations',
  'reviews',
  'kandang_orders',
  'dapur_orders',
  'admin_orders',
  'driver_orders',
  'payments',
  'notifications',
  'audit_logs',
];

const pool = getPostgresPool();
const client = await pool.connect();

try {
  await client.query('BEGIN');
  for (const table of tables) {
    await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
  }
  await client.query('COMMIT');
  console.log('RLS berhasil diaktifkan untuk seluruh tabel publik.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
