import type { Installment } from "@/domain/commission";
import { sqlUtcDateTime } from "@/domain/stats";

export type PayoutRow = {
  id: number;
  referral_id: number;
  installment: Installment;
  amount: number;
  due_trigger: string;
  status: "pending" | "payable" | "paid" | "void";
  paid_at: string | null;
};

export async function makeInstallmentPayable(
  db: D1Database,
  referralId: number,
  installment: Installment,
): Promise<void> {
  await db
    .prepare(
      "UPDATE commission_payouts SET status = 'payable' WHERE referral_id = ?1 AND installment = ?2 AND status = 'pending'",
    )
    .bind(referralId, installment)
    .run();
}

export async function releaseMaturedFirstInstallments(
  db: D1Database,
  setupPaidCutoffUtc: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE commission_payouts SET status = 'payable'
       WHERE installment = 1 AND status = 'pending' AND referral_id IN (
         SELECT r.id FROM referrals r
         JOIN subscriptions s ON s.tenant_id = r.tenant_id
         WHERE s.setup_paid_at IS NOT NULL AND s.setup_paid_at <= ?1
       )`,
    )
    .bind(setupPaidCutoffUtc)
    .run();
}

export async function markPayoutPaid(
  db: D1Database,
  payoutId: number,
  nowMs: number,
): Promise<void> {
  await db
    .prepare(
      "UPDATE commission_payouts SET status = 'paid', paid_at = ?1 WHERE id = ?2 AND status = 'payable'",
    )
    .bind(sqlUtcDateTime(nowMs), payoutId)
    .run();
}

export async function voidUnpaidPayouts(db: D1Database, referralId: number): Promise<void> {
  await db
    .prepare(
      "UPDATE commission_payouts SET status = 'void' WHERE referral_id = ?1 AND status IN ('pending', 'payable')",
    )
    .bind(referralId)
    .run();
}

export async function voidInstallment(
  db: D1Database,
  referralId: number,
  installment: Installment,
): Promise<void> {
  await db
    .prepare(
      "UPDATE commission_payouts SET status = 'void' WHERE referral_id = ?1 AND installment = ?2 AND status IN ('pending', 'payable')",
    )
    .bind(referralId, installment)
    .run();
}

export async function listPayoutsForReferral(
  db: D1Database,
  referralId: number,
): Promise<PayoutRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, referral_id, installment, amount, due_trigger, status, paid_at FROM commission_payouts WHERE referral_id = ?1 ORDER BY installment",
    )
    .bind(referralId)
    .all<PayoutRow>();
  return rows.results;
}

export type PayableRow = PayoutRow & { referrer_name: string; tenant_name: string };

export async function listPayablePayouts(db: D1Database): Promise<PayableRow[]> {
  const rows = await db
    .prepare(
      `SELECT cp.id, cp.referral_id, cp.installment, cp.amount, cp.due_trigger, cp.status, cp.paid_at,
              rf.name AS referrer_name, t.name AS tenant_name
       FROM commission_payouts cp
       JOIN referrals r ON r.id = cp.referral_id
       JOIN referrers rf ON rf.id = r.referrer_id
       JOIN tenants t ON t.id = r.tenant_id
       WHERE cp.status = 'payable'
       ORDER BY cp.id`,
    )
    .all<PayableRow>();
  return rows.results;
}
