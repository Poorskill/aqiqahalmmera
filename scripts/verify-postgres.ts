import { getPostgresPool } from '../src/lib/postgres.ts';

const checks = [
  ['users', 'SELECT COUNT(*)::int AS count FROM users'],
  ['orders', 'SELECT COUNT(*)::int AS count FROM orders'],
  ['quotations', 'SELECT COUNT(*)::int AS count FROM quotations'],
  ['payments', 'SELECT COUNT(*)::int AS count FROM payments'],
  ['notifications', 'SELECT COUNT(*)::int AS count FROM notifications'],
  ['orphan order details', 'SELECT COUNT(*)::int AS count FROM order_details d LEFT JOIN orders o ON o.id = d.order_id WHERE o.id IS NULL'],
  ['orphan payments', 'SELECT COUNT(*)::int AS count FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE o.id IS NULL'],
  ['orphan quotations', 'SELECT COUNT(*)::int AS count FROM quotations q LEFT JOIN orders o ON o.id = q.order_id WHERE o.id IS NULL'],
];

const pool = getPostgresPool();
try {
  for (const [name, sql] of checks) {
    const result = await pool.query<{ count: number }>(sql);
    console.log(`${name}: ${result.rows[0].count}`);
  }
} finally {
  await pool.end();
}
