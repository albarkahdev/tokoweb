export type StatTotals = {
  pageViews: number;
  waClicks: number;
  phoneClicks: number;
  mapsClicks: number;
  promoClicks: number;
  uniqueVisitors: number;
};

const EMPTY: StatTotals = {
  pageViews: 0,
  waClicks: 0,
  phoneClicks: 0,
  mapsClicks: 0,
  promoClicks: 0,
  uniqueVisitors: 0,
};

const TYPE_TO_KEY: Record<string, keyof StatTotals> = {
  page_view: "pageViews",
  click_wa: "waClicks",
  click_phone: "phoneClicks",
  click_maps: "mapsClicks",
  click_promo: "promoClicks",
  unique_visitors: "uniqueVisitors",
};

export async function statTotalsBetween(
  db: D1Database,
  tenantId: number,
  fromDate: string,
  toDate: string,
): Promise<StatTotals> {
  const rows = await db
    .prepare(
      "SELECT type, SUM(count) AS total FROM daily_stats WHERE tenant_id = ?1 AND date >= ?2 AND date <= ?3 GROUP BY type",
    )
    .bind(tenantId, fromDate, toDate)
    .all<{ type: string; total: number }>();
  const totals = { ...EMPTY };
  for (const row of rows.results) {
    const key = TYPE_TO_KEY[row.type];
    if (key) totals[key] = row.total;
  }
  return totals;
}

export async function busiestDayBetween(
  db: D1Database,
  tenantId: number,
  fromDate: string,
  toDate: string,
): Promise<{ date: string; count: number } | null> {
  const row = await db
    .prepare(
      "SELECT date, count FROM daily_stats WHERE tenant_id = ?1 AND type = 'page_view' AND date >= ?2 AND date <= ?3 ORDER BY count DESC, date DESC LIMIT 1",
    )
    .bind(tenantId, fromDate, toDate)
    .first<{ date: string; count: number }>();
  return row ?? null;
}

export async function topPromoBetween(
  db: D1Database,
  tenantId: number,
  fromUtc: string,
): Promise<{ title: string; clicks: number } | null> {
  const row = await db
    .prepare(
      `SELECT p.title AS title, COUNT(*) AS clicks
       FROM track_events e JOIN promos p ON p.id = e.promo_id
       WHERE e.tenant_id = ?1 AND e.type = 'click_promo' AND e.ts >= ?2
       GROUP BY e.promo_id ORDER BY clicks DESC LIMIT 1`,
    )
    .bind(tenantId, fromUtc)
    .first<{ title: string; clicks: number }>();
  return row ?? null;
}
