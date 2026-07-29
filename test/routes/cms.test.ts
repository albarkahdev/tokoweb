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
  await env.DB.prepare(
    "INSERT INTO users (email, password_hash, role, tenant_id) VALUES ('boss@tokoweb.id', ?1, 'admin', NULL)",
  )
    .bind(await hashPassword("admin-kuat-123"))
    .run();
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

  it("shows quick actions on beranda", async () => {
    const body = await (await get("/")).text();
    expect(body).toContain('class="quick-grid"');
    expect(body).toContain("Edit Menu");
    expect(body).toContain("Pasang Promo");
    expect(body).toContain("Pratinjau");
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

  it("manages item: edit, special, deactivate, reactivate", async () => {
    const detail = await get("/menu/item?c=0&i=0");
    expect(detail.status).toBe(200);
    expect(await detail.text()).toContain("Ayam Bakar");

    const save = await post("/menu/item/simpan?c=0&i=0", {
      item_name: "Ayam Bakar Madu",
      price: "19000",
      desc: "Madu hutan asli",
    });
    expect(save.status).toBe(302);

    await post("/menu/item/spesial?c=0&i=0", {});
    let page = await (await get("/menu")).text();
    expect(page).toContain("Ayam Bakar Madu");
    expect(page).toContain("spesial ⭐");

    await post("/menu/item/status?c=0&i=0", {});
    page = await (await get("/menu")).text();
    expect(page).toContain(">nonaktif</span>");
    const site = await send(new Request("https://warung.tokoweb.id/"));
    expect(await site.text()).not.toContain("Ayam Bakar Madu");

    await post("/menu/item/status?c=0&i=0", {});
    page = await (await get("/menu")).text();
    expect(page).not.toContain(">nonaktif</span>");
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

  it("shows QR share card and preview button on home", async () => {
    const body = await (await get("/")).text();
    expect(body).toContain("api.qrserver.com");
    expect(body).toContain("warung.tokoweb.id");
    expect(body).toContain('href="/pratinjau"');
  });

  it("renders own site preview with all pages before publish", async () => {
    const home = await get("/pratinjau");
    expect(home.status).toBe(200);
    expect(home.headers.get("cache-control")).toBe("no-store");
    const body = await home.text();
    expect(body).toContain("Warung Bu Sari");
    expect(body).toContain('href="/pratinjau#menu"');

    const menu = await get("/pratinjau/menu");
    expect(menu.status).toBe(200);
    expect(await menu.text()).toContain("Makanan");
  });

  it("searchable theme picker shows tags and filter input", async () => {
    const body = await (await get("/tema")).text();
    expect(body).toContain("data-filter-cards");
    expect(body).toContain("data-filter-text");
    expect(body).toContain("mewah");
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

describe("Mode admin di CMS", () => {
  let adminCookie = "";

  it("admin without picked tenant is sent to login page", async () => {
    const login = await post("/masuk", { email: "boss@tokoweb.id", password: "admin-kuat-123" });
    expect(login.status).toBe(302);
    adminCookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";

    const home = await send(new Request(`${APP}/`, { headers: { cookie: adminCookie } }));
    expect(home.status).toBe(302);
    expect(home.headers.get("location")).toBe("/masuk");
  });

  it("admin enters tenant CMS via admin panel and can edit", async () => {
    const enter = await send(
      new Request(`${APP}/admin/tenant/1/cms`, {
        method: "POST",
        body: form({}),
        headers: { cookie: adminCookie, origin: APP },
      }),
    );
    expect(enter.status).toBe(302);
    expect(enter.headers.get("location")).toBe("/");
    const picked = (enter.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
    const combined = `${adminCookie}; ${picked}`;

    const home = await send(new Request(`${APP}/`, { headers: { cookie: combined } }));
    expect(home.status).toBe(200);
    const body = await home.text();
    expect(body).toContain("Mode Admin");
    expect(body).toContain("Warung Bu Sari");

    const save = await send(
      new Request(`${APP}/promo`, {
        method: "POST",
        body: form({ title: "Promo dari Admin", start_date: "2026-08-01", end_date: "2026-08-10" }),
        headers: { cookie: combined, origin: APP },
      }),
    );
    expect(save.status).toBe(302);

    const exit = await send(
      new Request(`${APP}/admin/tenant/1/cms/keluar`, { headers: { cookie: combined } }),
    );
    expect(exit.status).toBe(302);
    expect(exit.headers.get("location")).toBe("/admin/tenant/1");
  });
});

describe("Hardening R16", () => {
  it("sends anti-clickjacking + nosniff headers on login", async () => {
    const response = await send(new Request(`${APP}/masuk`));
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("revokes a session on logout so the old cookie stops working", async () => {
    await env.DB.prepare(
      "INSERT INTO users (email, password_hash, role, tenant_id) VALUES ('revoke@sari.id', ?1, 'owner', 1)",
    )
      .bind(await hashPassword("password-kuat"))
      .run();
    const login = await post("/masuk", { email: "revoke@sari.id", password: "password-kuat" });
    const c = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";

    const before = await send(new Request(`${APP}/`, { headers: { cookie: c } }));
    expect(before.status).toBe(200);

    const logout = await send(
      new Request(`${APP}/keluar`, { method: "POST", headers: { cookie: c, origin: APP } }),
    );
    expect(logout.status).toBe(302);

    const after = await send(new Request(`${APP}/`, { headers: { cookie: c } }));
    expect(after.status).toBe(302);
    expect(after.headers.get("location")).toBe("/masuk");
  });
});
