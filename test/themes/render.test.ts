import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "@/index";
import { KULINER_FIXTURE } from "../fixtures/kuliner";

const HOST = "https://warung-bu-sari.tokoweb.id";

async function get(path: string): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await app.fetch(new Request(`${HOST}${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

beforeAll(async () => {
  await env.DB.prepare(
    "INSERT INTO tenants (id, slug, name, vertical_id, theme_id, status) VALUES (1, 'warung-bu-sari', 'Warung Bu Sari', 1, 1, 'active')",
  ).run();
  await env.DB.prepare("INSERT INTO contents (tenant_id, data) VALUES (1, ?1)")
    .bind(JSON.stringify(KULINER_FIXTURE))
    .run();
  await env.DB.prepare(
    "INSERT INTO promos (tenant_id, title, description, start_date, end_date) VALUES (1, 'Diskon Merdeka 20%', 'Semua menu', '2020-01-01', '2099-12-31')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO promos (tenant_id, title, start_date, end_date) VALUES (1, 'Promo Kadaluarsa', '2020-01-01', '2020-01-31')",
  ).run();
  await env.DB.prepare(
    "INSERT INTO testimonials (tenant_id, author_name, body, rating, status) VALUES (1, 'Budi', 'Ayam bakarnya juara!', 5, 'approved'), (1, 'Spam', 'jangan tampil', NULL, 'pending')",
  ).run();
});

describe("tema kuliner — halaman utama", () => {
  it("renders all mandatory sections", async () => {
    const response = await get("/");
    expect(response.status).toBe(200);
    const html = await response.text();
    for (const marker of [
      'id="hero"',
      'id="menu"',
      'id="jam"',
      'id="galeri"',
      'id="kontak"',
      "tokoweb.id",
      "Warung Bu Sari",
      "Masakan rumahan sejak 1998",
    ]) {
      expect(html).toContain(marker);
    }
  });

  it("shows featured menu with WA ask links and Rp prices", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("Nasi Ayam Bakar");
    expect(html).toContain("Rp 18.000");
    expect(html).toContain("https://wa.me/6281234567890?text=");
    expect(html).toContain("favorit");
    expect(html).toContain('data-track="click_wa"');
  });

  it("links to full menu because items exceed 7", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain('href="/menu"');
    expect(html).toContain("9 item");
  });

  it("shows only active promo with tracker id", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("Diskon Merdeka 20%");
    expect(html).not.toContain("Promo Kadaluarsa");
    expect(html).toContain('data-track="click_promo"');
  });

  it("shows only approved testimonials", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("Ayam bakarnya juara!");
    expect(html).not.toContain("jangan tampil");
  });

  it("includes SEO: title, meta, og:image, JSON-LD, canonical", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("<title>Warung Bu Sari — Masakan rumahan sejak 1998</title>");
    expect(html).toContain('property="og:image"');
    expect(html).toContain("application/ld+json");
    expect(html).toContain('"@type":"Restaurant"');
    expect(html).toContain('rel="canonical"');
    expect(html).not.toContain('name="robots"');
  });

  it("shows sticky promo ticker linking to promo section", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain('class="promo-ticker"');
    expect(html).toContain('href="#promo"');
    expect(html).toContain("Diskon Merdeka 20%");
  });

  it("embeds gallery lightbox script", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("lightbox");
    expect(html).toContain("lb-close");
  });

  it("renders rich contact card with hours, phone, and instagram", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("Jam buka hari ini");
    expect(html).toContain('class="c-row"');
    expect(html).toContain("Chat WhatsApp");
  });

  it("renders testimonials in a grid", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain('class="testi-grid"');
  });

  it("embeds tracker beacon and open-now script", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("sendBeacon");
    expect(html).toContain("https://app.tokoweb.id/t");
    expect(html).toContain("Asia/Jakarta");
    expect(html).toContain("data-hours");
  });
});

describe("tema kuliner — halaman /menu", () => {
  it("renders all categories with sticky nav", async () => {
    const response = await get("/menu");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Makanan");
    expect(html).toContain("Minuman");
    expect(html).toContain('class="catnav"');
    expect(html).toContain("Es Teh Manis");
  });
});

describe("tema kuliner — preview & switcher", () => {
  it("previews another theme without caching, with noindex", async () => {
    const response = await get("/?preview_theme=arang");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const html = await response.text();
    expect(html).toContain("#15130F");
    expect(html).toContain('name="robots" content="noindex"');
  });

  it("each theme applies its own primary color", async () => {
    const hangat = await (await get("/?preview_theme=hangat")).text();
    const arang = await (await get("/?preview_theme=arang")).text();
    const ceria = await (await get("/?preview_theme=ceria")).text();
    expect(hangat).toContain("#C4501B");
    expect(arang).toContain("#C9A227");
    expect(ceria).toContain("#FF6B57");
  });

  it("renders 5 bold themes with their signature layouts", async () => {
    const neon = await (await get("/?preview_theme=neon")).text();
    expect(neon).toContain("#FF3D8A");
    expect(neon).toContain("poster-echo");

    const pasar = await (await get("/?preview_theme=pasar")).text();
    expect(pasar).toContain("#FFD335");
    expect(pasar).toContain("menu-polaroid");

    const kertas = await (await get("/?preview_theme=kertas")).text();
    expect(kertas).toContain('class="hero frame"');

    const tropis = await (await get("/?preview_theme=tropis")).text();
    expect(tropis).toContain('class="hero split"');
    expect(tropis).toContain("hero-side");

    const batik = await (await get("/?preview_theme=batik")).text();
    expect(batik).toContain("menu-magazine");
    expect(batik).toContain("#3F4C8A");
  });

  it("ignores unknown preview theme and serves cacheable default", async () => {
    const response = await get("/?preview_theme=tidak-ada");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).not.toBe("no-store");
  });

  it("robots.txt and sitemap.xml exist", async () => {
    expect((await get("/robots.txt")).status).toBe(200);
    const sitemap = await get("/sitemap.xml");
    expect(sitemap.status).toBe(200);
    expect(await sitemap.text()).toContain("warung-bu-sari.tokoweb.id");
  });
});
