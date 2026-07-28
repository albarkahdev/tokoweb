export type ThemeRow = {
  id: number;
  slug: string;
  name: string;
};

export async function listActiveThemes(db: D1Database, verticalId: number): Promise<ThemeRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, slug, name FROM themes WHERE vertical_id = ?1 AND status = 'active' ORDER BY id",
    )
    .bind(verticalId)
    .all<ThemeRow>();
  return rows.results;
}

export async function findThemeById(db: D1Database, id: number): Promise<ThemeRow | null> {
  return db.prepare("SELECT id, slug, name FROM themes WHERE id = ?1").bind(id).first<ThemeRow>();
}
