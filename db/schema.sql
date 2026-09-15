CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'master_admin', 'kandang', 'dapur', 'driver')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  province TEXT,
  city TEXT,
  district TEXT,
  village TEXT,
  address TEXT,
  postal_code TEXT,
  notes TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  effect TEXT NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow', 'deny')),
  PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS access_audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id),
  target_user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  permission_key TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  vendor_invoice_no TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  order_date TIMESTAMPTZ NOT NULL,
  jenis_order TEXT NOT NULL DEFAULT 'aqiqah',
  atas_nama TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting_review' CHECK (status IN ('waiting_review', 'quotation_sent', 'quotation_approved', 'preparing', 'slaughtering', 'cooking', 'packaging', 'delivery', 'completed', 'cancelled')),
  quotation_price NUMERIC(14,2),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS order_details (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  phone TEXT NOT NULL,
  driver_info TEXT,
  driver_fee NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (driver_fee >= 0),
  animal_order TEXT NOT NULL,
  kandang_note TEXT,
  dapur_a_masakan TEXT,
  dapur_a_nasi_box TEXT,
  dapur_a_note TEXT,
  dapur_r_masakan TEXT,
  dapur_r_nasi_box TEXT,
  dapur_r_note TEXT,
  father_name TEXT,
  mother_name TEXT,
  pesanan_lainnya TEXT,
  pesan_kandang TEXT,
  pesan_dapur_a TEXT,
  pesan_dapur_r TEXT,
  pesan_driver TEXT,
  uang_saku_driver NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (uang_saku_driver >= 0),
  payment_status TEXT NOT NULL DEFAULT 'dp' CHECK (payment_status IN ('lunas', 'dp', 'kurang')),
  total_pelunasan NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_pelunasan >= 0),
  total_bayar NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_bayar >= 0),
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  animal_order TEXT NOT NULL,
  kandang_note TEXT,
  dapur_a_masakan TEXT,
  dapur_a_nasi_box TEXT,
  dapur_a_note TEXT,
  dapur_r_masakan TEXT,
  dapur_r_nasi_box TEXT,
  dapur_r_note TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  admin_id TEXT NOT NULL REFERENCES users(id),
  price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS kandang_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  animal_type TEXT NOT NULL,
  animal_qty INTEGER NOT NULL CHECK (animal_qty > 0),
  slaughter_schedule TEXT NOT NULL,
  notes TEXT,
  prep_status TEXT NOT NULL DEFAULT 'pending' CHECK (prep_status IN ('pending', 'ready', 'slaughtered')),
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS dapur_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  menu TEXT NOT NULL,
  portion TEXT NOT NULL,
  cooking_schedule TEXT NOT NULL,
  notes TEXT,
  kitchen_status TEXT NOT NULL DEFAULT 'waiting_cook' CHECK (kitchen_status IN ('waiting_cook', 'cooking', 'packed')),
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  status_terkini TEXT NOT NULL DEFAULT 'monitoring',
  monitoring_notes TEXT,
  received_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS driver_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id),
  delivery_address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  delivery_schedule TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'on_delivery', 'delivered')),
  arrived_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_proof TEXT,
  delivery_note TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  CHECK (delivered_at IS NULL OR arrived_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  payment_type TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  proof TEXT,
  status TEXT NOT NULL DEFAULT 'waiting_verification' CHECK (status IN ('waiting_verification', 'verified', 'rejected')),
  verified_by TEXT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  CHECK ((status = 'verified' AND verified_by IS NOT NULL AND verified_at IS NOT NULL) OR status <> 'verified')
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  action_url TEXT,
  related_entity_id TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_details_delivery_slot ON order_details(delivery_date, delivery_time);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_driver_orders_driver_id ON driver_orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_target ON access_audit_logs(target_user_id);
