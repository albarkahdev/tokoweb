import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { createOrder } from "@/db/orders";
import {
  orderCountsBetween,
  peakOrderHourBetween,
  platformOrderCountsBetween,
  topOrderItemsBetween,
} from "@/db/stats-read";

beforeEach(async () => {
  await env.DB.exec("DELETE FROM order_items");
  await env.DB.exec("DELETE FROM orders");
  await env.DB.exec("DELETE FROM tenants");
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung', 1, 1, 'active'), (2, 'kedai', 'Kedai', 1, 1, 'active')",
  ).run();
});

async function seedOrder(opts: {
  code: string;
  tenantId?: number;
  status: string;
  createdAt: string;
  itemName?: string;
  qty?: number;
}) {
  const order = await createOrder(env.DB, {
    tenantId: opts.tenantId ?? 1,
    code: opts.code,
    customerName: "Budi",
    customerEmail: null,
    customerPhone: "628",
    fulfillment: "pickup",
    tableNo: null,
    cash: false,
    subtotal: 10000,
    taxAmount: 0,
    feeAmount: 0,
    total: 10000,
    note: null,
    items: [
      {
        name: opts.itemName ?? "Bakmi",
        category: "Makanan",
        unit_price: 10000,
        qty: opts.qty ?? 1,
        item_note: null,
      },
    ],
  });
  await env.DB.prepare("UPDATE orders SET status = ?2, created_at = ?3 WHERE id = ?1")
    .bind(order.id, opts.status, opts.createdAt)
    .run();
}

describe("order stats queries", () => {
  it("counts by status within the date range", async () => {
    await seedOrder({ code: "AA000001", status: "selesai", createdAt: "2026-08-10 05:00:00" });
    await seedOrder({ code: "AA000002", status: "dibatalkan", createdAt: "2026-08-11 05:00:00" });
    await seedOrder({ code: "AA000003", status: "diproses", createdAt: "2026-08-12 05:00:00" });
    await seedOrder({ code: "AA000004", status: "selesai", createdAt: "2026-07-30 05:00:00" });

    const counts = await orderCountsBetween(env.DB, 1, "2026-08-01", "2026-08-31");
    expect(counts).toEqual({ masuk: 3, selesai: 1, dibatalkan: 1, diproses: 1 });
  });

  it("respects WIB day boundaries (created_at stored UTC)", async () => {
    await seedOrder({ code: "WB000001", status: "selesai", createdAt: "2026-07-31 20:00:00" });
    await seedOrder({ code: "WB000002", status: "selesai", createdAt: "2026-07-31 16:00:00" });
    const counts = await orderCountsBetween(env.DB, 1, "2026-08-01", "2026-08-31");
    expect(counts.masuk).toBe(1);
  });

  it("top items exclude cancelled orders and sum quantity", async () => {
    await seedOrder({
      code: "BB000001",
      status: "selesai",
      createdAt: "2026-08-10 05:00:00",
      itemName: "Nasi Ayam",
      qty: 3,
    });
    await seedOrder({
      code: "BB000002",
      status: "diproses",
      createdAt: "2026-08-11 05:00:00",
      itemName: "Nasi Ayam",
      qty: 2,
    });
    await seedOrder({
      code: "BB000003",
      status: "dibatalkan",
      createdAt: "2026-08-12 05:00:00",
      itemName: "Nasi Ayam",
      qty: 9,
    });
    const top = await topOrderItemsBetween(env.DB, 1, "2026-08-01", "2026-08-31", 5);
    expect(top[0]).toEqual({ name: "Nasi Ayam", qty: 5 });
  });

  it("peak hour is reported in WIB", async () => {
    await seedOrder({ code: "CC000001", status: "selesai", createdAt: "2026-08-10 05:00:00" });
    await seedOrder({ code: "CC000002", status: "selesai", createdAt: "2026-08-11 05:30:00" });
    const peak = await peakOrderHourBetween(env.DB, 1, "2026-08-01", "2026-08-31");
    expect(peak?.hour).toBe(12);
    expect(peak?.count).toBe(2);
  });

  it("platform counts span all tenants", async () => {
    await seedOrder({
      code: "DD000001",
      tenantId: 1,
      status: "selesai",
      createdAt: "2026-08-10 05:00:00",
    });
    await seedOrder({
      code: "DD000002",
      tenantId: 2,
      status: "selesai",
      createdAt: "2026-08-10 05:00:00",
    });
    const counts = await platformOrderCountsBetween(env.DB, "2026-08-01", "2026-08-31");
    expect(counts.masuk).toBe(2);
    expect(counts.selesai).toBe(2);
  });
});
