import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import app from "@/index";
import { renderKulinerPage } from "@/themes/engine/render";
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

  it("keeps ticker as welcome banner when no promos", () => {
    const html = renderKulinerPage({
      site: {
        tenantId: 1,
        slug: "warung-bu-sari",
        name: "Warung Bu Sari",
        status: "active",
        themeSlug: "hangat",
        tokens: {},
        content: KULINER_FIXTURE,
      },
      promos: [],
      testimonials: [],
      baseUrl: HOST,
      appBaseUrl: "https://app.tokoweb.id",
      path: "/",
      todayWib: "2026-07-29",
    });
    expect(html).toContain('<span class="promo-ticker">');
    expect(html).toContain("Selamat datang di Warung Bu Sari");
    expect(html).not.toContain('id="promo"');
  });

  it("promo cards open a detail popup with share button", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("data-pr=");
    expect(html).toContain('class="pr-open"');
    expect(html).toContain("Bagikan Promo");
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

  it("shows daily special section and hides inactive items", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("Spesial Hari Ini");
    expect(html).toContain("special-sec");
    expect(html).not.toContain("Menu Rahasia Lama");
    const menuPage = await (await get("/menu")).text();
    expect(menuPage).not.toContain("Menu Rahasia Lama");
  });

  it("menu cards carry popup data with up to 3 photos", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain("data-mi=");
    expect(html).toContain("mi-pop");
    expect(html).toContain("ayam-bakar-2.webp");
  });

  it("subpages show share button", async () => {
    const html = await (await get("/menu")).text();
    expect(html).toContain("data-share-title");
    expect(html).toContain("navigator.share");
  });

  it("renders sticky navbar with brand and section links", async () => {
    const html = await (await get("/")).text();
    expect(html).toContain('class="site-nav with-ticker"');
    expect(html).toContain('class="nav-brand"');
    expect(html).toContain('href="/#kontak"');
    expect(html).toContain('class="nav-wa"');
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

describe("tema kuliner — halaman galeri, promo, testimoni", () => {
  it("serves /galeri with all photos and back nav", async () => {
    const response = await get("/galeri");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('class="catnav subnav"');
    expect(html).toContain("← Beranda");
    expect(html).toContain('class="here"');
    expect(html).not.toContain('href="/menu"');
    expect(html).toContain('class="gallery-grid"');
    expect(html).toContain("<title>Warung Bu Sari — Galeri</title>");
  });

  it("serves /promo with all active promos", async () => {
    const response = await get("/promo");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Semua Promo");
    expect(html).toContain("Diskon Merdeka 20%");
  });

  it("serves /testimoni with approved testimonials only", async () => {
    const response = await get("/testimoni");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Ayam bakarnya juara!");
    expect(html).not.toContain("jangan tampil");
  });

  it("gallery lightbox has chevron prev/next arrows", async () => {
    const html = await (await get("/galeri")).text();
    expect(html).toContain("lb-prev");
    expect(html).toContain("lb-next");
    expect(html).toContain("\\u2039");
    expect(html).toContain("\\u203A");
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

  it("renders wave-2 themes with signature styles", async () => {
    const warisan = await (await get("/?preview_theme=warisan")).text();
    expect(warisan).toContain("#1B2A4A");
    expect(warisan).toContain('class="hero frame"');

    const retro = await (await get("/?preview_theme=retro")).text();
    expect(retro).toContain("repeating-conic-gradient");
    expect(retro).toContain("#E2711D");

    const mono = await (await get("/?preview_theme=mono")).text();
    expect(mono).toContain("#E11D2E");
    expect(mono).toContain("poster-echo");

    const lampion = await (await get("/?preview_theme=lampion")).text();
    expect(lampion).toContain("#8E1F1F");
    expect(lampion).toContain("menu-grid-2");

    const sketsa = await (await get("/?preview_theme=sketsa")).text();
    expect(sketsa).toContain("#22303C");
    expect(sketsa).toContain("dashed");
  });

  it("renders wave-3 themes with unique visual styles", async () => {
    const markers: Record<string, string[]> = {
      blueprint: ["#7FD1E8", "menu-magazine"],
      koran: ["#C0231B", "double"],
      aurora: ["backdrop-filter", "#7C5CFF"],
      piksel: ["#A3E635", "text-shadow"],
      disko: ["#FF4ECD", "poster-echo"],
      hutan: ["#B08D3F", 'class="hero split"'],
      mentega: ["#D9A404", "1.9rem 1.1rem"],
      kunyit: ["-webkit-text-stroke", "#D97706"],
      bara: ["api-pulse", "#FF6A1F"],
      jeruk: ["#FF7A00", "0.45rem 0 var(--text)"],
      merak: ["#0C4A50", "background-clip: text"],
      kabut: ["#B0806F", "0.34em"],
    };
    for (const [slug, expected] of Object.entries(markers)) {
      const html = await (await get(`/?preview_theme=${slug}`)).text();
      for (const marker of expected) {
        expect(html, `${slug} missing ${marker}`).toContain(marker);
      }
    }
  });

  it("renders wave-4 animated themes with motion signatures and reduced-motion guards", async () => {
    const markers: Record<string, string[]> = {
      sinar: ["sinar-shift", "#E8A020"],
      kunang: ["kunang-float", "#C6F432"],
      uap: ["uap-rise", "#7A5C43"],
      denyut: ["denyut-ring", "#2DE1C2"],
      melayang: ["melayang-idle", "#5B8DEF"],
      prisma: ["prisma-hue", "#8B5CF6"],
      loket: ["loket-chase", "#E8433F"],
      kilau: ["kilau-sweep", "#D4AF37"],
      lilin: ["lilin-flicker", "#E89B3C"],
      orbit: ["orbit-spin", "#FF6B6B"],
      gugur: ["gugur-jatuh", "#C05621"],
      sirup: ["sirup-morph", "#E84393"],
      jendela: ["jendela-sinar", "#A87C4F"],
      komet: ["komet-lintas", "#4F7CFF"],
      aksara: ["aksara-ketik", "#3B82F6"],
      karnaval: ["karnaval-kibar", "#E9484A"],
    };
    for (const [slug, expected] of Object.entries(markers)) {
      const html = await (await get(`/?preview_theme=${slug}`)).text();
      for (const marker of expected) {
        expect(html, `${slug} missing ${marker}`).toContain(marker);
      }
      expect(html, `${slug} missing reduced-motion guard`).toContain("prefers-reduced-motion");
    }
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
