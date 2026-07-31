import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import {
  cancelStaleNewOrders,
  cancelStaleUnpaidOrders,
  countOrdersByStatus,
  createOrder,
  findOrderByCode,
  getOrderById,
  listOrderItems,
  listOrders,
  saveOrderTransition,
  setOrderPayment,
} from "@/db/orders";
import {
  createPaymentMethod,
  listActivePaymentMethods,
  listPaymentMethods,
  setPaymentMethodActive,
} from "@/db/payment-methods";
import { applyTransition } from "@/domain/order";

beforeEach(async () => {
  await env.DB.exec("DELETE FROM order_items");
  await env.DB.exec("DELETE FROM orders");
  await env.DB.exec("DELETE FROM tenant_payment_methods");
  await env.DB.exec("DELETE FROM tenants");
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung', 1, 1, 'active'), (2, 'kedai', 'Kedai', 1, 1, 'active')",
  ).run();
});

function orderInput(code: string, tenantId = 1) {
  return {
    tenantId,
    code,
    customerName: "Budi",
    customerEmail: null,
    customerPhone: "628123",
    fulfillment: "dine_in" as const,
    tableNo: "5",
    cash: false,
    subtotal: 36000,
    taxAmount: 0,
    feeAmount: 2000,
    total: 38000,
    note: null,
    items: [
      { name: "Bakmi Ayam", category: "Makanan", unit_price: 18000, qty: 2, item_note: "pedas" },
    ],
  };
}

describe("orders db", () => {
  it("creates an order with items and reads it back", async () => {
    const order = await createOrder(env.DB, orderInput("ABC123XY"));
    expect(order.id).toBeGreaterThan(0);
    expect(order.status).toBe("baru");
    expect(order.total).toBe(38000);

    const items = await listOrderItems(env.DB, order.id);
    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe("Bakmi Ayam");
    expect(items[0]?.item_note).toBe("pedas");
  });

  it("finds by code scoped to tenant", async () => {
    await createOrder(env.DB, orderInput("SCOPED01", 1));
    expect(await findOrderByCode(env.DB, 1, "SCOPED01")).not.toBeNull();
    expect(await findOrderByCode(env.DB, 2, "SCOPED01")).toBeNull();
  });

  it("lists and counts by status", async () => {
    await createOrder(env.DB, orderInput("AAAA1111"));
    await createOrder(env.DB, orderInput("BBBB2222"));
    const all = await listOrders(env.DB, 1);
    expect(all).toHaveLength(2);
    expect(await countOrdersByStatus(env.DB, 1, ["baru"])).toBe(2);
    expect(await countOrdersByStatus(env.DB, 1, ["selesai"])).toBe(0);
  });

  it("persists a status transition with timestamps", async () => {
    const order = await createOrder(env.DB, orderInput("TRANS001"));
    const next = applyTransition(order, "menunggu_bayar", "2026-07-31T10:00:00Z");
    await saveOrderTransition(env.DB, order.id, 1, next);
    const reloaded = await getOrderById(env.DB, order.id, 1);
    expect(reloaded?.status).toBe("menunggu_bayar");
    expect(reloaded?.confirmed_at).toBe("2026-07-31T10:00:00Z");
  });

  it("auto-cancels stale unpaid orders past the cutoff", async () => {
    const fresh = await createOrder(env.DB, orderInput("FRESH001"));
    const stale = await createOrder(env.DB, orderInput("STALE001"));
    await env.DB.prepare(
      "UPDATE orders SET status = 'menunggu_bayar', created_at = '2020-01-01 00:00:00' WHERE id = ?1",
    )
      .bind(stale.id)
      .run();
    await env.DB.prepare("UPDATE orders SET status = 'menunggu_bayar' WHERE id = ?1")
      .bind(fresh.id)
      .run();

    const cancelled = await cancelStaleUnpaidOrders(env.DB, "2021-01-01 00:00:00");
    expect(cancelled).toBe(1);
    expect((await getOrderById(env.DB, stale.id, 1))?.status).toBe("dibatalkan");
    expect((await getOrderById(env.DB, fresh.id, 1))?.status).toBe("menunggu_bayar");
  });

  it("does not auto-cancel a freshly-confirmed order created long ago", async () => {
    const o = await createOrder(env.DB, orderInput("LATECNF1"));
    await env.DB.prepare(
      "UPDATE orders SET status='menunggu_bayar', created_at='2020-01-01 00:00:00', confirmed_at='2099-01-01 00:00:00' WHERE id=?1",
    )
      .bind(o.id)
      .run();
    const n = await cancelStaleUnpaidOrders(env.DB, "2021-01-01 00:00:00");
    expect(n).toBe(0);
    expect((await getOrderById(env.DB, o.id, 1))?.status).toBe("menunggu_bayar");
  });

  it("auto-cancels abandoned 'baru' orders past the new-order cutoff", async () => {
    const oldNew = await createOrder(env.DB, orderInput("OLDNEW01"));
    const freshNew = await createOrder(env.DB, orderInput("FRESHNW1"));
    await env.DB.prepare("UPDATE orders SET created_at='2020-01-01 00:00:00' WHERE id=?1")
      .bind(oldNew.id)
      .run();
    const n = await cancelStaleNewOrders(env.DB, "2021-01-01 00:00:00");
    expect(n).toBe(1);
    expect((await getOrderById(env.DB, oldNew.id, 1))?.status).toBe("dibatalkan");
    expect((await getOrderById(env.DB, freshNew.id, 1))?.status).toBe("baru");
  });

  it("records buyer payment method and proof", async () => {
    const methodId = await createPaymentMethod(env.DB, {
      tenantId: 1,
      type: "qris",
      label: "QRIS",
      detail: "{}",
      imageKey: null,
      sort: 0,
    });
    const order = await createOrder(env.DB, orderInput("PAY00001"));
    await setOrderPayment(
      env.DB,
      order.id,
      1,
      methodId,
      "t/warung/proof/x.webp",
      JSON.stringify({ type: "qris", label: "QRIS" }),
    );
    const reloaded = await getOrderById(env.DB, order.id, 1);
    expect(reloaded?.payment_method_id).toBe(methodId);
    expect(reloaded?.proof_key).toBe("t/warung/proof/x.webp");
    expect(reloaded?.payment_snapshot).toContain("QRIS");
  });
});

describe("payment methods db", () => {
  it("creates, lists active only, and toggles", async () => {
    const qrisId = await createPaymentMethod(env.DB, {
      tenantId: 1,
      type: "qris",
      label: "QRIS Warung",
      detail: "{}",
      imageKey: "t/warung/pay/qr.webp",
      sort: 0,
    });
    await createPaymentMethod(env.DB, {
      tenantId: 1,
      type: "transfer",
      label: "BCA",
      detail: JSON.stringify({ bank: "BCA", account_no: "123", account_name: "Budi" }),
      imageKey: null,
      sort: 1,
    });

    expect(await listPaymentMethods(env.DB, 1)).toHaveLength(2);
    expect(await listActivePaymentMethods(env.DB, 1)).toHaveLength(2);

    await setPaymentMethodActive(env.DB, qrisId, 1, false);
    expect(await listActivePaymentMethods(env.DB, 1)).toHaveLength(1);
  });

  it("scopes methods per tenant", async () => {
    await createPaymentMethod(env.DB, {
      tenantId: 2,
      type: "qris",
      label: "Lain",
      detail: "{}",
      imageKey: null,
      sort: 0,
    });
    expect(await listPaymentMethods(env.DB, 1)).toHaveLength(0);
    expect(await listPaymentMethods(env.DB, 2)).toHaveLength(1);
  });
});
