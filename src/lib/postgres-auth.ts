import { hashPassword } from './db';
import { queryPostgres, withPostgresTransaction } from './postgres';
import type { User } from './services';

function mapUser(row: Record<string, unknown>): User & { password: string } {
  return {
    id: String(row.id), name: String(row.name), email: String(row.email), password: String(row.password), role: String(row.role), phone: String(row.phone),
    status: row.status ? String(row.status) : undefined, profileImageUrl: row.profile_image_url ? String(row.profile_image_url) : undefined,
    province: row.province ? String(row.province) : undefined, city: row.city ? String(row.city) : undefined, district: row.district ? String(row.district) : undefined,
    village: row.village ? String(row.village) : undefined, address: row.address ? String(row.address) : undefined, postalCode: row.postal_code ? String(row.postal_code) : undefined,
    notes: row.notes ? String(row.notes) : undefined, createdAt: String(row.created_at), updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function getPostgresUserById(id: string) {
  const result = await queryPostgres('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function getPostgresUserByEmail(email: string) {
  const result = await queryPostgres('SELECT * FROM users WHERE lower(email) = lower($1)', [email.trim()]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createPostgresUser(data: { name: string; email: string; password: string; phone: string; role?: string }) {
  const id = `usr-${crypto.randomUUID()}`;
  const now = new Date();
  const password = hashPassword(data.password);
  await withPostgresTransaction(async client => {
    await client.query(
      `INSERT INTO users (id, name, email, password, phone, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $7)`,
      [id, data.name.trim(), data.email.trim().toLowerCase(), password, data.phone.trim(), data.role || 'customer', now],
    );
  });
  return getPostgresUserById(id);
}
