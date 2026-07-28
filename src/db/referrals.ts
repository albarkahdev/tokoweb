import { payoutsForClosing } from "@/domain/commission";
import type { Plan } from "@/domain/plan";
import { sqlUtcDateTime } from "@/domain/stats";

export async function recordScan(db: D1Database, referrerId: number): Promise<void> {
  await db.prepare("INSERT INTO referrals (referrer_id) VALUES (?1)").bind(referrerId).run();
}

export async function countScans(db: D1Database, referrerId: number): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM referrals WHERE referrer_id = ?1 AND tenant_id IS NULL")
    .bind(referrerId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function createClosing(
  db: D1Database,
  referrerId: number,
  tenantId: number,
  plan: Plan,
  nowMs: number,
): Promise<number> {
  const referral = await db
    .prepare(
      "INSERT INTO referrals (referrer_id, tenant_id, closed_at) VALUES (?1, ?2, ?3) RETURNING id",
    )
    .bind(referrerId, tenantId, sqlUtcDateTime(nowMs))
    .first<{ id: number }>();
  if (!referral) throw new Error("Failed to create referral closing");

  const statements = payoutsForClosing(plan).map((payout) =>
    db
      .prepare(
        "INSERT INTO commission_payouts (referral_id, installment, amount, due_trigger, status) VALUES (?1, ?2, ?3, ?4, 'pending')",
      )
      .bind(referral.id, payout.installment, payout.amount, payout.dueTrigger),
  );
  await db.batch(statements);
  return referral.id;
}

export type ClosingSummary = {
  referral_id: number;
  tenant_name: string;
  closed_at: string;
  installment: number;
  amount: number;
  status: string;
};

export async function listClosingsWithPayouts(
  db: D1Database,
  referrerId: number,
): Promise<ClosingSummary[]> {
  const rows = await db
    .prepare(
      `SELECT r.id AS referral_id, t.name AS tenant_name, r.closed_at,
              cp.installment, cp.amount, cp.status
       FROM referrals r
       JOIN tenants t ON t.id = r.tenant_id
       JOIN commission_payouts cp ON cp.referral_id = r.id
       WHERE r.referrer_id = ?1 AND r.tenant_id IS NOT NULL
       ORDER BY r.closed_at DESC, cp.installment`,
    )
    .bind(referrerId)
    .all<ClosingSummary>();
  return rows.results;
}

export async function findClosingByTenant(
  db: D1Database,
  tenantId: number,
): Promise<{ id: number; referrer_id: number } | null> {
  return db
    .prepare("SELECT id, referrer_id FROM referrals WHERE tenant_id = ?1")
    .bind(tenantId)
    .first<{ id: number; referrer_id: number }>();
}
