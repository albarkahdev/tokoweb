import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { releaseMaturedFirstInstallments } from "@/db/payouts";
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
    "INSERT INTO users (email, password_hash, role, tenant_id) VALUES ('admin@tokoweb.id', ?1, 'admin', NULL)",
  )
    .bind(await hashPassword("admin-rahasia"))
    .run();
});

describe("admin panel — alur referral end-to-end", () => {
  it("blocks non-admin access", async () => {
    const response = await get("/admin");
    expect(response.status).toBe(302);
  });

  it("logs in as admin", async () => {
    const login = await post("/masuk", { email: "admin@tokoweb.id", password: "admin-rahasia" });
    expect(login.status).toBe(302);
    expect(login.headers.get("location")).toBe("/admin");
    cookie = (login.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
    const dashboard = await get("/admin");
    expect(dashboard.status).toBe(200);
  });

  it("registers referrer with code and pin", async () => {
    const response = await post("/admin/referrer", {
      name: "Pak Ojol",
      wa_number: "6289900112233",
      pin: "432198",
    });
    expect(response.status).toBe(302);
    const referrer = await env.DB.prepare("SELECT code, pin_hash FROM referrers LIMIT 1").first<{
      code: string;
      pin_hash: string;
    }>();
    expect(referrer?.code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(referrer?.pin_hash).toBeTruthy();
  });

  it("closes lead into tenant with 3 commission installments", async () => {
    const referrer = await env.DB.prepare("SELECT id FROM referrers LIMIT 1").first<{
      id: number;
    }>();
    await env.DB.prepare(
      "INSERT INTO leads (id, referrer_id, name, business_name, wa_number, vertical_slug) VALUES (10, ?1, 'Bu Sari', 'Warung Bu Sari', '6281234567890', 'kuliner')",
    )
      .bind(referrer?.id)
      .run();

    const response = await post("/admin/lead/closing", {
      lead_id: "10",
      slug: "warungbusari",
      plan: "basic",
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("Closing");

    const payouts = await env.DB.prepare(
      "SELECT installment, amount, status FROM commission_payouts ORDER BY installment",
    ).all<{ installment: number; amount: number; status: string }>();
    expect(payouts.results).toEqual([
      { installment: 1, amount: 50000, status: "pending" },
      { installment: 2, amount: 50000, status: "pending" },
      { installment: 3, amount: 50000, status: "pending" },
    ]);

    const lead = await env.DB.prepare("SELECT status FROM leads WHERE id = 10").first<{
      status: string;
    }>();
    expect(lead?.status).toBe("closed");
  });

  it("rejects self-referral closing", async () => {
    const referrer = await env.DB.prepare("SELECT id, wa_number FROM referrers LIMIT 1").first<{
      id: number;
      wa_number: string;
    }>();
    await env.DB.prepare(
      "INSERT INTO leads (id, referrer_id, name, business_name, wa_number, vertical_slug) VALUES (11, ?1, 'Curang', 'Usaha Curang', ?2, 'kuliner')",
    )
      .bind(referrer?.id, referrer?.wa_number)
      .run();
    const response = await post("/admin/lead/closing", {
      lead_id: "11",
      slug: "curang",
      plan: "basic",
    });
    expect(response.headers.get("location")).toContain("self-referral");
  });

  it("setup payment holds installment 1 pending until 7-day refund window passes", async () => {
    const tenant = await env.DB.prepare(
      "SELECT id FROM tenants WHERE slug = 'warungbusari'",
    ).first<{
      id: number;
    }>();
    const response = await post(`/admin/tenant/${tenant?.id}/bayar`, {
      kind: "setup",
      amount: "300000",
      period: "2026-07",
    });
    expect(response.status).toBe(302);

    let payout = await env.DB.prepare(
      "SELECT status FROM commission_payouts WHERE installment = 1",
    ).first<{ status: string }>();
    expect(payout?.status).toBe("pending");

    await releaseMaturedFirstInstallments(env.DB, "2999-01-01 00:00:00");
    payout = await env.DB.prepare(
      "SELECT status FROM commission_payouts WHERE installment = 1",
    ).first<{ status: string }>();
    expect(payout?.status).toBe("payable");
  });

  it("rejects a duplicate payment for the same period", async () => {
    const tenant = await env.DB.prepare(
      "SELECT id FROM tenants WHERE slug = 'warungbusari'",
    ).first<{ id: number }>();
    const dup = await post(`/admin/tenant/${tenant?.id}/bayar`, {
      kind: "setup",
      amount: "300000",
      period: "2026-07",
    });
    expect(dup.headers.get("location")).toContain("sudah pernah dicatat");
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM payments WHERE tenant_id = ?1 AND kind = 'setup' AND period = '2026-07'",
    )
      .bind(tenant?.id)
      .first<{ n: number }>();
    expect(count?.n).toBe(1);
  });

  it("goes live after content is curated", async () => {
    const tenant = await env.DB.prepare(
      "SELECT id FROM tenants WHERE slug = 'warungbusari'",
    ).first<{
      id: number;
    }>();
    await env.DB.prepare("INSERT INTO contents (tenant_id, data) VALUES (?1, ?2)")
      .bind(
        tenant?.id,
        JSON.stringify({ info: { name: "Warung Bu Sari", wa_number: "6281234567890" } }),
      )
      .run();

    const response = await post(`/admin/tenant/${tenant?.id}/golive`, {});
    expect(response.headers.get("location")).toContain("LIVE");

    const row = await env.DB.prepare("SELECT status FROM tenants WHERE id = ?1")
      .bind(tenant?.id)
      .first<{ status: string }>();
    expect(row?.status).toBe("active");
    const subscription = await env.DB.prepare(
      "SELECT next_due_date FROM subscriptions WHERE tenant_id = ?1",
    )
      .bind(tenant?.id)
      .first<{ next_due_date: string }>();
    expect(subscription?.next_due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("monthly payments 2 and 3 unlock installments 2 and 3", async () => {
    const tenant = await env.DB.prepare(
      "SELECT id FROM tenants WHERE slug = 'warungbusari'",
    ).first<{
      id: number;
    }>();
    await post(`/admin/tenant/${tenant?.id}/bayar`, {
      kind: "monthly",
      amount: "75000",
      period: "2026-08",
    });
    let payout = await env.DB.prepare(
      "SELECT status FROM commission_payouts WHERE installment = 2",
    ).first<{ status: string }>();
    expect(payout?.status).toBe("pending");

    await post(`/admin/tenant/${tenant?.id}/bayar`, {
      kind: "monthly",
      amount: "75000",
      period: "2026-09",
    });
    payout = await env.DB.prepare(
      "SELECT status FROM commission_payouts WHERE installment = 2",
    ).first<{ status: string }>();
    expect(payout?.status).toBe("payable");

    await post(`/admin/tenant/${tenant?.id}/bayar`, {
      kind: "monthly",
      amount: "75000",
      period: "2026-10",
    });
    payout = await env.DB.prepare(
      "SELECT status FROM commission_payouts WHERE installment = 3",
    ).first<{ status: string }>();
    expect(payout?.status).toBe("payable");
  });

  it("marks payout as paid from payout page", async () => {
    const payable = await env.DB.prepare(
      "SELECT id FROM commission_payouts WHERE status = 'payable' ORDER BY installment LIMIT 1",
    ).first<{ id: number }>();
    const response = await post("/admin/payout/paid", { id: String(payable?.id) });
    expect(response.status).toBe(302);
    const row = await env.DB.prepare("SELECT status, paid_at FROM commission_payouts WHERE id = ?1")
      .bind(payable?.id)
      .first<{ status: string; paid_at: string | null }>();
    expect(row?.status).toBe("paid");
    expect(row?.paid_at).toBeTruthy();
  });

  it("issues intake and set-password links", async () => {
    const tenant = await env.DB.prepare(
      "SELECT id FROM tenants WHERE slug = 'warungbusari'",
    ).first<{
      id: number;
    }>();
    const intake = await post(`/admin/tenant/${tenant?.id}/link-intake`, {});
    expect(intake.headers.get("location")).toContain("/intake/");

    const sandi = await post(`/admin/tenant/${tenant?.id}/link-sandi`, {
      email: "busari@gmail.com",
    });
    expect(sandi.headers.get("location")).toContain("/atur-sandi?token=");

    const owner = await env.DB.prepare(
      "SELECT role, tenant_id FROM users WHERE email = 'busari@gmail.com'",
    ).first<{ role: string; tenant_id: number }>();
    expect(owner?.role).toBe("owner");
    expect(owner?.tenant_id).toBe(tenant?.id);
  });

  it("refund voids unpaid installments and archives tenant", async () => {
    const tenant = await env.DB.prepare(
      "SELECT id FROM tenants WHERE slug = 'warungbusari'",
    ).first<{
      id: number;
    }>();
    const response = await post(`/admin/tenant/${tenant?.id}/refund`, {});
    expect(response.status).toBe(302);

    const statuses = await env.DB.prepare(
      "SELECT installment, status FROM commission_payouts ORDER BY installment",
    ).all<{ installment: number; status: string }>();
    const paid = statuses.results.filter((row) => row.status === "paid");
    const voided = statuses.results.filter((row) => row.status === "void");
    expect(paid.length + voided.length).toBe(3);
    expect(voided.length).toBeGreaterThan(0);

    const row = await env.DB.prepare("SELECT status FROM tenants WHERE id = ?1")
      .bind(tenant?.id)
      .first<{ status: string }>();
    expect(row?.status).toBe("archived");
  });
});
