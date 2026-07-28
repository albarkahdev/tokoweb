import type { Plan } from "@/domain/plan";

export type SubscriptionRow = {
  tenant_id: number;
  plan: Plan;
  setup_paid_at: string | null;
  monthly_price: number;
  next_due_date: string | null;
  status: "active" | "grace" | "suspended";
};

export async function getSubscription(
  db: D1Database,
  tenantId: number,
): Promise<SubscriptionRow | null> {
  return db
    .prepare(
      "SELECT tenant_id, plan, setup_paid_at, monthly_price, next_due_date, status FROM subscriptions WHERE tenant_id = ?1",
    )
    .bind(tenantId)
    .first<SubscriptionRow>();
}

export async function upsertSubscription(
  db: D1Database,
  tenantId: number,
  plan: Plan,
  monthlyPrice: number,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO subscriptions (tenant_id, plan, monthly_price, status) VALUES (?1, ?2, ?3, 'active') ON CONFLICT (tenant_id) DO UPDATE SET plan = excluded.plan, monthly_price = excluded.monthly_price",
    )
    .bind(tenantId, plan, monthlyPrice)
    .run();
}

export async function markSetupPaid(
  db: D1Database,
  tenantId: number,
  paidAtUtc: string,
): Promise<void> {
  await db
    .prepare("UPDATE subscriptions SET setup_paid_at = ?1 WHERE tenant_id = ?2")
    .bind(paidAtUtc, tenantId)
    .run();
}

export async function setSubscriptionCycle(
  db: D1Database,
  tenantId: number,
  nextDueDate: string,
  status: "active" | "grace" | "suspended",
): Promise<void> {
  await db
    .prepare("UPDATE subscriptions SET next_due_date = ?1, status = ?2 WHERE tenant_id = ?3")
    .bind(nextDueDate, status, tenantId)
    .run();
}
