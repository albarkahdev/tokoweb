import { describe, expect, it } from "vitest";
import { formatRupiah } from "@/domain/money";
import { isPromoActive } from "@/domain/promo";

describe("formatRupiah", () => {
  it("groups thousands with dots", () => {
    expect(formatRupiah(18000)).toBe("Rp 18.000");
    expect(formatRupiah(1000000)).toBe("Rp 1.000.000");
    expect(formatRupiah(75000)).toBe("Rp 75.000");
    expect(formatRupiah(500)).toBe("Rp 500");
  });
});

describe("isPromoActive", () => {
  const promo = { start_date: "2026-07-01", end_date: "2026-07-31" };

  it("is active within range inclusive", () => {
    expect(isPromoActive(promo, "2026-07-01")).toBe(true);
    expect(isPromoActive(promo, "2026-07-15")).toBe(true);
    expect(isPromoActive(promo, "2026-07-31")).toBe(true);
  });

  it("is inactive outside range", () => {
    expect(isPromoActive(promo, "2026-06-30")).toBe(false);
    expect(isPromoActive(promo, "2026-08-01")).toBe(false);
  });
});
