CREATE TABLE billing_submissions (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  period TEXT NOT NULL,
  amount INTEGER NOT NULL,
  proof_key TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'matched', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);

CREATE UNIQUE INDEX idx_billing_submissions_tenant_period
  ON billing_submissions (tenant_id, period);

CREATE INDEX idx_billing_submissions_status ON billing_submissions (status, created_at);
