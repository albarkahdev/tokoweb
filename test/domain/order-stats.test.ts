import { describe, expect, it } from "vitest";
import { conversionRate, narrateOrders } from "@/domain/order-stats";

describe("conversionRate", () => {
  it("is 0 when no orders", () => {
    expect(conversionRate({ masuk: 0, selesai: 0, dibatalkan: 0, diproses: 0 })).toBe(0);
  });

  it("rounds selesai/masuk to percent", () => {
    expect(conversionRate({ masuk: 8, selesai: 6, dibatalkan: 1, diproses: 1 })).toBe(75);
    expect(conversionRate({ masuk: 3, selesai: 1, dibatalkan: 0, diproses: 2 })).toBe(33);
  });
});

describe("narrateOrders", () => {
  it("nudges when there are no orders", () => {
    const lines = narrateOrders({ masuk: 0, selesai: 0, dibatalkan: 0, diproses: 0 }, [], null);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Belum ada pesanan");
  });

  it("summarizes conversion, backlog, cancellations, top item, peak hour", () => {
    const lines = narrateOrders(
      { masuk: 10, selesai: 7, dibatalkan: 2, diproses: 1 },
      [{ name: "Nasi Ayam", qty: 12 }],
      { hour: 12, count: 5 },
    );
    expect(lines.some((l) => l.includes("10 pesanan masuk, 7 selesai") && l.includes("70%"))).toBe(
      true,
    );
    expect(lines.some((l) => l.includes("1 pesanan masih berjalan"))).toBe(true);
    expect(lines.some((l) => l.includes("2 dibatalkan"))).toBe(true);
    expect(lines.some((l) => l.includes("Nasi Ayam") && l.includes("12 porsi"))).toBe(true);
    expect(lines.some((l) => l.includes("pukul 12.00"))).toBe(true);
  });

  it("handles orders with no completions yet", () => {
    const lines = narrateOrders({ masuk: 4, selesai: 0, dibatalkan: 0, diproses: 4 }, [], null);
    expect(lines.some((l) => l.includes("4 pesanan masuk periode ini"))).toBe(true);
  });
});
