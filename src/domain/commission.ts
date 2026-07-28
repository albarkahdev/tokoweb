import type { Plan } from "@/domain/plan";

export const COMMISSION_PER_INSTALLMENT: Record<Plan, number> = {
  basic: 50_000,
  pro: 100_000,
};

export type Installment = 1 | 2 | 3;

export type PayoutBlueprint = {
  installment: Installment;
  amount: number;
  dueTrigger: "setup_paid" | "month2_paid" | "month3_paid";
};

const TRIGGERS: Record<Installment, PayoutBlueprint["dueTrigger"]> = {
  1: "setup_paid",
  2: "month2_paid",
  3: "month3_paid",
};

export function payoutsForClosing(plan: Plan): PayoutBlueprint[] {
  const amount = COMMISSION_PER_INSTALLMENT[plan];
  return ([1, 2, 3] as const).map((installment) => ({
    installment,
    amount,
    dueTrigger: TRIGGERS[installment],
  }));
}

export function installmentUnlockedByPayment(
  kind: "setup" | "monthly",
  monthlyPaymentNumber: number,
): Installment | null {
  if (kind === "setup") return 1;
  if (monthlyPaymentNumber === 2) return 2;
  if (monthlyPaymentNumber === 3) return 3;
  return null;
}
