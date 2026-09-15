import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';

// Return dates/timestamps as plain string to prevent React Error #31
types.setTypeParser(1082, (val: string) => val);
types.setTypeParser(1114, (val: string) => val);
types.setTypeParser(1184, (val: string) => val);

let pool: Pool | null = null;

export function isPostgresConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPostgresPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum dikonfigurasi. Backend lama tetap digunakan.');
  }
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  return pool;
}

export async function queryPostgres<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) {
  return getPostgresPool().query<T>(text, values);
}

export async function withPostgresTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPostgresPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
