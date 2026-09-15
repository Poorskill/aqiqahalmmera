import { queryPostgres, withPostgresTransaction } from './postgres';

export async function updatePostgresProfile(userId: string, data: { name: string; phone: string; profileImageUrl?: string; province?: string; city?: string; district?: string; village?: string; address?: string; postalCode?: string; notes?: string }) {
  const now = new Date();
  await queryPostgres(
    `UPDATE users SET name=$1, phone=$2, profile_image_url=COALESCE($3, profile_image_url), province=$4, city=$5, district=$6, village=$7, address=$8, postal_code=$9, notes=$10, updated_at=$11 WHERE id=$12 AND role='customer'`,
    [data.name, data.phone, data.profileImageUrl || null, data.province || null, data.city || null, data.district || null, data.village || null, data.address || null, data.postalCode || null, data.notes || null, now, userId],
  );
}

export async function updatePostgresStaffRoleStatus(userId: string, role: string, status: string, actorId: string) {
  return withPostgresTransaction(async client => {
    const prev = await client.query<{ role: string; status: string }>('SELECT role, status FROM users WHERE id=$1', [userId]);
    const now = new Date();
    await client.query('UPDATE users SET role=$1, status=$2, updated_at=$3 WHERE id=$4', [role, status, now, userId]);
    await client.query('INSERT INTO access_audit_logs (id, actor_id, target_user_id, action, old_value, new_value, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [`log-${crypto.randomUUID()}`, actorId, userId, 'UPDATE_USER_ROLE_STATUS', `role:${prev.rows[0]?.role}, status:${prev.rows[0]?.status}`, `role:${role}, status:${status}`, now]);
  });
}

export async function deletePostgresStaff(userId: string, actorId: string) {
  return withPostgresTransaction(async client => {
    const staff = await client.query<{ role: string; email: string }>('SELECT role, email FROM users WHERE id=$1', [userId]);
    if (!staff.rowCount) throw new Error('Staff tidak ditemukan.');
    if (staff.rows[0].role === 'master_admin') throw new Error('Akun Master Admin utama tidak dapat dihapus.');
    await client.query('DELETE FROM user_permissions WHERE user_id=$1', [userId]);
    await client.query('DELETE FROM users WHERE id=$1', [userId]);
    await client.query('INSERT INTO access_audit_logs (id, actor_id, target_user_id, action, old_value, new_value, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [`log-${crypto.randomUUID()}`, actorId, userId, 'DELETE_STAFF', `email:${staff.rows[0].email}, role:${staff.rows[0].role}`, 'DELETED', new Date()]);
  });
}

export async function getPostgresSlotCapacities(deliveryDate: string, excludeOrderId?: string) {
  const slots = ['07.00 WIB', '08.00 WIB', '09.00 WIB', '10.00 WIB', '11.00 WIB', '12.00 WIB', '13.00 WIB', '14.00 WIB', '15.00 WIB', '16.00 WIB', '17.00 WIB'];
  const result: Record<string, number> = {};
  for (const s of slots) {
    const q = await queryPostgres<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM order_details d JOIN orders o ON o.id=d.order_id WHERE d.delivery_date=$1 AND d.delivery_time=$2 AND o.status<>'cancelled' ${excludeOrderId ? 'AND o.id<>$3' : ''}`,
      excludeOrderId ? [deliveryDate, s, excludeOrderId] : [deliveryDate, s],
    );
    result[s] = Number(q.rows[0]?.count || 0);
  }
  return result;
}
