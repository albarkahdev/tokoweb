import { type Context, Hono } from "hono";
import { createLead, findLeadByWa } from "@/db/leads";
import { recordScan } from "@/db/referrals";
import { findReferrerByCode } from "@/db/referrers";
import { formDataToValues } from "@/domain/cms";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import { isValidReferralCode } from "@/domain/referral-code";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { renderKulinerPage } from "@/themes/engine/render";
import { KULINER_THEMES } from "@/themes/kuliner/configs";
import { DEMO_BUSINESS_NAME, DEMO_CONTENT } from "@/themes/kuliner/demo-content";
import { AppLayout } from "@/ui/app-layout";
import { demoChromeHtml } from "@/ui/demo-chrome";
import { Card } from "@/ui/display";

const leadLimiter = createFixedWindowLimiter(5, 60_000);
const scanLimiter = createFixedWindowLimiter(10, 60_000);
const DEFAULT_THEME = "hangat";

function renderDemoPage(
  themeSlug: string,
  baseDomain: string,
  todayWib: string,
  pagePath: "/" | "/menu",
): string {
  const html = renderKulinerPage({
    site: {
      tenantId: 0,
      slug: "demo",
      name: DEMO_BUSINESS_NAME,
      status: "active",
      themeSlug,
      tokens: {},
      content: DEMO_CONTENT,
    },
    promos: [
      {
        id: 0,
        tenant_id: 0,
        title: "Diskon 20% Menu Andalan",
        description: "Khusus minggu ini — contoh promo yang bisa kamu pasang sendiri.",
        image_key: null,
        start_date: todayWib,
        end_date: todayWib,
      },
    ],
    testimonials: [
      {
        id: 0,
        tenant_id: 0,
        author_name: "Budi",
        body: "Ayam bakarnya juara, websitenya bikin gampang pesan!",
        rating: 5,
        status: "approved",
        created_at: "",
      },
    ],
    baseUrl: `https://demo.${baseDomain}`,
    appBaseUrl: `https://app.${baseDomain}`,
    path: pagePath,
    todayWib,
    noindex: true,
  });
  return html.replace(
    "</body>",
    `${demoChromeHtml(Object.values(KULINER_THEMES), themeSlug, DEMO_BUSINESS_NAME)}</body>`,
  );
}

async function serveDemo(c: Context<AppEnv>, pagePath: "/" | "/menu"): Promise<Response> {
  const requested = c.req.query("tema") ?? DEFAULT_THEME;
  const themeSlug = requested in KULINER_THEMES ? requested : DEFAULT_THEME;

  const cacheKey = `https://demo.${c.env.BASE_DOMAIN}/kuliner${pagePath}?tema=${themeSlug}&v=4`;
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const html = renderDemoPage(themeSlug, c.env.BASE_DOMAIN, wibDateOf(Date.now()), pagePath);
  const response = new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=86400",
    },
  });
  c.executionCtx.waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
}

export const demo = new Hono<AppEnv>()
  .get("/kuliner", (c) => serveDemo(c, "/"))
  .get("/menu", (c) => serveDemo(c, "/menu"))
  .post("/scan", async (c) => {
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    if (!scanLimiter.allow(ip, Date.now())) return c.body(null, 204);
    try {
      const body = (await c.req.json()) as { ref?: unknown };
      const code = String(body.ref ?? "").toUpperCase();
      if (!isValidReferralCode(code)) return c.body(null, 204);
      const referrer = await findReferrerByCode(c.env.DB, code);
      if (referrer && referrer.status === "active") {
        c.executionCtx.waitUntil(recordScan(c.env.DB, referrer.id));
      }
    } catch {}
    return c.body(null, 204);
  })
  .post("/lead", async (c) => {
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    const values = formDataToValues(await c.req.formData());
    const name = (values.name ?? "").trim();
    const businessName = (values.business_name ?? "").trim();
    const waNumber = (values.wa_number ?? "").replace(/\D/g, "");

    if (
      !leadLimiter.allow(ip, Date.now()) ||
      !name ||
      !businessName ||
      !/^62\d{8,13}$/.test(waNumber)
    ) {
      return c.html(thanksPage("Nomor WA harus diawali 62. Coba lagi ya!"), 400);
    }

    const existing = await findLeadByWa(c.env.DB, waNumber);
    if (!existing) {
      let referrerId: number | null = null;
      const code = (values.ref ?? "").toUpperCase();
      if (isValidReferralCode(code)) {
        const referrer = await findReferrerByCode(c.env.DB, code);
        if (referrer && referrer.status === "active" && referrer.wa_number !== waNumber) {
          referrerId = referrer.id;
        }
      }
      await createLead(c.env.DB, {
        referrerId,
        name,
        businessName,
        waNumber,
        verticalSlug: "kuliner",
      });
    }
    return c.html(thanksPage());
  });

function thanksPage(error?: string): string {
  return `<!doctype html>${String(
    <AppLayout title="Terima kasih — tokoweb">
      <Card>
        {error ? (
          <>
            <h1>Ups!</h1>
            <p>{error}</p>
            <p>
              <a href="/kuliner">← Kembali ke demo</a>
            </p>
          </>
        ) : (
          <>
            <h1>Siap! 🎉</h1>
            <p>
              Data kamu sudah masuk. Kami hubungi via WhatsApp hari ini juga untuk mulai bikin
              websitemu.
            </p>
            <p>
              <a href="/kuliner">← Kembali ke demo</a>
            </p>
          </>
        )}
      </Card>
    </AppLayout>,
  )}`;
}
