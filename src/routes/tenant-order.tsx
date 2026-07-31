import { Hono } from "hono";
import {
  createOrder,
  findOrderByCode,
  getOrderById,
  listOrderItems,
  type OrderItemInput,
  orderCodeExists,
  saveOrderTransition,
  setOrderPayment,
} from "@/db/orders";
import { findPaymentMethod, listActivePaymentMethods } from "@/db/payment-methods";
import { findPublicSite, type PublicSite } from "@/db/public-site";
import { storageFromEnv } from "@/db/storage-env";
import { isItemActive, itemPhotos } from "@/domain/cms";
import { buildImageKey } from "@/domain/image-key";
import {
  applyTransition,
  buildWaMessage,
  calculateOrderTotal,
  type Fulfillment,
  generateOrderCode,
  isFulfillment,
  isItemAvailable,
  MAX_ITEM_NOTE,
  type OrderState,
  validateCheckout,
} from "@/domain/order";
import {
  buildPaymentSnapshot,
  isPaymentType,
  PAYMENT_TYPE_LABELS,
  parsePaymentDetail,
  paymentMethodLines,
} from "@/domain/payment-method";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import { sqlUtcDateTime } from "@/domain/stats";
import { verifyTurnstile } from "@/domain/turnstile";
import type { AppEnv } from "@/env";
import { rejectCrossOriginWrites, securityHeaders } from "@/routes/middleware";
import { siteCss } from "@/themes/engine/site-css";
import { themeConfigFor } from "@/themes/kuliner/configs";
import { notFoundHtml } from "@/ui/error-page";
import {
  MyOrdersView,
  OrderCartSheet,
  OrderClosedNotice,
  OrderDemoNote,
  OrderEmptyMenu,
  OrderFlash,
  type OrderMenuCategory,
  OrderMenuGrid,
  OrderStatusHint,
  OrderStatusView,
  OrderTopNav,
  PaymentPanel,
} from "@/ui/order";
import { MY_ORDERS_LIST_SCRIPT, ORDER_SCRIPT, saveOrderScript } from "@/ui/order-script";
import { ORDER_CSS } from "@/ui/order-style";
import { SiteDocument, SiteFooter } from "@/ui/site";
import { UPLOAD_SCRIPT } from "@/ui/upload-script";

const MAX_PROOF_BYTES = 512_000;
const MAX_CART_ITEMS = 40;
const MAX_LINE_QTY = 99;

const checkoutLimiter = createFixedWindowLimiter(8, 60_000);
const payLimiter = createFixedWindowLimiter(12, 60_000);

export function orderThemeCss(site: PublicSite): string {
  return siteCss(themeConfigFor(site.themeSlug)) + ORDER_CSS;
}

function waLink(waNumber: string, text: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

function orderingEnabled(site: PublicSite): boolean {
  return site.status === "active" && site.content.order_settings?.enabled === true;
}

export function menuCategories(site: PublicSite): OrderMenuCategory[] {
  return (site.content.menu ?? [])
    .map((category, c) => ({
      label: category.category ?? "Menu",
      items: (category.items ?? [])
        .map((item, i) => ({ item, i }))
        .filter(({ item }) => isItemActive(item))
        .map(({ item, i }) => {
          const photo = itemPhotos(item)[0];
          return {
            key: `${c}:${i}`,
            name: item.name ?? "",
            price: item.price ?? 0,
            desc: item.desc,
            imageSrc: photo ? `/img/${photo}` : null,
            available: isItemAvailable(item),
          };
        }),
    }))
    .filter((category) => category.items.length > 0);
}

function orderDataJson(site: PublicSite, categories: OrderMenuCategory[]): string {
  const settings = site.content.order_settings ?? {};
  const items: Record<string, { name: string; price: number; cat: string; available: boolean }> =
    {};
  for (const category of categories) {
    for (const item of category.items) {
      items[item.key] = {
        name: item.name,
        price: item.price,
        cat: category.label,
        available: item.available,
      };
    }
  }
  const data = {
    items,
    tax: settings.tax_percent ?? 0,
    fees: (settings.fees ?? [])
      .filter((fee) => (fee.amount ?? 0) > 0)
      .map((fee) => ({ label: fee.label ?? "Biaya", amount: fee.amount ?? 0 })),
    min: settings.min_order ?? 0,
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function renderOrderPage(
  site: PublicSite,
  siteKey: string | undefined,
  opts: {
    error?: string;
    prefillTable?: string;
    homeHref?: string;
    demoNotice?: string;
    formAction?: string;
    myOrdersHref?: string;
  } = {},
): string {
  const info = site.content.info ?? {};
  const settings = site.content.order_settings ?? {};
  const businessName = info.name ?? site.name;
  const homeHref = opts.homeHref ?? "/";
  const tempClosed = info.temp_closed?.active === true;

  if (tempClosed) {
    return orderDocument(
      site,
      businessName,
      <>
        <OrderTopNav
          brand={businessName}
          homeHref={homeHref}
          logoSrc={info.logo_key ? `/img/${info.logo_key}` : null}
        />
        <OrderClosedNotice reason={info.temp_closed?.reason} homeHref={homeHref} />
      </>,
      [],
    );
  }

  const categories = menuCategories(site);
  const body = (
    <>
      <OrderTopNav
        brand={businessName}
        homeHref={homeHref}
        logoSrc={info.logo_key ? `/img/${info.logo_key}` : null}
        myOrdersHref={opts.myOrdersHref}
      />
      <div class="ord-wrap">
        {opts.demoNotice ? <OrderDemoNote>{opts.demoNotice}</OrderDemoNote> : null}
        {opts.error ? <OrderFlash>{opts.error}</OrderFlash> : null}
        {categories.length === 0 ? (
          <OrderEmptyMenu />
        ) : (
          <>
            <p class="ord-lede">Lapar? Pilih menunya, kami siapkan.</p>
            <OrderMenuGrid categories={categories} />
          </>
        )}
      </div>
      <OrderCartSheet
        action={opts.formAction ?? "/pesan"}
        tables={settings.tables ?? 0}
        prefillTable={opts.prefillTable}
        minOrder={settings.min_order ?? 0}
        cashEnabled={settings.cash === true}
        siteKey={siteKey}
      />
    </>
  );
  const dataScript = `window.__ORDER__=${orderDataJson(site, categories)};`;
  return orderDocument(site, businessName, body, [dataScript, ORDER_SCRIPT]);
}

export function orderDocument(
  site: PublicSite,
  businessName: string,
  body: unknown,
  scripts: string[],
): string {
  const page = (
    <SiteDocument
      title={`Pesan — ${businessName}`}
      description={`Pesan online dari ${businessName}.`}
      canonical={""}
      noindex
      css={orderThemeCss(site)}
      jsonLd="{}"
      scripts={scripts}
    >
      {body as never}
      <SiteFooter businessName={businessName} />
    </SiteDocument>
  );
  return `<!doctype html>${String(page)}`;
}

type CartEntry = { c: number; i: number; qty: number; note: string };

export function parseCart(raw: string): CartEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        c: Number(entry?.c),
        i: Number(entry?.i),
        qty: Number(entry?.qty),
        note: typeof entry?.note === "string" ? entry.note.slice(0, MAX_ITEM_NOTE) : "",
      }))
      .filter(
        (entry) =>
          Number.isInteger(entry.c) &&
          Number.isInteger(entry.i) &&
          Number.isInteger(entry.qty) &&
          entry.qty > 0 &&
          entry.qty <= MAX_LINE_QTY,
      )
      .slice(0, MAX_CART_ITEMS);
  } catch {
    return [];
  }
}

export function resolveLines(
  site: PublicSite,
  cart: CartEntry[],
): { lines: OrderItemInput[]; hadUnavailable: boolean } {
  const menu = site.content.menu ?? [];
  const lines: OrderItemInput[] = [];
  let hadUnavailable = false;
  for (const entry of cart) {
    const item = menu[entry.c]?.items?.[entry.i];
    if (!item || !isItemActive(item)) continue;
    if (!isItemAvailable(item)) {
      hadUnavailable = true;
      continue;
    }
    lines.push({
      name: item.name ?? "Menu",
      category: menu[entry.c]?.category ?? null,
      unit_price: Math.max(0, Math.trunc(item.price ?? 0)),
      qty: entry.qty,
      item_note: entry.note ? entry.note : null,
    });
  }
  return { lines, hadUnavailable };
}

export const tenantOrder = new Hono<AppEnv>()
  .use("*", securityHeaders)
  .use("*", rejectCrossOriginWrites)
  .get("/pesan", async (c) => {
    const url = new URL(c.req.url);
    const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
    if (!site || !orderingEnabled(site)) return c.html(notFoundHtml("/"), 404);
    const tables = site.content.order_settings?.tables ?? 0;
    const mejaRaw = Number(url.searchParams.get("meja"));
    const prefillTable =
      Number.isInteger(mejaRaw) && mejaRaw >= 1 && mejaRaw <= tables ? String(mejaRaw) : undefined;
    return c.html(
      renderOrderPage(site, c.env.TURNSTILE_SITE_KEY, {
        prefillTable,
        myOrdersHref: "/pesanan-saya",
      }),
      200,
      { "cache-control": "no-store" },
    );
  })
  .post("/pesan", async (c) => {
    const url = new URL(c.req.url);
    const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
    if (!site || !orderingEnabled(site)) return c.html(notFoundHtml("/"), 404);
    if (site.content.info?.temp_closed?.active === true) {
      return c.html(
        renderOrderPage(site, c.env.TURNSTILE_SITE_KEY, { error: "Pesanan sedang tutup." }),
        400,
      );
    }

    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    const form = await c.req.formData();
    const humanOk = await verifyTurnstile(
      c.env.TURNSTILE_SECRET,
      String(form.get("cf-turnstile-response") ?? ""),
      c.req.header("cf-connecting-ip"),
      c.env.ENVIRONMENT,
    );
    if (!humanOk) {
      return c.html(
        renderOrderPage(site, c.env.TURNSTILE_SITE_KEY, {
          error: "Verifikasi anti-robot gagal. Coba lagi.",
        }),
        400,
      );
    }
    if (!checkoutLimiter.allow(ip, Date.now())) {
      return c.html(
        renderOrderPage(site, c.env.TURNSTILE_SITE_KEY, {
          error: "Terlalu banyak percobaan. Tunggu sebentar.",
        }),
        429,
      );
    }

    const settings = site.content.order_settings ?? {};
    const customerName = String(form.get("customer_name") ?? "").trim();
    const customerPhone = String(form.get("customer_phone") ?? "")
      .replace(/[^\d+]/g, "")
      .slice(0, 20);
    const customerEmail = String(form.get("customer_email") ?? "")
      .trim()
      .slice(0, 120);
    const fulfillmentRaw = String(form.get("fulfillment") ?? "");
    const fulfillment: Fulfillment = isFulfillment(fulfillmentRaw) ? fulfillmentRaw : "pickup";
    const tableNo = String(form.get("table_no") ?? "")
      .trim()
      .slice(0, 10);
    const note = String(form.get("note") ?? "")
      .trim()
      .slice(0, MAX_ITEM_NOTE);
    const cash = settings.cash === true && String(form.get("payment_mode") ?? "") === "cash";

    const cart = parseCart(String(form.get("cart") ?? "[]"));
    const { lines, hadUnavailable } = resolveLines(site, cart);
    if (lines.length === 0) {
      return c.html(
        renderOrderPage(site, c.env.TURNSTILE_SITE_KEY, {
          error: hadUnavailable
            ? "Ada menu yang sudah habis. Perbarui keranjangmu."
            : "Keranjang masih kosong.",
        }),
        400,
      );
    }

    const totals = calculateOrderTotal(
      lines,
      settings.tax_percent ?? 0,
      (settings.fees ?? [])
        .filter((fee) => (fee.amount ?? 0) > 0)
        .map((fee) => ({ label: fee.label ?? "Biaya", amount: fee.amount ?? 0 })),
    );

    const validation = validateCheckout({
      customer_name: customerName,
      fulfillment,
      table_no: tableNo,
      items: lines.map((line) => ({
        name: line.name,
        unit_price: line.unit_price,
        qty: line.qty,
        available: true,
      })),
      total: totals.total,
      min_order: settings.min_order ?? 0,
    });
    if (!validation.ok) {
      return c.html(
        renderOrderPage(site, c.env.TURNSTILE_SITE_KEY, { error: validation.error }),
        400,
      );
    }

    let code = generateOrderCode();
    for (let attempt = 0; attempt < 5 && (await orderCodeExists(c.env.DB, code)); attempt++) {
      code = generateOrderCode();
    }

    await createOrder(c.env.DB, {
      tenantId: site.tenantId,
      code,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      fulfillment,
      tableNo: fulfillment === "dine_in" ? tableNo || null : null,
      cash,
      subtotal: totals.subtotal,
      taxAmount: totals.tax_amount,
      feeAmount: totals.fee_amount,
      total: totals.total,
      note: note || null,
      items: lines,
    });

    return c.redirect(`/o/${code}?baru=1`);
  })
  .get("/pesanan-saya", async (c) => {
    const url = new URL(c.req.url);
    const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
    if (!site) return c.html(notFoundHtml("/"), 404);
    const info = site.content.info ?? {};
    const businessName = info.name ?? site.name;
    const body = (
      <>
        <OrderTopNav
          brand={businessName}
          homeHref="/"
          logoSrc={info.logo_key ? `/img/${info.logo_key}` : null}
        />
        <MyOrdersView homeHref="/" />
      </>
    );
    return c.html(orderDocument(site, businessName, body, [MY_ORDERS_LIST_SCRIPT]), 200, {
      "cache-control": "no-store",
    });
  })
  .get("/o/:code", async (c) => {
    const url = new URL(c.req.url);
    const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
    if (!site) return c.html(notFoundHtml("/"), 404);
    const order = await findOrderByCode(c.env.DB, site.tenantId, c.req.param("code"));
    if (!order) return c.html(notFoundHtml("/"), 404);

    const info = site.content.info ?? {};
    const businessName = info.name ?? site.name;
    const items = await listOrderItems(c.env.DB, order.id);
    const createdLabel = new Date(`${order.created_at}Z`).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    });
    const waReceipt = info.wa_number
      ? waLink(
          info.wa_number,
          buildWaMessage(
            {
              code: order.code,
              customer_name: order.customer_name,
              fulfillment: order.fulfillment,
              table_no: order.table_no,
              items: items.map((item) => ({
                name: item.name,
                qty: item.qty,
                unit_price: item.unit_price,
              })),
              subtotal: order.subtotal,
              tax_amount: order.tax_amount,
              fee_amount: order.fee_amount,
              total: order.total,
            },
            `${url.origin}/o/${order.code}`,
          ),
        )
      : null;

    const methods =
      order.status === "menunggu_bayar"
        ? await listActivePaymentMethods(c.env.DB, site.tenantId)
        : [];

    const paymentPanel =
      order.status === "menunggu_bayar" ? (
        <PaymentPanel
          action={`/o/${order.code}/bayar`}
          siteKey={c.env.TURNSTILE_SITE_KEY}
          methods={methods.map((method) => ({
            id: method.id,
            type: isPaymentType(method.type) ? method.type : "qris",
            typeLabel: isPaymentType(method.type) ? PAYMENT_TYPE_LABELS[method.type] : "Pembayaran",
            label: method.label,
            imageSrc: method.image_key ? `/img/${method.image_key}` : null,
            lines: isPaymentType(method.type)
              ? paymentMethodLines(method.type, parsePaymentDetail(method.detail))
              : [],
          }))}
        />
      ) : null;

    const body = (
      <>
        <OrderTopNav
          brand={businessName}
          homeHref="/"
          logoSrc={info.logo_key ? `/img/${info.logo_key}` : null}
          myOrdersHref="/pesanan-saya"
        />
        <OrderStatusView
          code={order.code}
          status={order.status}
          cash={order.cash === 1}
          customerName={order.customer_name}
          fulfillment={order.fulfillment}
          tableNo={order.table_no}
          items={items}
          subtotal={order.subtotal}
          taxAmount={order.tax_amount}
          feeAmount={order.fee_amount}
          total={order.total}
          createdLabel={createdLabel}
          waReceiptHref={waReceipt}
          justCreated={c.req.query("baru") === "1"}
        >
          <OrderStatusHint
            status={order.status}
            cash={order.cash === 1}
            fulfillment={order.fulfillment}
          />
          {paymentPanel}
        </OrderStatusView>
      </>
    );

    const autoRefresh = ["baru", "cek_bayar", "diproses"].includes(order.status);
    const scripts = [saveOrderScript(order.code)];
    if (autoRefresh) scripts.push(POLL_SCRIPT);
    if (order.status === "menunggu_bayar") scripts.push(UPLOAD_SCRIPT);
    return c.html(orderDocument(site, businessName, body, scripts), 200, {
      "cache-control": "no-store",
    });
  })
  .post("/o/:code/bayar", async (c) => {
    const url = new URL(c.req.url);
    const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
    if (!site) return c.html(notFoundHtml("/"), 404);
    const code = c.req.param("code");
    const order = await findOrderByCode(c.env.DB, site.tenantId, code);
    if (!order) return c.html(notFoundHtml("/"), 404);
    if (order.status !== "menunggu_bayar") return c.redirect(`/o/${code}`);

    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    if (!payLimiter.allow(ip, Date.now())) return c.redirect(`/o/${code}`);

    const form = await c.req.formData();
    const humanOk = await verifyTurnstile(
      c.env.TURNSTILE_SECRET,
      String(form.get("cf-turnstile-response") ?? ""),
      c.req.header("cf-connecting-ip"),
      c.env.ENVIRONMENT,
    );
    if (!humanOk) return c.redirect(`/o/${code}`);

    const methodId = Number(form.get("payment_method_id"));
    if (!Number.isInteger(methodId)) return c.redirect(`/o/${code}`);
    const method = await findPaymentMethod(c.env.DB, methodId, site.tenantId);
    if (method?.active !== 1) return c.redirect(`/o/${code}`);

    let proofKey: string | null = null;
    const proof = form.get("proof");
    if (proof instanceof File && proof.size > 0) {
      if (proof.type === "image/webp" && proof.size <= MAX_PROOF_BYTES) {
        proofKey = buildImageKey(
          site.slug,
          "proof",
          `${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}.webp`,
        );
        await storageFromEnv(c.env).put(proofKey, await proof.arrayBuffer(), "image/webp");
      }
    }

    await setOrderPayment(
      c.env.DB,
      order.id,
      site.tenantId,
      methodId,
      proofKey,
      JSON.stringify(buildPaymentSnapshot(method)),
    );
    const fresh = await getOrderById(c.env.DB, order.id, site.tenantId);
    if (fresh && fresh.status === "menunggu_bayar") {
      const next: OrderState = applyTransition(fresh, "cek_bayar", sqlUtcDateTime(Date.now()));
      await saveOrderTransition(c.env.DB, order.id, site.tenantId, next);
    }
    return c.redirect(`/o/${code}`);
  });

const POLL_SCRIPT = `setTimeout(function(){location.reload()}, 25000);`;
