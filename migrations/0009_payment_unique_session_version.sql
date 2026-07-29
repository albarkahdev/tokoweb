CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique
  ON payments (tenant_id, kind, period);

ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;
