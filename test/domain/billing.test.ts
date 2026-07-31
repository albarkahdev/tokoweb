import { describe, expect, it } from "vitest";
import {
  amountDue,
  billingWaLink,
  buildBillingWaMessage,
  currentBillingPeriod,
  formatPeriodLabel,
  isBillingProofValid,
  isValidPeriod,
  MAX_BILLING_PROOF_BYTES,
  periodOf,
} from "@/domain/billing";

describe("billing period", () => {
  it("derives period from a date", () => {
    expect(periodOf("2026-08-15")).toBe("2026-08");
  });

  it("uses next due date when present", () => {
    expect(currentBillingPeriod("2026-09-01", Date.UTC(2026, 6, 1))).toBe("2026-09");
  });

  it("falls back to now (WIB) when no due date", () => {
    expect(currentBillingPeriod(null, Date.UTC(2026, 7, 20, 20, 0, 0))).toBe("2026-08");
  });

  it("validates YYYY-MM", () => {
    expect(isValidPeriod("2026-08")).toBe(true);
    expect(isValidPeriod("2026-13")).toBe(false);
    expect(isValidPeriod("2026-00")).toBe(false);
    expect(isValidPeriod("2026-8")).toBe(false);
    expect(isValidPeriod("bulan")).toBe(false);
  });

  it("labels a period in Indonesian", () => {
    expect(formatPeriodLabel("2026-08")).toBe("Agustus 2026");
    expect(formatPeriodLabel("2026-01")).toBe("Januari 2026");
    expect(formatPeriodLabel("invalid")).toBe("invalid");
  });
});

describe("amountDue", () => {
  it("returns the monthly price", () => {
    expect(amountDue(75000)).toBe(75000);
  });

  it("returns 0 for missing price", () => {
    expect(amountDue(null)).toBe(0);
    expect(amountDue(undefined)).toBe(0);
  });
});

describe("isBillingProofValid", () => {
  it("accepts webp within the size cap", () => {
    expect(isBillingProofValid("image/webp", 1000)).toBe(true);
    expect(isBillingProofValid("image/webp", MAX_BILLING_PROOF_BYTES)).toBe(true);
  });

  it("rejects non-webp, empty, or oversize", () => {
    expect(isBillingProofValid("image/png", 1000)).toBe(false);
    expect(isBillingProofValid("image/webp", 0)).toBe(false);
    expect(isBillingProofValid("image/webp", MAX_BILLING_PROOF_BYTES + 1)).toBe(false);
  });
});

describe("billing WhatsApp message", () => {
  it("includes business, period, and formatted amount", () => {
    const msg = buildBillingWaMessage({
      businessName: "Warung Budi",
      slug: "warung-budi",
      period: "2026-08",
      amount: 75000,
    });
    expect(msg).toContain("Warung Budi");
    expect(msg).toContain("Agustus 2026");
    expect(msg).toContain("Rp 75.000");
  });

  it("builds an encoded wa.me link", () => {
    const link = billingWaLink("628999", "halo dunia");
    expect(link).toBe("https://wa.me/628999?text=halo%20dunia");
  });
});
