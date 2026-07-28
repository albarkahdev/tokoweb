import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "@/index";

const BROWSER_UA =
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36";

function trackRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("https://app.tokoweb.id/t", {
    method: "POST",
    body,
    headers: {
      "content-type": "text/plain",
      "user-agent": BROWSER_UA,
      origin: "https://warung.tokoweb.id",
      "cf-connecting-ip": "36.68.1.1",
      ...headers,
    },
  });
}

async function send(request: Request): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

async function eventCount(): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM track_events").first<{ n: number }>();
  return row?.n ?? 0;
}

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung Test', 1, 1, 'active'), (2, 'tutup', 'Warung Tutup', 1, 1, 'suspended')",
  ).run();
});

describe("POST /t", () => {
  it("records valid event and responds 204", async () => {
    const before = await eventCount();
    const response = await send(trackRequest(JSON.stringify({ t: "click_wa", p: "/", pid: null })));
    expect(response.status).toBe(204);
    expect(await eventCount()).toBe(before + 1);

    const row = await env.DB.prepare(
      "SELECT tenant_id, type, path, promo_id, visitor_hash FROM track_events ORDER BY id DESC LIMIT 1",
    ).first<{
      tenant_id: number;
      type: string;
      path: string;
      promo_id: number | null;
      visitor_hash: string;
    }>();
    expect(row).toMatchObject({ tenant_id: 1, type: "click_wa", path: "/", promo_id: null });
    expect(row?.visitor_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("drops bot user agents silently", async () => {
    const before = await eventCount();
    const response = await send(
      trackRequest(JSON.stringify({ t: "page_view", p: "/", pid: null }), {
        "user-agent": "Googlebot/2.1",
      }),
    );
    expect(response.status).toBe(204);
    expect(await eventCount()).toBe(before);
  });

  it("drops unknown origin silently", async () => {
    const before = await eventCount();
    const response = await send(
      trackRequest(JSON.stringify({ t: "page_view", p: "/", pid: null }), {
        origin: "https://attacker.com",
      }),
    );
    expect(response.status).toBe(204);
    expect(await eventCount()).toBe(before);
  });

  it("drops events for non-active tenant", async () => {
    const before = await eventCount();
    const response = await send(
      trackRequest(JSON.stringify({ t: "page_view", p: "/", pid: null }), {
        origin: "https://tutup.tokoweb.id",
      }),
    );
    expect(response.status).toBe(204);
    expect(await eventCount()).toBe(before);
  });

  it("drops malformed payload silently", async () => {
    const before = await eventCount();
    expect((await send(trackRequest("not-json"))).status).toBe(204);
    expect(
      (await send(trackRequest(JSON.stringify({ t: "click_tiktok", p: "/", pid: null })))).status,
    ).toBe(204);
    expect(await eventCount()).toBe(before);
  });

  it("drops oversized body silently", async () => {
    const before = await eventCount();
    const big = JSON.stringify({ t: "page_view", p: "/", pid: null, junk: "x".repeat(2000) });
    expect((await send(trackRequest(big))).status).toBe(204);
    expect(await eventCount()).toBe(before);
  });
});
