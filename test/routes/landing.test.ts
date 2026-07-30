import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "@/index";

async function send(request: Request): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

function daftarMitra(values: Record<string, string>, ip: string): Promise<Response> {
  return send(
    new Request("https://tokoweb.id/mitra/daftar", {
      method: "POST",
      body: new URLSearchParams(values),
      headers: { origin: "https://tokoweb.id", "cf-connecting-ip": ip },
    }),
  );
}

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

  it("serves blog index with articles + CTA", async () => {
    const response = await get("/blog");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Cara Bikin Website Warung Makan");
    expect(html).toContain("/blog/cara-bikin-website-warung-makan");
    expect(html).toContain('rel="canonical"');
    expect(html).not.toContain("noindex");
  });

  it("serves a blog article with prose + Article json-ld", async () => {
    const response = await get("/blog/jualan-makanan-online-tanpa-aplikasi-ojol");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('class="prose"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain("tokoweb.id");
  });

  it("404 for unknown blog slug", async () => {
    expect((await get("/blog/tidak-ada-artikel")).status).toBe(404);
  });

  it("serves toko directory", async () => {
    const response = await get("/toko");
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Toko Bergabung");
  });

  it("sitemap lists apex, blog, toko", async () => {
    const response = await get("/sitemap.xml");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("xml");
    const xml = await response.text();
    expect(xml).toContain("https://tokoweb.id/blog");
    expect(xml).toContain("https://tokoweb.id/toko");
    expect(xml).toContain("https://tokoweb.id/blog/cara-bikin-website-warung-makan");
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

  it("mitra page has self-register form", async () => {
    const html = await (await get("/mitra")).text();
    expect(html).toContain('class="mitra-form"');
    expect(html).toContain('action="/mitra/daftar"');
  });

  it("registers mitra as pending, blocks duplicates, gates /r until approved", async () => {
    const ok = await daftarMitra(
      { name: "Bang Kurir", wa_number: "6289911223344", pin: "432198" },
      "9.9.9.1",
    );
    expect(ok.status).toBe(200);
    expect(await ok.text()).toContain("Terdaftar!");

    const row = await env.DB.prepare(
      "SELECT code, status FROM referrers WHERE wa_number = '6289911223344'",
    ).first<{ code: string; status: string }>();
    expect(row?.status).toBe("pending");

    const duplicate = await daftarMitra(
      { name: "Bang Kurir", wa_number: "6289911223344", pin: "432198" },
      "9.9.9.2",
    );
    expect(duplicate.status).toBe(409);

    const invalid = await daftarMitra({ name: "X", wa_number: "0812", pin: "12" }, "9.9.9.3");
    expect(invalid.status).toBe(400);

    const locked = await send(
      new Request(`https://tokoweb.id/r/${row?.code}`, {
        method: "POST",
        body: new URLSearchParams({ pin: "432198" }),
        headers: { origin: "https://tokoweb.id", "cf-connecting-ip": "9.9.9.4" },
      }),
    );
    expect(locked.status).toBe(403);
    expect(await locked.text()).toContain("belum aktif");

    await env.DB.prepare(
      "UPDATE referrers SET status = 'active' WHERE wa_number = '6289911223344'",
    ).run();
    const opened = await send(
      new Request(`https://tokoweb.id/r/${row?.code}`, {
        method: "POST",
        body: new URLSearchParams({ pin: "432198" }),
        headers: { origin: "https://tokoweb.id", "cf-connecting-ip": "9.9.9.5" },
      }),
    );
    expect(opened.status).toBe(200);
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
