import { describe, expect, it } from "vitest";
import { installmentUnlockedByPayment, payoutsForClosing } from "@/domain/commission";

describe("payoutsForClosing", () => {
  it("creates 3 installments of 50k for basic", () => {
    const payouts = payoutsForClosing("basic");
    expect(payouts).toHaveLength(3);
    expect(payouts.every((p) => p.amount === 50_000)).toBe(true);
    expect(payouts.map((p) => p.dueTrigger)).toEqual(["setup_paid", "month2_paid", "month3_paid"]);
  });

  it("creates 3 installments of 100k for pro", () => {
    const payouts = payoutsForClosing("pro");
    expect(payouts.every((p) => p.amount === 100_000)).toBe(true);
  });
});

describe("installmentUnlockedByPayment", () => {
  it("setup payment unlocks installment 1", () => {
    expect(installmentUnlockedByPayment("setup", 0)).toBe(1);
  });

  it("second monthly payment unlocks installment 2", () => {
    expect(installmentUnlockedByPayment("monthly", 2)).toBe(2);
  });

  it("third monthly payment unlocks installment 3", () => {
    expect(installmentUnlockedByPayment("monthly", 3)).toBe(3);
  });

  it("other monthly payments unlock nothing", () => {
    expect(installmentUnlockedByPayment("monthly", 1)).toBeNull();
    expect(installmentUnlockedByPayment("monthly", 4)).toBeNull();
  });
});
