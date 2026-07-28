CREATE TABLE auth_tokens (
  id INTEGER PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('set_password', 'intake')),
  user_id INTEGER REFERENCES users(id),
  tenant_id INTEGER REFERENCES tenants(id),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_auth_tokens_tenant ON auth_tokens (tenant_id);

ALTER TABLE referrers ADD COLUMN pin_hash TEXT;

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT v.id, 'hangat', 'Hangat',
  '{"color":{"bg":"#FFFBF5","surface":"#FFFFFF","text":"#2D2A26","muted":"#6B655E","primary":"#C4501B","accent":"#E8A03C"},"radius":{"card":"1rem","button":"9999px"},"layout":{"hero":"image-full","menu":"cards","gallery":"masonry"}}',
  'active'
FROM verticals v WHERE v.slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT v.id, 'arang', 'Arang',
  '{"color":{"bg":"#141210","surface":"#1E1B18","text":"#F4EFE8","muted":"#A89F93","primary":"#D4A24C","accent":"#8C6A3F"},"radius":{"card":"0.5rem","button":"0.5rem"},"layout":{"hero":"image-split","menu":"list","gallery":"grid"}}',
  'active'
FROM verticals v WHERE v.slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT v.id, 'ceria', 'Ceria',
  '{"color":{"bg":"#FFF8EE","surface":"#FFFFFF","text":"#27221C","muted":"#7A7168","primary":"#E8483F","accent":"#2BA6A4"},"radius":{"card":"1.25rem","button":"9999px"},"layout":{"hero":"image-card","menu":"cards","gallery":"grid"}}',
  'active'
FROM verticals v WHERE v.slug = 'kuliner';
