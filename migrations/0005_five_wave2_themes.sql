INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'warisan', 'Warisan', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'retro', 'Retro', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'mono', 'Mono', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'lampion', 'Lampion', '{}', 'active' FROM verticals WHERE slug = 'kuliner';

INSERT INTO themes (vertical_id, slug, name, tokens, status)
SELECT id, 'sketsa', 'Sketsa', '{}', 'active' FROM verticals WHERE slug = 'kuliner';
