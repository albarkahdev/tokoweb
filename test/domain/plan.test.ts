import { describe, expect, it } from "vitest";
import { isPlan, PLAN_PRICES, REFERRAL_SETUP_DISCOUNT, setupFee } from "@/domain/plan";

describe("isPlan", () => {
  it("accepts known plans only", () => {
    expect(isPlan("basic")).toBe(true);
    expect(isPlan("pro")).toBe(true);
    expect(isPlan("gold")).toBe(false);
    expect(isPlan(null)).toBe(false);
  });
});

describe("setupFee", () => {
  it("returns full setup without referral", () => {
    expect(setupFee("basic", false)).toBe(PLAN_PRICES.basic.setup);
    expect(setupFee("pro", false)).toBe(PLAN_PRICES.pro.setup);
  });

  it("applies 30% referral discount, rounded to thousands", () => {
    expect(REFERRAL_SETUP_DISCOUNT).toBe(0.3);
    expect(setupFee("basic", true)).toBe(210_000);
    expect(setupFee("pro", true)).toBe(700_000);
  });
});
