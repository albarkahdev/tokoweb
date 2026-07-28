export type PromoRow = {
  id: number;
  tenant_id: number;
  title: string;
  description: string | null;
  image_key: string | null;
  start_date: string;
  end_date: string;
};

export async function listPromos(db: D1Database, tenantId: number): Promise<PromoRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, tenant_id, title, description, image_key, start_date, end_date FROM promos WHERE tenant_id = ?1 ORDER BY end_date DESC",
    )
    .bind(tenantId)
    .all<PromoRow>();
  return rows.results;
}

export async function listActivePromos(
  db: D1Database,
  tenantId: number,
  todayWib: string,
): Promise<PromoRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, tenant_id, title, description, image_key, start_date, end_date FROM promos WHERE tenant_id = ?1 AND start_date <= ?2 AND end_date >= ?2 ORDER BY end_date",
    )
    .bind(tenantId, todayWib)
    .all<PromoRow>();
  return rows.results;
}

export async function createPromo(
  db: D1Database,
  tenantId: number,
  promo: { title: string; description: string | null; startDate: string; endDate: string },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO promos (tenant_id, title, description, start_date, end_date) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
    .bind(tenantId, promo.title, promo.description, promo.startDate, promo.endDate)
    .run();
}

export async function deletePromo(
  db: D1Database,
  tenantId: number,
  promoId: number,
): Promise<void> {
  await db
    .prepare("DELETE FROM promos WHERE id = ?1 AND tenant_id = ?2")
    .bind(promoId, tenantId)
    .run();
}
