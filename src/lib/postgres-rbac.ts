import { queryPostgres, withPostgresTransaction } from './postgres';

export async function updatePostgresRolePermissions(roleId: string, permissionKeys: string[], actorId: string) {
  return withPostgresTransaction(async client => {
    const role = await client.query<{ name: string }>('SELECT name FROM roles WHERE id=$1 FOR UPDATE', [roleId]);
    if (!role.rowCount) throw new Error('Role tidak ditemukan.');
    if (role.rows[0].name === 'master_admin') throw new Error('Permission Master Admin tidak dapat diubah.');
    await client.query('DELETE FROM role_permissions WHERE role_id=$1', [roleId]);
    for (const key of permissionKeys) {
      await client.query('INSERT INTO role_permissions (role_id, permission_id) SELECT $1,id FROM permissions WHERE key=$2 ON CONFLICT DO NOTHING', [roleId, key]);
    }
    await client.query('INSERT INTO access_audit_logs (id,actor_id,target_user_id,action,new_value,created_at) VALUES ($1,$2,$3,$4,$5,$6)', [`log-${crypto.randomUUID()}`, actorId, actorId, 'UPDATE_ROLE_PERMISSIONS', permissionKeys.join(','), new Date()]);
  });
}

export async function updatePostgresUserPermissionOverride(userId: string, permissionKey: string, effect: 'allow' | 'deny' | 'none', actorId: string) {
  return withPostgresTransaction(async client => {
    const permission = await client.query<{ id: string }>('SELECT id FROM permissions WHERE key=$1', [permissionKey]);
    if (!permission.rowCount) throw new Error('Permission tidak ditemukan.');
    await client.query('DELETE FROM user_permissions WHERE user_id=$1 AND permission_id=$2', [userId, permission.rows[0].id]);
    if (effect !== 'none') await client.query('INSERT INTO user_permissions (user_id,permission_id,effect) VALUES ($1,$2,$3)', [userId, permission.rows[0].id, effect]);
    await client.query('INSERT INTO access_audit_logs (id,actor_id,target_user_id,action,permission_key,new_value,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [`log-${crypto.randomUUID()}`, actorId, userId, 'USER_PERMISSION_OVERRIDE', permissionKey, effect, new Date()]);
  });
}

export async function getPostgresNotifications(userId: string) {
  const result = await queryPostgres('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

export async function getPostgresUnreadNotificationCount(userId: string) {
  const result = await queryPostgres<{ count: string }>('SELECT COUNT(*)::text AS count FROM notifications WHERE user_id=$1 AND read_at IS NULL', [userId]);
  return Number(result.rows[0]?.count || 0);
}
