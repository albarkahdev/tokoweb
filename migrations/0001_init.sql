CREATE TABLE verticals (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  required_sections TEXT NOT NULL
);

CREATE TABLE themes (
  id INTEGER PRIMARY KEY,
  vertical_id INTEGER NOT NULL REFERENCES verticals(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  tokens TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  UNIQUE (vertical_id, slug)
);

CREATE TABLE tenants (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  name TEXT NOT NULL,
  vertical_id INTEGER NOT NULL REFERENCES verticals(id),
  theme_id INTEGER NOT NULL REFERENCES themes(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'grace', 'suspended', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'owner')),
  tenant_id INTEGER REFERENCES tenants(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE contents (
  tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE promos (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  title TEXT NOT NULL,
  description TEXT,
  image_key TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_promos_tenant_dates ON promos (tenant_id, start_date, end_date);

CREATE TABLE testimonials (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_testimonials_tenant_status ON testimonials (tenant_id, status);

CREATE TABLE track_events (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  type TEXT NOT NULL
    CHECK (type IN ('page_view', 'click_wa', 'click_phone', 'click_maps', 'click_promo')),
  path TEXT NOT NULL,
  promo_id INTEGER REFERENCES promos(id),
  visitor_hash TEXT NOT NULL,
  ts TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_track_events_tenant_ts ON track_events (tenant_id, ts);
CREATE INDEX idx_track_events_ts ON track_events (ts);

CREATE TABLE daily_stats (
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, date, type)
);

CREATE TABLE subscriptions (
  tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id),
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'pro')),
  setup_paid_at TEXT,
  monthly_price INTEGER NOT NULL,
  next_due_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'grace', 'suspended'))
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  kind TEXT NOT NULL CHECK (kind IN ('setup', 'monthly')),
  amount INTEGER NOT NULL,
  period TEXT NOT NULL,
  confirmed_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_by INTEGER NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_payments_tenant_period ON payments (tenant_id, period);

CREATE TABLE referrers (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  wa_number TEXT NOT NULL,
  bank_account TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE referrals (
  id INTEGER PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES referrers(id),
  tenant_id INTEGER REFERENCES tenants(id),
  first_scan_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT
);

CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);

CREATE TABLE commission_payouts (
  id INTEGER PRIMARY KEY,
  referral_id INTEGER NOT NULL REFERENCES referrals(id),
  installment INTEGER NOT NULL CHECK (installment IN (1, 2, 3)),
  amount INTEGER NOT NULL,
  due_trigger TEXT NOT NULL
    CHECK (due_trigger IN ('setup_paid', 'month2_paid', 'month3_paid')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'payable', 'paid', 'void')),
  paid_at TEXT,
  UNIQUE (referral_id, installment)
);

CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  referrer_id INTEGER REFERENCES referrers(id),
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  wa_number TEXT NOT NULL,
  vertical_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'lost'))
);

CREATE INDEX idx_leads_referrer ON leads (referrer_id);

CREATE TABLE intake_forms (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  raw TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0 CHECK (processed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO verticals (slug, name, required_sections)
VALUES ('kuliner', 'Kuliner', '["info","hours","menu","gallery"]');
