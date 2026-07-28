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

function form(values: Record<string, string>): URLSearchParams {
  return new URLSearchParams(values);
}

async function post(path: string, values: Record<string, string>): Promise<Response> {
  return send(
    new Request(`${APP}${path}`, {
      method: "POST",
      body: form(values),
      headers: { cookie, origin: APP },
    }),
  );
}

async function get(path: string): Promise<Response> {
  return send(new Request(`${APP}${path}`, { headers: { cookie } }));
}

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung Bu Sari', 1, 1, 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO subscriptions (tenant_id, plan, monthly_price, next_due_date, status) VALUES (1, 'basic', 75000, '2026-12-01', 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO users (email, password_hash, role, tenant_id) VALUES ('bu@sari.id', ?1, 'owner', 1)",
  )
    .bind(await hashPassword("password-kuat"))
    .run();
  await env.DB.prepare(
    "INSERT INTO testimonials (tenant_id, author_name, body, status) VALUES (1, 'Budi', 'Enak banget!', 'pending')",
  ).run();
});

describe("CMS klien", () => {
  it("redirects anonymous visitor to login", async () => {
    const response = await get("/");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/masuk");
  });

  it("rejects wrong password", async () => {
    const response = await post("/masuk", { email: "bu@sari.id", password: "salah" });
    expect(response.status).toBe(401);
  });

  it("logs in and shows subscription card", async () => {
    const login = await post("/masuk", { email: "bu@sari.id", password: "password-kuat" });
    expect(login.status).toBe(302);
    const setCookie = login.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("session=");
    cookie = setCookie.split(";")[0] ?? "";

    const home = await get("/");
    const body = await home.text();
    expect(home.status).toBe(200);
    expect(body).toContain("Warung Bu Sari");
    expect(body).toContain("LUNAS");
    expect(body).toContain("2026-12-01");
  });

  it("saves info usaha and purges public cache", async () => {
    const values: Record<string, string> = {
      name: "Warung Bu Sari",
      tagline: "Masakan rumahan sejak 1998",
      wa_number: "6281234567890",
    };
    for (const day of ["mon", "tue", "wed", "thu", "fri", "sat"]) {
      values[`${day}_open`] = "08:00";
      values[`${day}_close`] = "21:00";
    }
    values.sun_closed = "on";
    const response = await post("/info", values);
    expect(response.status).toBe(302);

    const site = await send(new Request("https://warung.tokoweb.id/"));
    expect(await site.text()).toContain("Masakan rumahan sejak 1998");
  });

  it("adds menu item and enforces featured limit", async () => {
    const add = await post("/menu", {
      category: "Makanan",
      item_name: "Ayam Bakar",
      price: "18000",
      featured: "on",
    });
    expect(add.status).toBe(302);

    for (let i = 0; i < 6; i++) {
      await post("/menu", {
        category: "Makanan",
        item_name: `Menu ${i}`,
        price: "10000",
        featured: "on",
      });
    }
    const overflow = await post("/menu", {
      category: "Makanan",
      item_name: "Kebanyakan",
      price: "10000",
      featured: "on",
    });
    expect(overflow.status).toBe(400);
  });

  it("creates promo and validates dates", async () => {
    const bad = await post("/promo", {
      title: "Promo Salah",
      start_date: "2026-08-07",
      end_date: "2026-08-01",
    });
    expect(bad.status).toBe(400);

    const good = await post("/promo", {
      title: "Diskon Merdeka",
      start_date: "2026-08-01",
      end_date: "2026-08-17",
    });
    expect(good.status).toBe(302);
    const list = await get("/promo");
    expect(await list.text()).toContain("Diskon Merdeka");
  });

  it("approves testimonial from pesan masuk", async () => {
    const pesan = await get("/pesan");
    expect(await pesan.text()).toContain("Enak banget!");

    const testimonial = await env.DB.prepare(
      "SELECT id FROM testimonials WHERE author_name = 'Budi'",
    ).first<{ id: number }>();
    const approve = await post("/pesan/setujui", { id: String(testimonial?.id) });
    expect(approve.status).toBe(302);

    const row = await env.DB.prepare("SELECT status FROM testimonials WHERE author_name = 'Budi'")
      .bind()
      .first<{ status: string }>();
    expect(row?.status).toBe("approved");
  });

  it("switches theme and updates tenant", async () => {
    const response = await post("/tema", { theme_id: "2" });
    expect(response.status).toBe(302);
    const tenant = await env.DB.prepare("SELECT theme_id FROM tenants WHERE id = 1").first<{
      theme_id: number;
    }>();
    expect(tenant?.theme_id).toBe(2);
  });

  it("shows statistik page with empty state", async () => {
    const response = await get("/statistik");
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Belum ada aktivitas");
  });

  it("blocks cross-origin writes", async () => {
    const response = await send(
      new Request(`${APP}/promo`, {
        method: "POST",
        body: form({ title: "X", start_date: "2026-08-01", end_date: "2026-08-02" }),
        headers: { cookie, origin: "https://jahat.com" },
      }),
    );
    expect(response.status).toBe(403);
  });
});
