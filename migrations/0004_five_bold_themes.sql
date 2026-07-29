INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'batik', 'Batik', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'neon', 'Neon', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'pasar', 'Pasar', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'kertas', 'Kertas', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'tropis', 'Tropis', '{}', 'active' FROM verticals WHERE slug = 'kuliner';
