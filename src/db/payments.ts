import { makeInstallmentPayable } from "@/db/payouts";
import { findClosingByTenant } from "@/db/referrals";
import { markSetupPaid, setSubscriptionCycle } from "@/db/subscriptions";
import { setTenantStatus } from "@/db/tenants";
import { installmentUnlockedByPayment } from "@/domain/commission";
import { sqlUtcDateTime } from "@/domain/stats";
import { nextDueDateAfterPayment, wibDateOf } from "@/domain/subscription";

export type PaymentKind = "setup" | "monthly";

export type VerifyPaymentResult = {
  paymentId: number;
  unlockedInstallment: number | null;
  tenantReactivated: boolean;
  duplicate?: boolean;
};

async function paymentExists(
  db: D1Database,
  tenantId: number,
  kind: PaymentKind,
  period: string,
): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 FROM payments WHERE tenant_id = ?1 AND kind = ?2 AND period = ?3 LIMIT 1")
    .bind(tenantId, kind, period)
    .first<{ 1: number }>();
  return row !== null;
}

export async function verifyPayment(
  db: D1Database,
  input: {
    tenantId: number;
    kind: PaymentKind;
    amount: number;
    period: string;
    confirmedBy: number;
    currentDueDate: string | null;
    tenantStatus: string;
    nowMs: number;
  },
): Promise<VerifyPaymentResult> {
  if (await paymentExists(db, input.tenantId, input.kind, input.period)) {
    return { paymentId: 0, unlockedInstallment: null, tenantReactivated: false, duplicate: true };
  }

  const payment = await db
    .prepare(
      "INSERT INTO payments (tenant_id, kind, amount, period, confirmed_at, confirmed_by) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id",
    )
    .bind(
      input.tenantId,
      input.kind,
      input.amount,
      input.period,
      sqlUtcDateTime(input.nowMs),
      input.confirmedBy,
    )
    .first<{ id: number }>();
  if (!payment) throw new Error("Failed to record payment");

  let unlockedInstallment: number | null = null;
  let tenantReactivated = false;

  if (input.kind === "setup") {
    await markSetupPaid(db, input.tenantId, sqlUtcDateTime(input.nowMs));
  } else {
    const counted = await db
      .prepare("SELECT COUNT(*) AS n FROM payments WHERE tenant_id = ?1 AND kind = 'monthly'")
      .bind(input.tenantId)
      .first<{ n: number }>();
    const monthlyNumber = counted?.n ?? 1;

    const baseDue = input.currentDueDate ?? wibDateOf(input.nowMs);
    await setSubscriptionCycle(db, input.tenantId, nextDueDateAfterPayment(baseDue), "active");

    if (input.tenantStatus === "grace" || input.tenantStatus === "suspended") {
      await setTenantStatus(db, input.tenantId, "active");
      tenantReactivated = true;
    }
    unlockedInstallment = installmentUnlockedByPayment("monthly", monthlyNumber);
  }

  if (unlockedInstallment !== null) {
    const closing = await findClosingByTenant(db, input.tenantId);
    if (closing) {
      await makeInstallmentPayable(db, closing.id, unlockedInstallment as 1 | 2 | 3);
    }
  }

  return { paymentId: payment.id, unlockedInstallment, tenantReactivated };
}
