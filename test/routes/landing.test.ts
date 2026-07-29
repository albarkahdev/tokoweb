import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "@/index";

async function get(path: string): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(new Request(`https://tokoweb.id${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

describe("landing tokoweb.id", () => {
  it("renders marketing page with pricing and demo link", async () => {
    const response = await get("/");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("75rb");
    expect(html).toContain("200rb");
    expect(html).toContain("https://demo.tokoweb.id/kuliner");
    expect(html).toContain("Refund 7 hari");
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('rel="canonical"');
    expect(html).not.toContain("noindex");
  });

  it("promises 1 day and links login + mitra", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("≤ 1 hari");
    expect(html).not.toContain("3 hari");
    expect(html).toContain('href="https://app.tokoweb.id/masuk"');
    expect(html).toContain('href="/mitra"');
  });

  it("serves mitra page with commission info", async () => {
    const response = await get("/mitra");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Rp 150rb");
    expect(html).toContain("Rp 300rb");
    expect(html).toContain("Bukan");
    expect(html).toContain("tokoweb.id/r/KODEKAMU");
  });

  it("hero shows lampion-styled phone mockup", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain('class="pm-hero"');
    expect(html).toContain("Bakmi Lampion Jaya");
    expect(html).toContain("#A32626");
    expect(html).not.toContain("landing-shot.webp");
  });

  it("serves robots and sitemap", async () => {
    expect((await get("/robots.txt")).status).toBe(200);
    const sitemap = await get("/sitemap.xml");
    expect(await sitemap.text()).toContain("https://tokoweb.id/");
  });

  it("keeps 404 for unknown paths and /r page intact", async () => {
    expect((await get("/halaman-aneh")).status).toBe(404);
    expect((await get("/r/K7M3XR")).status).toBe(200);
  });
});
