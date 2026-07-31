import { describe, expect, it } from "vitest";
import {
  applyTransition,
  buildWaMessage,
  calculateOrderTotal,
  canTransition,
  generateOrderCode,
  isFulfillment,
  isItemAvailable,
  isOrderStatus,
  ORDER_CODE_LENGTH,
  type OrderState,
  parseOrderSettings,
  validateCheckout,
} from "@/domain/order";

function freshOrder(status: OrderState["status"] = "baru"): OrderState {
  return {
    status,
    confirmed_at: null,
    paid_at: null,
    verified_at: null,
    processed_at: null,
    completed_at: null,
    cancelled_at: null,
  };
}

describe("state machine", () => {
  it("allows the happy path", () => {
    expect(canTransition("baru", "menunggu_bayar")).toBe(true);
    expect(canTransition("menunggu_bayar", "cek_bayar")).toBe(true);
    expect(canTransition("cek_bayar", "diproses")).toBe(true);
    expect(canTransition("diproses", "selesai")).toBe(true);
  });

  it("allows reject back to waiting and cancel from early states", () => {
    expect(canTransition("cek_bayar", "menunggu_bayar")).toBe(true);
    expect(canTransition("baru", "dibatalkan")).toBe(true);
    expect(canTransition("menunggu_bayar", "dibatalkan")).toBe(true);
    expect(canTransition("cek_bayar", "dibatalkan")).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransition("baru", "diproses")).toBe(false);
    expect(canTransition("baru", "selesai")).toBe(false);
    expect(canTransition("diproses", "dibatalkan")).toBe(false);
    expect(canTransition("selesai", "diproses")).toBe(false);
    expect(canTransition("dibatalkan", "menunggu_bayar")).toBe(false);
  });

  it("applyTransition stamps the right timestamp", () => {
    const now = "2026-07-31T10:00:00Z";
    const confirmed = applyTransition(freshOrder("baru"), "menunggu_bayar", now);
    expect(confirmed.status).toBe("menunggu_bayar");
    expect(confirmed.confirmed_at).toBe(now);
    expect(confirmed.paid_at).toBeNull();
  });

  it("applyTransition to diproses stamps verified and processed", () => {
    const now = "2026-07-31T10:05:00Z";
    const processed = applyTransition(freshOrder("cek_bayar"), "diproses", now);
    expect(processed.verified_at).toBe(now);
    expect(processed.processed_at).toBe(now);
  });

  it("applyTransition preserves earlier timestamps on re-entry (reject)", () => {
    const order = { ...freshOrder("cek_bayar"), confirmed_at: "2026-07-31T09:00:00Z" };
    const rejected = applyTransition(order, "menunggu_bayar", "2026-07-31T11:00:00Z");
    expect(rejected.status).toBe("menunggu_bayar");
    expect(rejected.confirmed_at).toBe("2026-07-31T09:00:00Z");
  });

  it("applyTransition throws on illegal move", () => {
    expect(() => applyTransition(freshOrder("baru"), "selesai", "now")).toThrow();
  });

  it("guards status/fulfillment strings", () => {
    expect(isOrderStatus("diproses")).toBe(true);
    expect(isOrderStatus("nope")).toBe(false);
    expect(isFulfillment("dine_in")).toBe(true);
    expect(isFulfillment("delivery")).toBe(false);
  });
});

describe("calculateOrderTotal", () => {
  it("sums line items", () => {
    const totals = calculateOrderTotal(
      [
        { unit_price: 18000, qty: 2 },
        { unit_price: 8000, qty: 1 },
      ],
      0,
      [],
    );
    expect(totals.subtotal).toBe(44000);
    expect(totals.total).toBe(44000);
  });

  it("applies tax percent and fees", () => {
    const totals = calculateOrderTotal([{ unit_price: 10000, qty: 10 }], 11, [
      { label: "Kemasan", amount: 2000 },
    ]);
    expect(totals.subtotal).toBe(100000);
    expect(totals.tax_amount).toBe(11000);
    expect(totals.fee_amount).toBe(2000);
    expect(totals.total).toBe(113000);
  });

  it("ignores negative and non-integer inputs", () => {
    const totals = calculateOrderTotal([{ unit_price: -5, qty: 3 }], -5, [
      { label: "x", amount: -9 },
    ]);
    expect(totals.subtotal).toBe(0);
    expect(totals.tax_amount).toBe(0);
    expect(totals.fee_amount).toBe(0);
    expect(totals.total).toBe(0);
  });
});

describe("validateCheckout", () => {
  const base = {
    customer_name: "Budi",
    fulfillment: "pickup",
    items: [{ name: "Bakmi", unit_price: 18000, qty: 1 }],
    total: 18000,
  };

  it("accepts a valid pickup order", () => {
    expect(validateCheckout(base)).toEqual({ ok: true });
  });

  it("requires a name", () => {
    expect(validateCheckout({ ...base, customer_name: " " }).ok).toBe(false);
  });

  it("rejects empty cart", () => {
    expect(validateCheckout({ ...base, items: [] }).ok).toBe(false);
  });

  it("rejects unavailable items", () => {
    const res = validateCheckout({
      ...base,
      items: [{ name: "Habis", unit_price: 1, qty: 1, available: false }],
    });
    expect(res.ok).toBe(false);
  });

  it("requires table for dine-in", () => {
    expect(validateCheckout({ ...base, fulfillment: "dine_in" }).ok).toBe(false);
    expect(validateCheckout({ ...base, fulfillment: "dine_in", table_no: "4" }).ok).toBe(true);
  });

  it("enforces minimum order", () => {
    expect(validateCheckout({ ...base, min_order: 25000 }).ok).toBe(false);
    expect(validateCheckout({ ...base, min_order: 10000 }).ok).toBe(true);
  });

  it("rejects invalid fulfillment", () => {
    expect(validateCheckout({ ...base, fulfillment: "delivery" }).ok).toBe(false);
  });
});

describe("generateOrderCode", () => {
  it("produces a code of the right length using the alphabet", () => {
    const code = generateOrderCode();
    expect(code).toHaveLength(ORDER_CODE_LENGTH);
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]+$/);
  });

  it("does not repeat across many calls", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateOrderCode()));
    expect(seen.size).toBeGreaterThan(190);
  });
});

describe("isItemAvailable", () => {
  it("defaults to available when undefined", () => {
    expect(isItemAvailable({})).toBe(true);
    expect(isItemAvailable({ available: true })).toBe(true);
    expect(isItemAvailable({ available: false })).toBe(false);
  });
});

describe("parseOrderSettings", () => {
  it("clamps and filters", () => {
    const s = parseOrderSettings({
      enabled: true,
      taxPercent: "250",
      minOrder: "-5",
      tables: "9999",
      fees: [
        { label: "Kemasan", amount: "2000" },
        { label: "", amount: "500" },
        { label: "Nol", amount: "0" },
      ],
    });
    expect(s.enabled).toBe(true);
    expect(s.tax_percent).toBe(100);
    expect(s.min_order).toBe(0);
    expect(s.tables).toBe(200);
    expect(s.fees).toEqual([{ label: "Kemasan", amount: 2000 }]);
  });

  it("handles disabled and empty", () => {
    const s = parseOrderSettings({
      enabled: false,
      taxPercent: "",
      minOrder: "",
      tables: "",
      fees: [],
    });
    expect(s.enabled).toBe(false);
    expect(s.tax_percent).toBe(0);
    expect(s.fees).toEqual([]);
  });
});

describe("buildWaMessage", () => {
  it("includes items, total and status link", () => {
    const msg = buildWaMessage(
      {
        code: "AB12CD34",
        customer_name: "Sari",
        fulfillment: "dine_in",
        table_no: "3",
        items: [{ name: "Bakmi Ayam", qty: 2, unit_price: 18000 }],
        subtotal: 36000,
        tax_amount: 0,
        fee_amount: 2000,
        total: 38000,
      },
      "https://warung.tokoweb.id/o/AB12CD34",
    );
    expect(msg).toContain("AB12CD34");
    expect(msg).toContain("Meja 3");
    expect(msg).toContain("2x Bakmi Ayam");
    expect(msg).toContain("Rp 38.000");
    expect(msg).toContain("https://warung.tokoweb.id/o/AB12CD34");
    expect(msg).not.toContain("Pajak:");
  });
});
