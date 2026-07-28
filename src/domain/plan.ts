export type Plan = "basic" | "pro";

export const PLAN_PRICES: Record<Plan, { setup: number; monthly: number }> = {
  basic: { setup: 300_000, monthly: 75_000 },
  pro: { setup: 1_000_000, monthly: 200_000 },
};

export function isPlan(value: unknown): value is Plan {
  return value === "basic" || value === "pro";
}
