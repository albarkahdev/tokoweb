INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'kopi', 'Kopi', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'senja', 'Senja', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'padi', 'Padi', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'laut', 'Laut', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'manis', 'Manis', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'sambal', 'Sambal', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'kebun', 'Kebun', '{}', 'active' FROM verticals WHERE slug = 'kuliner';
