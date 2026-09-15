import { queryPostgres } from './postgres';

export async function getPostgresOperationalCalendar() {
  const result = await queryPostgres(`
    SELECT o.id, o.vendor_invoice_no, o.atas_nama, o.status, o.jenis_order,
           od.delivery_date, od.delivery_time, od.recipient_name, od.address,
           k.animal_type, k.animal_qty, k.slaughter_schedule, k.prep_status,
           d.menu, d.portion, d.cooking_schedule, d.kitchen_status,
           drv.delivery_schedule, drv.status as driver_status
    FROM orders o
    LEFT JOIN order_details od ON o.id = od.order_id
    LEFT JOIN kandang_orders k ON o.id = k.order_id
    LEFT JOIN dapur_orders d ON o.id = d.order_id
    LEFT JOIN driver_orders drv ON o.id = drv.order_id
    WHERE o.status NOT IN ('cancelled', 'completed')
    ORDER BY od.delivery_date ASC
  `);
  return result.rows.map((row: any) => ({
    id: row.id, vendorInvoiceNo: row.vendor_invoice_no, atasNama: row.atas_nama, status: row.status, jenisOrder: row.jenis_order,
    deliveryDate: row.delivery_date, deliveryTime: row.delivery_time, recipientName: row.recipient_name, address: row.address,
    animalType: row.animal_type, animalQty: row.animal_qty, slaughterSchedule: row.slaughter_schedule, prepStatus: row.prep_status,
    menu: row.menu, portion: row.portion, cookingSchedule: row.cooking_schedule, kitchenStatus: row.kitchen_status,
    deliverySchedule: row.delivery_schedule, driverStatus: row.driver_status
  }));
}

export async function getPostgresAllRoles() {
  const result = await queryPostgres('SELECT * FROM roles ORDER BY name ASC');
  return result.rows.map((r: any) => ({ id: r.id, name: r.name, description: r.description, isSystemRole: r.is_system_role }));
}

export async function getPostgresRoleById(roleId: string) {
  const result = await queryPostgres('SELECT * FROM roles WHERE id=$1', [roleId]);
  return result.rows[0] ? { id: result.rows[0].id, name: result.rows[0].name, description: result.rows[0].description } : null;
}

export async function getPostgresAllPermissions() {
  const result = await queryPostgres('SELECT * FROM permissions ORDER BY module, key');
  return result.rows.map((p: any) => ({ id: p.id, key: p.key, name: p.name, module: p.module, description: p.description }));
}

export async function getPostgresRolePermissionKeys(roleName: string): Promise<string[]> {
  const result = await queryPostgres<{ key: string }>(`
    SELECT p.key FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN roles r ON r.id = rp.role_id
    WHERE r.name = $1
  `, [roleName]);
  return result.rows.map(r => r.key);
}
