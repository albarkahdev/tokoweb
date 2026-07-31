import { type Context, Hono } from "hono";
import { createLead, findLeadByWa } from "@/db/leads";
import type { PublicSite } from "@/db/public-site";
import { recordScan } from "@/db/referrals";
import { findReferrerByCode } from "@/db/referrers";
import { formDataToValues } from "@/domain/cms";
import type { SiteContent } from "@/domain/content";
import {
  calculateOrderTotal,
  type Fulfillment,
  isFulfillment,
  type OrderStatus,
} from "@/domain/order";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import { isValidReferralCode } from "@/domain/referral-code";
import { addDays } from "@/domain/stats";
import { wibDateOf } from "@/domain/subscription";
import { verifyTurnstile } from "@/domain/turnstile";
import type { AppEnv } from "@/env";
import { orderDocument, parseCart, renderOrderPage, resolveLines } from "@/routes/tenant-order";
import { renderKulinerPage } from "@/themes/engine/render";
import type { PublicPagePath } from "@/themes/engine/types";
import { FEATURED_DEMO_THEME, isFeaturedTheme, KULINER_THEMES } from "@/themes/kuliner/configs";
import { DEMO_BUSINESS_NAME, DEMO_CONTENT } from "@/themes/kuliner/demo-content";
import { AppLayout } from "@/ui/app-layout";
import { demoChromeHtml } from "@/ui/demo-chrome";
import { Card, PageTitle, Text, TextLink } from "@/ui/display";
import { Button, Field, Form, HiddenInput } from "@/ui/form";
import { OrderStatusHint, OrderStatusView, OrderTopNav, PaymentPanel } from "@/ui/order";
import { TurnstileWidget } from "@/ui/turnstile-widget";

const DEMO_ORDER_SETTINGS = {
  enabled: true,
  cash: true,
  tax_percent: 0,
  fees: [{ label: "Kemasan", amount: 2000 }],
  min_order: 0,
  tables: 6,
};

const DEMO_NOTICE =
  "Ini demo — pesanan tidak benar-benar terkirim. Di websitemu, pesanan asli langsung masuk ke dashboard penjual & pembeli dapat link status.";

function demoSite(themeSlug: string): PublicSite {
  const content: SiteContent = { ...DEMO_CONTENT, order_settings: DEMO_ORDER_SETTINGS };
  return {
    tenantId: 0,
    slug: "demo",
    name: DEMO_BUSINESS_NAME,
    status: "active",
    themeSlug,
    tokens: {},
    content,
  };
}

function demoTheme(c: Context<AppEnv>): string {
  const requested = c.req.query("tema") ?? FEATURED_DEMO_THEME;
  return isFeaturedTheme(requested) ? requested : FEATURED_DEMO_THEME;
}

const leadLimiter = createFixedWindowLimiter(5, 60_000);
const scanLimiter = createFixedWindowLimiter(10, 60_000);

function renderDemoPage(
  themeSlug: string,
  baseDomain: string,
  todayWib: string,
  pagePath: PublicPagePath,
): string {
  const html = renderKulinerPage({
    site: {
      tenantId: 0,
      slug: "demo",
      name: DEMO_BUSINESS_NAME,
      status: "active",
      themeSlug,
      tokens: {},
      content: { ...DEMO_CONTENT, order_settings: DEMO_ORDER_SETTINGS },
    },
    promos: [
      {
        id: 0,
        tenant_id: 0,
        title: "Diskon 20% Menu Andalan",
        description: "Khusus minggu ini — contoh promo yang bisa kamu pasang sendiri dari HP.",
        image_key: null,
        start_date: todayWib,
        end_date: addDays(todayWib, 6),
      },
      {
        id: 0,
        tenant_id: 0,
        title: "Gratis Es Teh Tiap Pesan Paket Keluarga",
        description: "Minimal pesan 4 porsi, berlaku makan di tempat maupun dibungkus.",
        image_key: null,
        start_date: todayWib,
        end_date: addDays(todayWib, 13),
      },
      {
        id: 0,
        tenant_id: 0,
        title: "Paket Nasi Ayam Bakar + Es Jeruk cuma Rp 22.000",
        description: "Promo pembuka tiap hari sebelum jam 11 siang.",
        image_key: null,
        start_date: todayWib,
        end_date: addDays(todayWib, 20),
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
      {
        id: 0,
        tenant_id: 0,
        author_name: "Rina",
        body: "Lihat menunya dulu di website, sampai warung tinggal tunjuk. Praktis banget.",
        rating: 5,
        status: "approved",
        created_at: "",
      },
      {
        id: 0,
        tenant_id: 0,
        author_name: "Pak Dedi",
        body: "Rendangnya bener-bener kayak masakan rumah. Langganan tiap Jumat.",
        rating: 5,
        status: "approved",
        created_at: "",
      },
      {
        id: 0,
        tenant_id: 0,
        author_name: "Maya",
        body: "Pesan lewat WA dari websitenya, 15 menit langsung siap diambil. Mantap.",
        rating: 4,
        status: "approved",
        created_at: "",
      },
      {
        id: 0,
        tenant_id: 0,
        author_name: "Bang Jaka",
        body: "Tempatnya bersih, harga masuk akal, promonya sering. Rekomendasi!",
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
    pageQuery: `?tema=${themeSlug}`,
    homePath: "/kuliner",
  });
  return html.replace(
    "</body>",
    `${demoChromeHtml(
      Object.values(KULINER_THEMES),
      themeSlug,
      DEMO_BUSINESS_NAME,
      pagePath === "/" ? "/kuliner" : pagePath,
    )}</body>`,
  );
}

async function serveDemo(c: Context<AppEnv>, pagePath: PublicPagePath): Promise<Response> {
  const requested = c.req.query("tema") ?? FEATURED_DEMO_THEME;
  const themeSlug = isFeaturedTheme(requested) ? requested : FEATURED_DEMO_THEME;

  const cacheKey = `https://demo.${c.env.BASE_DOMAIN}/kuliner${pagePath}?tema=${themeSlug}&v=21`;
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
  .get("/", (c) => {
    const query = new URL(c.req.url).search;
    return c.redirect(`/kuliner${query}`);
  })
  .get("/kuliner", (c) => serveDemo(c, "/"))
  .get("/menu", (c) => serveDemo(c, "/menu"))
  .get("/galeri", (c) => serveDemo(c, "/galeri"))
  .get("/promo", (c) => serveDemo(c, "/promo"))
  .get("/testimoni", (c) => serveDemo(c, "/testimoni"))
  .get("/pesan", (c) => {
    const theme = demoTheme(c);
    return c.html(
      renderOrderPage(demoSite(theme), undefined, {
        homeHref: `/kuliner?tema=${theme}`,
        demoNotice: DEMO_NOTICE,
        formAction: "/pesan",
      }),
      200,
      { "cache-control": "no-store" },
    );
  })
  .post("/pesan", async (c) => {
    const theme = demoTheme(c);
    const site = demoSite(theme);
    const form = await c.req.formData();
    const cart = parseCart(String(form.get("cart") ?? "[]"));
    const { lines } = resolveLines(site, cart);
    if (lines.length === 0) return c.redirect(`/pesan?tema=${theme}`);
    const fRaw = String(form.get("fulfillment") ?? "");
    const fulfillment: Fulfillment = isFulfillment(fRaw) ? fRaw : "pickup";
    const cash = String(form.get("payment_mode") ?? "") === "cash";
    const totals = calculateOrderTotal(
      lines,
      DEMO_ORDER_SETTINGS.tax_percent,
      DEMO_ORDER_SETTINGS.fees,
    );
    return c.html(
      demoStatusPage(site, theme, {
        fulfillment,
        tableNo: String(form.get("table_no") ?? "").trim(),
        cash,
        status: cash ? "diproses" : "menunggu_bayar",
        lines,
        totals,
      }),
      200,
      { "cache-control": "no-store" },
    );
  })
  .post("/pesan/bayar", (c) => {
    const theme = demoTheme(c);
    return c.html(
      demoStatusPage(demoSite(theme), theme, {
        fulfillment: "pickup",
        tableNo: "",
        cash: false,
        status: "diproses",
        lines: [],
        totals: { subtotal: 0, tax_amount: 0, fee_amount: 0, total: 0 },
        paid: true,
      }),
      200,
      { "cache-control": "no-store" },
    );
  })
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
  .post("/daftar", async (c) => {
    const values = formDataToValues(await c.req.formData());
    return c.html(
      daftarPage(c.env.TURNSTILE_SITE_KEY, {
        name: (values.name ?? "").trim(),
        businessName: (values.business_name ?? "").trim(),
        waNumber: (values.wa_number ?? "").trim(),
        email: (values.email ?? "").trim(),
        ref: (values.ref ?? "").trim(),
      }),
    );
  })
  .post("/lead", async (c) => {
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    const values = formDataToValues(await c.req.formData());
    const name = (values.name ?? "").trim();
    const businessName = (values.business_name ?? "").trim();
    const waNumber = (values.wa_number ?? "").replace(/\D/g, "");
    const email = (values.email ?? "").trim();

    const humanOk = await verifyTurnstile(
      c.env.TURNSTILE_SECRET,
      values["cf-turnstile-response"] ?? "",
      c.req.header("cf-connecting-ip"),
    );
    if (!humanOk) {
      return c.html(thanksPage("Verifikasi anti-robot gagal. Coba lagi ya!"), 400);
    }

    if (
      !leadLimiter.allow(ip, Date.now()) ||
      !name ||
      name.length > 80 ||
      !businessName ||
      businessName.length > 80 ||
      !/^62\d{8,13}$/.test(waNumber) ||
      email.length > 120 ||
      (email !== "" && !email.includes("@"))
    ) {
      return c.html(
        thanksPage("Cek lagi: nama, nama usaha, no WA (awali 62), email yang benar."),
        400,
      );
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
        email: email || null,
        verticalSlug: "kuliner",
      });
    }
    return c.html(thanksPage());
  });

const DEMO_METHODS = [
  {
    id: 1,
    type: "transfer" as const,
    typeLabel: "Transfer Bank",
    label: "BCA (contoh)",
    imageSrc: null,
    lines: [
      { label: "Bank", value: "BCA" },
      { label: "No. Rekening", value: "1234567890" },
      { label: "Atas Nama", value: DEMO_BUSINESS_NAME },
    ],
  },
  {
    id: 2,
    type: "ewallet" as const,
    typeLabel: "E-Wallet",
    label: "GoPay (contoh)",
    imageSrc: null,
    lines: [{ label: "Nomor", value: "0812-3456-7890" }],
  },
];

function demoStatusPage(
  site: PublicSite,
  theme: string,
  o: {
    fulfillment: Fulfillment;
    tableNo: string;
    cash: boolean;
    status: OrderStatus;
    lines: { name: string; qty: number; unit_price: number; item_note: string | null }[];
    totals: { subtotal: number; tax_amount: number; fee_amount: number; total: number };
    paid?: boolean;
  },
): string {
  const homeHref = `/kuliner?tema=${theme}`;
  const body = (
    <>
      <OrderTopNav brand={DEMO_BUSINESS_NAME} homeHref={homeHref} />
      <div class="ord-status" style="padding-bottom:0">
        <div class="ord-demo-note">{DEMO_NOTICE}</div>
      </div>
      <OrderStatusView
        code="DEMO1234"
        status={o.status}
        cash={o.cash}
        customerName="Kamu (demo)"
        fulfillment={o.fulfillment}
        tableNo={o.tableNo || null}
        items={o.lines}
        subtotal={o.totals.subtotal}
        taxAmount={o.totals.tax_amount}
        feeAmount={o.totals.fee_amount}
        total={o.totals.total}
        createdLabel="baru saja (demo)"
        waReceiptHref="#"
        justCreated={!o.paid}
      >
        <OrderStatusHint status={o.status} cash={o.cash} fulfillment={o.fulfillment} />
        {o.status === "menunggu_bayar" ? (
          <PaymentPanel action="/pesan/bayar" methods={DEMO_METHODS} />
        ) : null}
      </OrderStatusView>
    </>
  );
  return orderDocument(site, DEMO_BUSINESS_NAME, body, []);
}

function daftarPage(
  siteKey: string | undefined,
  values: { name: string; businessName: string; waNumber: string; email: string; ref: string },
): string {
  return `<!doctype html>${String(
    <AppLayout title="Daftar — tokoweb" centered>
      <Card>
        <PageTitle>Satu langkah lagi 🎉</PageTitle>
        <Text muted>
          Cek datamu, lengkapi email, lalu kirim. Kami hubungi via WhatsApp hari ini juga.
        </Text>
        <Form action="/lead">
          <HiddenInput name="ref" value={values.ref} />
          <Field label="Nama kamu" name="name" value={values.name} required />
          <Field label="Nama usaha" name="business_name" value={values.businessName} required />
          <Field
            label="No WhatsApp"
            name="wa_number"
            value={values.waNumber}
            inputmode="numeric"
            required
            hint="Format 62xxxxxxxxxx"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={values.email}
            hint="Untuk kirim invoice & info penting"
          />
          <TurnstileWidget siteKey={siteKey} />
          <Button block>Kirim & Dihubungi →</Button>
        </Form>
        <Text small muted last>
          <TextLink href="/kuliner">← Kembali ke demo</TextLink>
        </Text>
      </Card>
    </AppLayout>,
  )}`;
}

function thanksPage(error?: string): string {
  return `<!doctype html>${String(
    <AppLayout title="Terima kasih — tokoweb">
      <Card>
        {error ? (
          <>
            <PageTitle>Ups!</PageTitle>
            <Text>{error}</Text>
            <Text last>
              <TextLink href="/kuliner">← Kembali ke demo</TextLink>
            </Text>
          </>
        ) : (
          <>
            <PageTitle>Siap! 🎉</PageTitle>
            <Text>
              Data kamu sudah masuk. Kami hubungi via WhatsApp hari ini juga untuk mulai bikin
              websitemu.
            </Text>
            <Text last>
              <TextLink href="/kuliner">← Kembali ke demo</TextLink>
            </Text>
          </>
        )}
      </Card>
    </AppLayout>,
  )}`;
}
