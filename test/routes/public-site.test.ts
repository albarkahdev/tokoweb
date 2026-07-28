import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { invalidateTenantCache } from "@/db/edge-cache";
import app from "@/index";

async function get(url: string): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(new Request(url), env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

const CONTENT = {
  info: {
    name: "Warung Bu Sari",
    tagline: "Masakan rumahan sejak 1998",
    address: "Jl. Melati No. 3, Bandung",
    wa_number: "6281234567890",
  },
};

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO themes (id, vertical_id, slug, name, tokens, status) VALUES (1, 1, 'sederhana', 'Sederhana', '{}', 'active')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, custom_domain, name, vertical_id, theme_id, status) VALUES " +
      "(1, 'warung-bu-sari', 'warungbusari.com', 'Warung Bu Sari', 1, 1, 'active'), " +
      "(2, 'tutup', NULL, 'Warung Tutup', 1, 1, 'suspended'), " +
      "(3, 'rahasia', NULL, 'Belum Jadi', 1, 1, 'draft')",
  ).run();
  await env.DB.prepare("INSERT INTO contents (tenant_id, data) VALUES (1, ?1)")
    .bind(JSON.stringify(CONTENT))
    .run();
});

describe("public site", () => {
  it("renders active tenant with content", async () => {
    const response = await get("https://warung-bu-sari.tokoweb.id/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Warung Bu Sari");
    expect(html).toContain("Masakan rumahan sejak 1998");
    expect(html).toContain("https://wa.me/6281234567890");
  });

  it("serves custom domain from same tenant", async () => {
    const response = await get("https://warungbusari.com/");
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Warung Bu Sari");
  });

  it("serves second request from cache without touching DB", async () => {
    await get("https://warung-bu-sari.tokoweb.id/");
    await env.DB.prepare("UPDATE contents SET data = ?1 WHERE tenant_id = 1")
      .bind(JSON.stringify({ info: { name: "Nama Baru" } }))
      .run();

    const cached = await get("https://warung-bu-sari.tokoweb.id/");
    expect(await cached.text()).toContain("Warung Bu Sari");
  });

  it("re-renders after invalidateTenantCache", async () => {
    await invalidateTenantCache(["warung-bu-sari.tokoweb.id"]);
    const response = await get("https://warung-bu-sari.tokoweb.id/");
    expect(await response.text()).toContain("Nama Baru");
  });

  it("renders suspended page for suspended tenant", async () => {
    const response = await get("https://tutup.tokoweb.id/");
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("sementara nonaktif");
  });

  it("hides draft tenant", async () => {
    const response = await get("https://rahasia.tokoweb.id/");
    expect(response.status).toBe(404);
  });

  it("returns 404 for unknown tenant", async () => {
    const response = await get("https://tidak-ada.tokoweb.id/");
    expect(response.status).toBe(404);
  });
});
