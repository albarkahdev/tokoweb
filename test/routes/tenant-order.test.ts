import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "@/index";

async function get(url: string): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(new Request(url), env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

async function post(url: string, body: Record<string, string>): Promise<Response> {
  const ctx = createExecutionContext();
  const host = new URL(url).host;
  const response = await app.fetch(
    new Request(url, {
      method: "POST",
      body: new URLSearchParams(body),
      headers: { origin: `https://${host}`, "cf-connecting-ip": "5.5.5.5" },
    }),
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return response;
}

const CONTENT = {
  info: { name: "Warung Order", wa_number: "6281234567890" },
  order_settings: {
    enabled: true,
    cash: true,
    tax_percent: 10,
    fees: [{ label: "Kemasan", amount: 2000 }],
    min_order: 0,
    tables: 4,
  },
  menu: [
    {
      category: "Makanan",
      items: [
        { name: "Bakmi Ayam", price: 18000 },
        { name: "Menu Habis", price: 9000, available: false },
        { name: "Menu Off", price: 1000, active: false },
      ],
    },
  ],
};

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung Order', 1, 1, 'active'), (2, 'sepi', 'Warung Sepi', 1, 1, 'active')",
  ).run();
  await env.DB.prepare("INSERT INTO contents (tenant_id, data) VALUES (1, ?1)")
    .bind(JSON.stringify(CONTENT))
    .run();
  await env.DB.prepare("INSERT INTO contents (tenant_id, data) VALUES (2, ?1)")
    .bind(JSON.stringify({ info: { name: "Warung Sepi" } }))
    .run();
  await env.DB.prepare(
    "INSERT INTO tenant_payment_methods (id, tenant_id, type, label, detail, image_key, active, sort) VALUES (10, 1, 'transfer', 'BCA', ?1, NULL, 1, 0)",
  )
    .bind(JSON.stringify({ bank: "BCA", account_no: "123456", account_name: "Warung" }))
    .run();
});

describe("public ordering", () => {
  it("shows the order page when enabled", async () => {
    const res = await get("https://warung.tokoweb.id/pesan");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Bakmi Ayam");
    expect(html).toContain("window.__ORDER__");
    expect(html).toContain("Habis");
    expect(html).not.toContain("Menu Off");
  });

  it("404s when ordering disabled", async () => {
    expect((await get("https://sepi.tokoweb.id/pesan")).status).toBe(404);
  });

  it("creates an order with server-computed totals and redirects", async () => {
    const res = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Budi",
      fulfillment: "dine_in",
      table_no: "3",
      cart: JSON.stringify([{ c: 0, i: 0, qty: 2, note: "pedas" }]),
    });
    expect(res.status).toBe(302);
    const loc = res.headers.get("location") ?? "";
    expect(loc).toMatch(/^\/o\/[0-9A-Z]{8}\?baru=1$/);
    const code = loc.slice(3, 11);

    const row = await env.DB.prepare("SELECT * FROM orders WHERE code = ?1").bind(code).first<{
      subtotal: number;
      tax_amount: number;
      fee_amount: number;
      total: number;
      status: string;
      table_no: string;
    }>();
    expect(row?.subtotal).toBe(36000);
    expect(row?.tax_amount).toBe(3600);
    expect(row?.fee_amount).toBe(2000);
    expect(row?.total).toBe(41600);
    expect(row?.status).toBe("baru");
    expect(row?.table_no).toBe("3");
  });

  it("rejects a cart of only unavailable items", async () => {
    const res = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Budi",
      fulfillment: "pickup",
      cart: JSON.stringify([{ c: 0, i: 1, qty: 1 }]),
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("habis");
  });

  it("requires a table for dine-in", async () => {
    const res = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Budi",
      fulfillment: "dine_in",
      cart: JSON.stringify([{ c: 0, i: 0, qty: 1 }]),
    });
    expect(res.status).toBe(400);
  });

  it("lets the buyer pay after the merchant confirms", async () => {
    const create = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Sari",
      fulfillment: "pickup",
      cart: JSON.stringify([{ c: 0, i: 0, qty: 1 }]),
    });
    const code = (create.headers.get("location") ?? "").slice(3, 11);

    await env.DB.prepare(
      "UPDATE orders SET status = 'menunggu_bayar', confirmed_at = '2026-07-31T10:00:00' WHERE code = ?1",
    )
      .bind(code)
      .run();

    const view = await get(`https://warung.tokoweb.id/o/${code}`);
    const html = await view.text();
    expect(html).toContain("Pilih metode pembayaran");
    expect(html).toContain("BCA");

    const pay = await post(`https://warung.tokoweb.id/o/${code}/bayar`, {
      payment_method_id: "10",
    });
    expect(pay.status).toBe(302);

    const row = await env.DB.prepare(
      "SELECT status, payment_method_id, paid_at FROM orders WHERE code = ?1",
    )
      .bind(code)
      .first<{ status: string; payment_method_id: number; paid_at: string }>();
    expect(row?.status).toBe("cek_bayar");
    expect(row?.payment_method_id).toBe(10);
    expect(row?.paid_at).not.toBeNull();
  });

  it("creates a cash order that skips payment", async () => {
    const res = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Tunai",
      fulfillment: "pickup",
      payment_mode: "cash",
      cart: JSON.stringify([{ c: 0, i: 0, qty: 1 }]),
    });
    expect(res.status).toBe(302);
    const code = (res.headers.get("location") ?? "").slice(3, 11);
    const row = await env.DB.prepare("SELECT cash, status FROM orders WHERE code = ?1")
      .bind(code)
      .first<{ cash: number; status: string }>();
    expect(row?.cash).toBe(1);
    expect(row?.status).toBe("baru");
  });

  it("snapshots the payment destination on pay", async () => {
    const create = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Snap",
      fulfillment: "pickup",
      cart: JSON.stringify([{ c: 0, i: 0, qty: 1 }]),
    });
    const code = (create.headers.get("location") ?? "").slice(3, 11);
    await env.DB.prepare("UPDATE orders SET status = 'menunggu_bayar' WHERE code = ?1")
      .bind(code)
      .run();
    await post(`https://warung.tokoweb.id/o/${code}/bayar`, { payment_method_id: "10" });
    const row = await env.DB.prepare("SELECT payment_snapshot FROM orders WHERE code = ?1")
      .bind(code)
      .first<{ payment_snapshot: string }>();
    expect(row?.payment_snapshot).toContain("BCA");
    expect(row?.payment_snapshot).toContain("123456");
  });

  it("404s an unknown order code", async () => {
    expect((await get("https://warung.tokoweb.id/o/ZZZZZZZZ")).status).toBe(404);
  });

  it("order status page saves the code to local history", async () => {
    const create = await post("https://warung.tokoweb.id/pesan", {
      customer_name: "Riwayat",
      fulfillment: "pickup",
      cart: JSON.stringify([{ c: 0, i: 0, qty: 1 }]),
    });
    const code = (create.headers.get("location") ?? "").slice(3, 11);
    const html = await (await get(`https://warung.tokoweb.id/o/${code}`)).text();
    expect(html).toContain("tw_orders");
    expect(html).toContain(code);
  });

  it("shows a 'Pesanan Saya' page", async () => {
    const html = await (await get("https://warung.tokoweb.id/pesanan-saya")).text();
    expect(html).toContain("Pesanan Saya");
    expect(html).toContain("data-my-orders");
  });
});
