CREATE TABLE tenant_payment_methods (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  type TEXT NOT NULL CHECK (type IN ('qris', 'transfer', 'ewallet')),
  label TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  image_key TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_payment_methods_tenant ON tenant_payment_methods (tenant_id, active, sort);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('dine_in', 'pickup')),
  table_no TEXT,
  status TEXT NOT NULL DEFAULT 'baru'
    CHECK (status IN ('baru', 'menunggu_bayar', 'cek_bayar', 'diproses', 'siap', 'selesai', 'dibatalkan')),
  cash INTEGER NOT NULL DEFAULT 0 CHECK (cash IN (0, 1)),
  subtotal INTEGER NOT NULL,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  fee_amount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method_id INTEGER REFERENCES tenant_payment_methods(id),
  payment_snapshot TEXT,
  proof_key TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  paid_at TEXT,
  verified_at TEXT,
  processed_at TEXT,
  ready_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT
);

CREATE INDEX idx_orders_tenant_status ON orders (tenant_id, status);
CREATE INDEX idx_orders_tenant_created ON orders (tenant_id, created_at);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  name TEXT NOT NULL,
  category TEXT,
  unit_price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  item_note TEXT
);

CREATE INDEX idx_order_items_order ON order_items (order_id);
