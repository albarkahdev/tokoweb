import { env } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { runDailyJobs } from "@/cron";

const NOW = Date.UTC(2026, 6, 29, 17, 30);

async function seedEvent(tenantId: number, type: string, visitor: string, ts: string) {
  await env.DB.prepare(
    "INSERT INTO track_events (tenant_id, type, path, promo_id, visitor_hash, ts) VALUES (?1, ?2, '/', NULL, ?3, ?4)",
  )
    .bind(tenantId, type, visitor, ts)
    .run();
}

async function statCount(tenantId: number, date: string, type: string): Promise<number | null> {
  const row = await env.DB.prepare(
    "SELECT count FROM daily_stats WHERE tenant_id = ?1 AND date = ?2 AND type = ?3",
  )
    .bind(tenantId, date, type)
    .first<{ count: number }>();
  return row?.count ?? null;
}

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO themes (id, vertical_id, slug, name, tokens, status) VALUES (1, 1, 'sederhana', 'Sederhana', '{}', 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung', 'Warung', 1, 1, 'active'), (2, 'kedai', 'Kedai', 1, 1, 'active')",
  ).run();

  await seedEvent(1, "page_view", "visitor-a", "2026-07-29 03:00:00");
  await seedEvent(1, "page_view", "visitor-a", "2026-07-29 04:00:00");
  await seedEvent(1, "page_view", "visitor-b", "2026-07-29 10:00:00");
  await seedEvent(1, "click_wa", "visitor-b", "2026-07-29 10:01:00");
  await seedEvent(2, "page_view", "visitor-c", "2026-07-29 12:00:00");
  await seedEvent(1, "page_view", "visitor-a", "2026-07-29 18:00:00");
  await seedEvent(1, "page_view", "visitor-old", "2026-04-01 00:00:00");
});

describe("runDailyJobs", () => {
  it("aggregates yesterday WIB per tenant and type", async () => {
    await runDailyJobs(env, NOW);

    expect(await statCount(1, "2026-07-29", "page_view")).toBe(3);
    expect(await statCount(1, "2026-07-29", "click_wa")).toBe(1);
    expect(await statCount(1, "2026-07-29", "unique_visitors")).toBe(2);
    expect(await statCount(2, "2026-07-29", "page_view")).toBe(1);
    expect(await statCount(2, "2026-07-29", "unique_visitors")).toBe(1);
  });

  it("excludes events outside the window", async () => {
    const outside = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM track_events WHERE ts >= '2026-07-29 17:00:00'",
    ).first<{ n: number }>();
    expect(outside?.n).toBe(1);
    expect(await statCount(1, "2026-07-30", "page_view")).toBeNull();
  });

  it("prunes raw events older than 90 days but keeps aggregates", async () => {
    const old = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM track_events WHERE visitor_hash = 'visitor-old'",
    ).first<{ n: number }>();
    expect(old?.n).toBe(0);
  });

  it("is idempotent on re-run", async () => {
    await runDailyJobs(env, NOW);
    expect(await statCount(1, "2026-07-29", "page_view")).toBe(3);
    expect(await statCount(1, "2026-07-29", "unique_visitors")).toBe(2);
  });
});
