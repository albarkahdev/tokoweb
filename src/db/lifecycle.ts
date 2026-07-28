export type DueSubscriptionRow = {
  tenant_id: number;
  next_due_date: string;
  tenant_status: string;
  slug: string;
  custom_domain: string | null;
};

export async function listSubscriptionsWithDueDate(db: D1Database): Promise<DueSubscriptionRow[]> {
  const rows = await db
    .prepare(
      `SELECT s.tenant_id, s.next_due_date, t.status AS tenant_status, t.slug, t.custom_domain
       FROM subscriptions s
       JOIN tenants t ON t.id = s.tenant_id
       WHERE s.next_due_date IS NOT NULL AND t.status IN ('active', 'grace', 'suspended')`,
    )
    .all<DueSubscriptionRow>();
  return rows.results;
}

export type PromoBoundaryTenant = {
  tenant_id: number;
  slug: string;
  custom_domain: string | null;
};

export async function listTenantsWithPromoBoundary(
  db: D1Database,
  todayWib: string,
  yesterdayWib: string,
): Promise<PromoBoundaryTenant[]> {
  const rows = await db
    .prepare(
      `SELECT DISTINCT t.id AS tenant_id, t.slug, t.custom_domain
       FROM promos p
       JOIN tenants t ON t.id = p.tenant_id
       WHERE (p.start_date = ?1 OR p.end_date = ?2) AND t.status IN ('active', 'grace')`,
    )
    .bind(todayWib, yesterdayWib)
    .all<PromoBoundaryTenant>();
  return rows.results;
}
