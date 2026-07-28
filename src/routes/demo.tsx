import { Hono } from "hono";
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
import { Card } from "@/ui/display";

const leadLimiter = createFixedWindowLimiter(5, 60_000);
const scanLimiter = createFixedWindowLimiter(10, 60_000);
const DEFAULT_THEME = "hangat";

function demoChrome(activeTheme: string, _baseDomain: string): string {
  const switcher = Object.values(KULINER_THEMES)
    .map(
      (theme) =>
        `<a href="/kuliner?tema=${theme.slug}" class="demo-sw${theme.slug === activeTheme ? " on" : ""}">${theme.name}</a>`,
    )
    .join("");
  return `
<style>
.demo-top{position:fixed;top:0;left:0;right:0;z-index:60;background:#17141F;color:#fff;display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;font-family:system-ui,sans-serif;font-size:0.8rem;overflow-x:auto}
.demo-top strong{white-space:nowrap}
.demo-sw{color:#cbc6d6;text-decoration:none;padding:0.25rem 0.7rem;border-radius:9999px;border:1px solid #3a3547;white-space:nowrap}
.demo-sw.on{background:#fff;color:#17141F;font-weight:700}
.demo-name{margin-left:auto;display:flex;gap:0.35rem;align-items:center}
.demo-name input{border-radius:0.4rem;border:none;padding:0.3rem 0.5rem;font-size:0.8rem;width:9.5rem}
body{padding-top:2.9rem;padding-bottom:6.5rem}
.demo-cta{position:fixed;bottom:0;left:0;right:0;z-index:60;background:#17141F;color:#fff;padding:0.75rem;font-family:system-ui,sans-serif}
.demo-cta .inner{max-width:34rem;margin:0 auto}
.demo-cta p{margin:0 0 0.5rem;font-size:0.85rem}
.demo-cta form{display:flex;gap:0.4rem;flex-wrap:wrap}
.demo-cta input{flex:1 1 8rem;border-radius:0.4rem;border:none;padding:0.55rem 0.6rem;font-size:0.85rem}
.demo-cta button{background:#FF6B57;color:#fff;border:none;border-radius:0.4rem;padding:0.55rem 1rem;font-weight:700;cursor:pointer}
.wa-float{display:none}
</style>
<div class="demo-top">
  <strong>Coba tema:</strong>${switcher}
  <span class="demo-name"><input id="demo-name-input" placeholder="Coba nama usahamu…" maxlength="40"></span>
</div>
<div class="demo-cta">
  <div class="inner">
    <p><strong>Suka website ini?</strong> Punya versimu sendiri mulai Rp 75rb/bulan — jadi ≤ 3 hari.</p>
    <form method="post" action="/lead">
      <input name="name" placeholder="Namamu" required>
      <input name="business_name" id="demo-lead-business" placeholder="Nama usahamu" required>
      <input name="wa_number" placeholder="No WhatsApp (62…)" inputmode="tel" required>
      <input type="hidden" name="ref" id="demo-lead-ref">
      <button type="submit">Saya mau!</button>
    </form>
  </div>
</div>
<script>
(function(){
var params=new URLSearchParams(location.search);
var ref=params.get("ref");
if(ref&&/^[A-HJ-NP-Z2-9]{6}$/.test(ref.toUpperCase())){
  ref=ref.toUpperCase();
  localStorage.setItem("demo_ref",ref);
  if(!localStorage.getItem("demo_scan_"+ref)){
    localStorage.setItem("demo_scan_"+ref,"1");
    try{navigator.sendBeacon("/scan",JSON.stringify({ref:ref}))}catch(_){}
  }
}
var refField=document.getElementById("demo-lead-ref");
if(refField)refField.value=localStorage.getItem("demo_ref")||"";
var ORIGINAL=${JSON.stringify(DEMO_BUSINESS_NAME)};
function swap(name){
  var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  var node;
  while((node=walker.nextNode())){
    if(node.nodeValue.indexOf(ORIGINAL)!==-1)node.nodeValue=node.nodeValue.split(ORIGINAL).join(name);
  }
  document.title=document.title.split(ORIGINAL).join(name);
}
var input=document.getElementById("demo-name-input");
var saved=localStorage.getItem("demo_biz");
if(saved){input.value=saved;swap(saved)}
var biz=document.getElementById("demo-lead-business");
if(biz&&saved)biz.value=saved;
input.addEventListener("input",function(){
  var value=input.value.trim();
  if(!value)return;
  localStorage.setItem("demo_biz",value);
  swap(value);
  if(biz)biz.value=value;
});
})();
</script>`;
}

function renderDemoPage(themeSlug: string, baseDomain: string, todayWib: string): string {
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
    path: "/",
    todayWib,
    noindex: true,
  });
  return html.replace("</body>", `${demoChrome(themeSlug, baseDomain)}</body>`);
}

export const demo = new Hono<AppEnv>()
  .get("/kuliner", async (c) => {
    const requested = c.req.query("tema") ?? DEFAULT_THEME;
    const themeSlug = requested in KULINER_THEMES ? requested : DEFAULT_THEME;

    const cacheKey = `https://demo.${c.env.BASE_DOMAIN}/kuliner?tema=${themeSlug}`;
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;

    const html = renderDemoPage(themeSlug, c.env.BASE_DOMAIN, wibDateOf(Date.now()));
    const response = new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60, s-maxage=86400",
      },
    });
    c.executionCtx.waitUntil(caches.default.put(cacheKey, response.clone()));
    return response;
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
