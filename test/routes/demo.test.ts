import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "@/index";

const DEMO = "https://demo.tokoweb.id";

async function send(request: Request): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO referrers (id, code, name, wa_number, status, pin_hash) VALUES (1, 'K7M3XR', 'Pak Ojol', '6289900112233', 'active', 'x'), (2, 'MATIYA', 'Nonaktif', '6289900445566', 'inactive', 'x')",
  ).run();
});

describe("halaman demo kuliner", () => {
  it("renders demo with dummy data, switcher, and lead form", async () => {
    const response = await send(new Request(`${DEMO}/kuliner`));
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Warung Bu Sari");
    expect(html).toContain('class="demo-sws"');
    expect(html).toContain("/kuliner?tema=arang");
    expect(html).toContain("Coba nama usahamu");
    expect(html).toContain('action="/lead"');
    expect(html).toContain("Rp 75rb/bulan");
    expect(html).toContain('content="noindex"');
  });

  it("switches theme via query", async () => {
    const html = await (await send(new Request(`${DEMO}/kuliner?tema=arang`))).text();
    expect(html).toContain("#15130F");
  });

  it("records scan for valid active referrer only", async () => {
    await send(
      new Request(`${DEMO}/scan`, { method: "POST", body: JSON.stringify({ ref: "K7M3XR" }) }),
    );
    await send(
      new Request(`${DEMO}/scan`, { method: "POST", body: JSON.stringify({ ref: "MATIYA" }) }),
    );
    await send(
      new Request(`${DEMO}/scan`, { method: "POST", body: JSON.stringify({ ref: "SALAH1" }) }),
    );
    const scans = await env.DB.prepare(
      "SELECT referrer_id, COUNT(*) AS n FROM referrals WHERE tenant_id IS NULL GROUP BY referrer_id",
    ).all<{ referrer_id: number; n: number }>();
    expect(scans.results).toEqual([{ referrer_id: 1, n: 1 }]);
  });

  it("creates lead bound to referrer from ref code", async () => {
    const response = await send(
      new Request(`${DEMO}/lead`, {
        method: "POST",
        body: new URLSearchParams({
          name: "Bu Sari",
          business_name: "Warung Bu Sari",
          wa_number: "6281234567890",
          ref: "K7M3XR",
        }),
      }),
    );
    expect(response.status).toBe(200);
    const lead = await env.DB.prepare(
      "SELECT referrer_id, business_name, status FROM leads WHERE wa_number = '6281234567890'",
    ).first<{ referrer_id: number; business_name: string; status: string }>();
    expect(lead).toMatchObject({ referrer_id: 1, business_name: "Warung Bu Sari", status: "new" });
  });

  it("dedups lead by wa number — first ref wins", async () => {
    await send(
      new Request(`${DEMO}/lead`, {
        method: "POST",
        body: new URLSearchParams({
          name: "Bu Sari Lagi",
          business_name: "Warung Lain",
          wa_number: "6281234567890",
          ref: "MATIYA",
        }),
      }),
    );
    const leads = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM leads WHERE wa_number = '6281234567890'",
    ).first<{ n: number }>();
    expect(leads?.n).toBe(1);
    const lead = await env.DB.prepare(
      "SELECT referrer_id FROM leads WHERE wa_number = '6281234567890'",
    ).first<{ referrer_id: number }>();
    expect(lead?.referrer_id).toBe(1);
  });

  it("drops referrer attribution on self-referral wa number", async () => {
    await send(
      new Request(`${DEMO}/lead`, {
        method: "POST",
        body: new URLSearchParams({
          name: "Pak Ojol",
          business_name: "Usaha Ojol",
          wa_number: "6289900112233",
          ref: "K7M3XR",
        }),
      }),
    );
    const lead = await env.DB.prepare(
      "SELECT referrer_id FROM leads WHERE wa_number = '6289900112233'",
    ).first<{ referrer_id: number | null }>();
    expect(lead?.referrer_id).toBeNull();
  });

  it("rejects invalid wa number", async () => {
    const response = await send(
      new Request(`${DEMO}/lead`, {
        method: "POST",
        body: new URLSearchParams({
          name: "X",
          business_name: "Y",
          wa_number: "0812345",
        }),
      }),
    );
    expect(response.status).toBe(400);
  });
});

describe("halaman demo /menu", () => {
  it("renders full menu with categories and demo chrome", async () => {
    const response = await send(new Request(`${DEMO}/menu?tema=ceria`));
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Makanan");
    expect(html).toContain("Es Teh Manis");
    expect(html).toContain('class="demo-sws"');
  });
});
