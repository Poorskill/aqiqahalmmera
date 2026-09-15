import { queryPostgres } from './postgres';

export async function getPostgresAuditLogs(filters?: { action?: string; search?: string }) {
  let query = `
    SELECT al.id, al.actor_id, al.target_user_id, al.action, al.permission_key, al.old_value, al.new_value, al.created_at,
           u.name as actor_name, u.email as actor_email, u.role as actor_role
    FROM access_audit_logs al
    LEFT JOIN users u ON al.actor_id = u.id
    WHERE 1=1
  `;
  const params: string[] = [];
  if (filters?.action) {
    params.push(filters.action);
    query += ` AND al.action = $${params.length}`;
  }
  if (filters?.search) {
    params.push(`%${filters.search}%`);
    const idx = params.length;
    query += ` AND (al.action ILIKE $${idx} OR al.permission_key ILIKE $${idx} OR al.old_value ILIKE $${idx} OR al.new_value ILIKE $${idx})`;
  }
  query += ' ORDER BY al.created_at DESC LIMIT 100';
  const logsRes = await queryPostgres(query, params);
  const actionsRes = await queryPostgres<{ action: string }>('SELECT DISTINCT action FROM access_audit_logs ORDER BY action ASC');
  return {
    logs: logsRes.rows.map((al: any) => ({
      ...al,
      actorId: al.actor_id,
      targetUserId: al.target_user_id,
      permissionKey: al.permission_key,
      oldValue: al.old_value,
      newValue: al.new_value,
      createdAt: al.created_at,
      actorName: al.actor_name,
      actorEmail: al.actor_email,
      actorRole: al.actor_role,
    })),
    actionsList: actionsRes.rows,
  };
}
