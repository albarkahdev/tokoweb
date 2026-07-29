PRAGMA defer_foreign_keys = true;

CREATE TABLE referrers_new (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  wa_number TEXT NOT NULL,
  bank_account TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  pin_hash TEXT
);

INSERT INTO referrers_new (id, code, name, wa_number, bank_account, status, created_at, pin_hash)
SELECT id, code, name, wa_number, bank_account, status, created_at, pin_hash FROM referrers;

DROP TABLE referrers;

ALTER TABLE referrers_new RENAME TO referrers;
