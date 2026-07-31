import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword } from "@/domain/password";
import app from "@/index";

const APP = "https://app.tokoweb.id";
let cookie = "";

async function send(request: Request): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

async function post(path: string, values: Record<string, string>): Promise<Response> {
  return send(
    new Request(`${APP}${path}`, {
      method: "POST",
      body: new URLSearchParams(values),
      headers: { cookie, origin: APP },
    }),
  );
}

async function get(path: string): Promise<Response> {
  return send(new Request(`${APP}${path}`, { headers: { cookie } }));
}

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung Order', 1, 1, 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO subscriptions (tenant_id, plan, monthly_price, next_due_date, status) VALUES (1, 'basic', 75000, '2026-12-01', 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO users (email, password_hash, role, tenant_id) VALUES ('bu@sari.id', ?1, 'owner', 1)",
  )
    .bind(await hashPassword("password-kuat"))
    .run();
  await env.DB.prepare("INSERT INTO contents (tenant_id, data) VALUES (1, ?1)")
    .bind(
      JSON.stringify({
        info: { name: "Warung Order", wa_number: "628123" },
        menu: [{ category: "Makanan", items: [{ name: "Bakmi", price: 18000 }] }],
      }),
    )
    .run();
  await env.DB.prepare(
    "INSERT INTO orders (id, tenant_id, code, customer_name, fulfillment, table_no, status, subtotal, tax_amount, fee_amount, total) VALUES (1, 1, 'ORDER001', 'Budi', 'dine_in', '3', 'baru', 36000, 0, 2000, 38000)",
  ).run();
  await env.DB.prepare(
    "INSERT INTO order_items (order_id, name, category, unit_price, qty, item_note) VALUES (1, 'Bakmi', 'Makanan', 18000, 2, 'pedas')",
  ).run();

  const login = await post("/masuk", { email: "bu@sari.id", password: "password-kuat" });
  cookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
});

describe("CMS pesanan", () => {
  it("shows the inbox with the actionable order", async () => {
    const html = await (await get("/pesanan")).text();
    expect(html).toContain("ORDER001");
    expect(html).toContain("Perlu ditangani");
    expect(html).toContain("data-actionable");
  });

  it("shows order detail with items", async () => {
    const html = await (await get("/pesanan/ORDER001")).text();
    expect(html).toContain("Budi");
    expect(html).toContain("Bakmi");
    expect(html).toContain("pedas");
  });

  it("runs the state machine via actions", async () => {
    const confirm = await post("/pesanan/ORDER001/konfirmasi", {});
    expect(confirm.status).toBe(302);
    const afterConfirm = await env.DB.prepare(
      "SELECT status, confirmed_at FROM orders WHERE id = 1",
    ).first<{ status: string; confirmed_at: string }>();
    expect(afterConfirm?.status).toBe("menunggu_bayar");
    expect(afterConfirm?.confirmed_at).not.toBeNull();

    await env.DB.prepare(
      "UPDATE orders SET status = 'cek_bayar', paid_at = '2026-07-31T10:00:00' WHERE id = 1",
    ).run();
    await post("/pesanan/ORDER001/verifikasi", {});
    const afterVerify = await env.DB.prepare(
      "SELECT status, verified_at FROM orders WHERE id = 1",
    ).first<{ status: string; verified_at: string }>();
    expect(afterVerify?.status).toBe("diproses");
    expect(afterVerify?.verified_at).not.toBeNull();
  });

  it("rejects an illegal action", async () => {
    const res = await post("/pesanan/ORDER001/konfirmasi", {});
    expect(res.headers.get("location")).toContain("err=");
  });

  it("renders a printable invoice", async () => {
    const html = await (await get("/pesanan/ORDER001/invoice")).text();
    expect(html).toContain("Warung Order");
    expect(html).toContain("#ORDER001");
    expect(html).toContain("Rp 38.000");
    expect(html).toContain("window.print()");
  });

  it("saves order settings", async () => {
    const res = await post("/pesanan/setelan", {
      enabled: "on",
      tax_percent: "10",
      min_order: "20000",
      tables: "5",
      fee_label_0: "Kemasan",
      fee_amount_0: "2000",
    });
    expect(res.status).toBe(302);
    const row = await env.DB.prepare("SELECT data FROM contents WHERE tenant_id = 1").first<{
      data: string;
    }>();
    const settings = JSON.parse(row?.data ?? "{}").order_settings;
    expect(settings.enabled).toBe(true);
    expect(settings.tax_percent).toBe(10);
    expect(settings.tables).toBe(5);
    expect(settings.fees).toEqual([{ label: "Kemasan", amount: 2000 }]);
  });

  it("adds a payment method", async () => {
    await post("/pesanan/metode", {
      type: "transfer",
      label: "BCA",
      bank: "BCA",
      account_no: "12345",
      account_name: "Budi",
    });
    const html = await (await get("/pesanan/setelan")).text();
    expect(html).toContain("BCA");
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM tenant_payment_methods WHERE tenant_id = 1",
    ).first<{ n: number }>();
    expect(count?.n).toBe(1);
  });

  it("toggles menu item availability (habis)", async () => {
    const res = await post("/menu/item/stok?c=0&i=0", {});
    expect(res.status).toBe(302);
    const row = await env.DB.prepare("SELECT data FROM contents WHERE tenant_id = 1").first<{
      data: string;
    }>();
    expect(JSON.parse(row?.data ?? "{}").menu[0].items[0].available).toBe(false);
  });

  it("shows table QR codes", async () => {
    const html = await (await get("/pesanan/meja")).text();
    expect(html).toContain("Meja 1");
    expect(html).toContain("Meja 5");
    expect(html).toContain("pesan?meja=1");
  });
});
