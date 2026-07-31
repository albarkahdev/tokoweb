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

export type OrderStatCounts = {
  masuk: number;
  selesai: number;
  dibatalkan: number;
  diproses: number;
};

const EMPTY_ORDERS: OrderStatCounts = { masuk: 0, selesai: 0, dibatalkan: 0, diproses: 0 };

function aggregateOrderRows(rows: { status: string; total: number }[]): OrderStatCounts {
  const counts = { ...EMPTY_ORDERS };
  for (const row of rows) {
    counts.masuk += row.total;
    if (row.status === "selesai") counts.selesai += row.total;
    else if (row.status === "dibatalkan") counts.dibatalkan += row.total;
    else counts.diproses += row.total;
  }
  return counts;
}

export async function orderCountsBetween(
  db: D1Database,
  tenantId: number,
  fromDate: string,
  toDate: string,
): Promise<OrderStatCounts> {
  const { results } = await db
    .prepare(
      "SELECT status, COUNT(*) AS total FROM orders WHERE tenant_id = ?1 AND created_at >= datetime(?2 || ' 00:00:00', '-7 hours') AND created_at <= datetime(?3 || ' 23:59:59', '-7 hours') GROUP BY status",
    )
    .bind(tenantId, fromDate, toDate)
    .all<{ status: string; total: number }>();
  return aggregateOrderRows(results ?? []);
}

export async function platformOrderCountsBetween(
  db: D1Database,
  fromDate: string,
  toDate: string,
): Promise<OrderStatCounts> {
  const { results } = await db
    .prepare(
      "SELECT status, COUNT(*) AS total FROM orders WHERE created_at >= datetime(?1 || ' 00:00:00', '-7 hours') AND created_at <= datetime(?2 || ' 23:59:59', '-7 hours') GROUP BY status",
    )
    .bind(fromDate, toDate)
    .all<{ status: string; total: number }>();
  return aggregateOrderRows(results ?? []);
}

export async function topOrderItemsBetween(
  db: D1Database,
  tenantId: number,
  fromDate: string,
  toDate: string,
  limit: number,
): Promise<{ name: string; qty: number }[]> {
  const { results } = await db
    .prepare(
      `SELECT oi.name AS name, SUM(oi.qty) AS qty
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.tenant_id = ?1 AND o.status != 'dibatalkan'
         AND o.created_at >= datetime(?2 || ' 00:00:00', '-7 hours') AND o.created_at <= datetime(?3 || ' 23:59:59', '-7 hours')
       GROUP BY oi.name ORDER BY qty DESC, oi.name ASC LIMIT ?4`,
    )
    .bind(tenantId, fromDate, toDate, limit)
    .all<{ name: string; qty: number }>();
  return results ?? [];
}

export async function peakOrderHourBetween(
  db: D1Database,
  tenantId: number,
  fromDate: string,
  toDate: string,
): Promise<{ hour: number; count: number } | null> {
  const row = await db
    .prepare(
      `SELECT CAST(strftime('%H', datetime(created_at, '+7 hours')) AS INTEGER) AS hour, COUNT(*) AS count
       FROM orders
       WHERE tenant_id = ?1 AND status != 'dibatalkan'
         AND created_at >= datetime(?2 || ' 00:00:00', '-7 hours') AND created_at <= datetime(?3 || ' 23:59:59', '-7 hours')
       GROUP BY hour ORDER BY count DESC, hour ASC LIMIT 1`,
    )
    .bind(tenantId, fromDate, toDate)
    .first<{ hour: number; count: number }>();
  return row ?? null;
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
