import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import {
  createPaymentMethod,
  deletePaymentMethod,
  findPaymentMethod,
  listPaymentMethods,
  type PaymentMethodRow,
  setPaymentMethodActive,
} from "@/db/payment-methods";
import { storageFromEnv } from "@/db/storage-env";
import { formDataToValues } from "@/domain/cms";
import type { SiteContent } from "@/domain/content";
import { buildImageKey } from "@/domain/image-key";
import { MAX_FEES, MAX_TABLES, parseOrderSettings } from "@/domain/order";
import {
  buildPaymentDetail,
  isPaymentType,
  PAYMENT_TYPE_LABELS,
  parsePaymentDetail,
  paymentMethodLines,
} from "@/domain/payment-method";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Badge, Card, CardTitle, EmptyState, QrImage, Text, TextLink } from "@/ui/display";
import { Button, CheckboxField, Field, FileField, Form, HiddenInput } from "@/ui/form";

const MAX_QR_BYTES = 512_000;

function methodSummary(method: PaymentMethodRow): string {
  if (!isPaymentType(method.type)) return method.label;
  const lines = paymentMethodLines(method.type, parsePaymentDetail(method.detail));
  return lines.map((line) => `${line.label}: ${line.value}`).join(" · ") || method.label;
}

function SetelanPage(props: {
  cms: CmsContext;
  content: SiteContent;
  methods: PaymentMethodRow[];
  notice?: string;
  error?: string;
}) {
  const settings = props.content.order_settings ?? {};
  const fees = settings.fees ?? [];
  return (
    <CmsPage
      title="Setelan Pesanan"
      currentPath="/pesanan"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>Setelan Pesanan</CardTitle>
        <Text small muted>
          <TextLink href="/pesanan">← Kembali ke daftar pesanan</TextLink>
        </Text>
        <Form action="/pesanan/setelan">
          <CheckboxField
            label="Aktifkan pemesanan online (tombol Pesan muncul di website)"
            name="enabled"
            checked={settings.enabled === true}
          />
          <CheckboxField
            label="Izinkan bayar tunai di tempat (pembeli tak perlu bayar di muka)"
            name="cash"
            checked={settings.cash === true}
          />
          <Field
            label="Pajak (%)"
            name="tax_percent"
            value={String(settings.tax_percent ?? 0)}
            inputmode="numeric"
            hint="Kosongkan/0 kalau tidak pakai pajak."
          />
          <Field
            label="Minimum pesanan (Rp)"
            name="min_order"
            value={String(settings.min_order ?? 0)}
            inputmode="numeric"
          />
          <Field
            label="Jumlah meja"
            name="tables"
            value={String(settings.tables ?? 0)}
            inputmode="numeric"
            hint={`Untuk QR meja & makan di tempat. Maks ${MAX_TABLES}. 0 = hanya ambil sendiri.`}
          />
          {Array.from({ length: MAX_FEES }, (_, index) => (
            <div class="pair-row">
              <input
                type="text"
                name={`fee_label_${index}`}
                placeholder={index === 0 ? "Biaya kemasan" : "Nama biaya"}
                value={fees[index]?.label ?? ""}
              />
              <input
                type="text"
                name={`fee_amount_${index}`}
                placeholder="0"
                inputmode="numeric"
                value={fees[index]?.amount ? String(fees[index]?.amount) : ""}
              />
            </div>
          ))}
          <Button block>Simpan Setelan</Button>
        </Form>
      </Card>

      <Card>
        <CardTitle>Metode Pembayaran ({props.methods.length})</CardTitle>
        {props.methods.length === 0 ? (
          <EmptyState
            icon="💳"
            title="Belum ada metode"
            hint="Tambahkan QRIS, transfer, atau e-wallet di bawah."
          />
        ) : (
          props.methods.map((method) => (
            <Card>
              <Text last>
                <strong>{method.label}</strong>{" "}
                <Badge tone={method.active === 1 ? "success" : "muted"}>
                  {isPaymentType(method.type) ? PAYMENT_TYPE_LABELS[method.type] : method.type}
                  {method.active === 1 ? "" : " · nonaktif"}
                </Badge>
              </Text>
              {method.image_key ? (
                <img src={`/img/${method.image_key}`} alt={method.label} class="cms-media-img xs" />
              ) : (
                <Text small muted>
                  {methodSummary(method)}
                </Text>
              )}
              <Form action={`/pesanan/metode/${method.id}/aktif`}>
                <Button variant="secondary">
                  {method.active === 1 ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </Form>
              <Form action={`/pesanan/metode/${method.id}/hapus`} confirm="Hapus metode ini?">
                <Button variant="danger">Hapus</Button>
              </Form>
            </Card>
          ))
        )}
      </Card>

      <Card>
        <CardTitle>Tambah QRIS</CardTitle>
        <Form action="/pesanan/metode" multipart webpUpload>
          <HiddenInput name="type" value="qris" />
          <Field label="Label" name="label" placeholder="QRIS Warung" required />
          <FileField label="Gambar QR" name="qr" required hint="Otomatis dikompres." />
          <Button block>Tambah QRIS</Button>
        </Form>
      </Card>

      <Card>
        <CardTitle>Tambah Transfer Bank</CardTitle>
        <Form action="/pesanan/metode">
          <HiddenInput name="type" value="transfer" />
          <Field label="Label" name="label" placeholder="Transfer BCA" required />
          <Field label="Bank" name="bank" placeholder="BCA" required />
          <Field label="No. Rekening" name="account_no" inputmode="numeric" required />
          <Field label="Atas Nama" name="account_name" required />
          <Button block>Tambah Transfer</Button>
        </Form>
      </Card>

      <Card>
        <CardTitle>Tambah E-Wallet</CardTitle>
        <Form action="/pesanan/metode">
          <HiddenInput name="type" value="ewallet" />
          <Field label="Label" name="label" placeholder="GoPay" required />
          <Field label="Aplikasi" name="provider" placeholder="GoPay / OVO / Dana" required />
          <Field label="Nomor" name="phone" inputmode="tel" required />
          <Button block>Tambah E-Wallet</Button>
        </Form>
      </Card>
    </CmsPage>
  );
}

async function renderSetelan(
  c: Parameters<typeof loadCms>[0],
  cms: CmsContext,
  extra: { notice?: string; error?: string } = {},
): Promise<string> {
  const content = await getSiteContent(c.env.DB, cms.tenant.id);
  const methods = await listPaymentMethods(c.env.DB, cms.tenant.id);
  return html(
    <SetelanPage
      cms={cms}
      content={content}
      methods={methods}
      notice={extra.notice}
      error={extra.error}
    />,
  );
}

function MejaPage(props: { cms: CmsContext; tables: number; baseUrl: string }) {
  return (
    <CmsPage title="QR Meja" currentPath="/pesanan" cms={props.cms}>
      <Card>
        <CardTitle>QR Meja ({props.tables})</CardTitle>
        <Text small muted>
          <TextLink href="/pesanan">← Kembali ke pesanan</TextLink> · Cetak lalu tempel di tiap
          meja. Scan → halaman pesan langsung terisi "makan di tempat" + nomor mejanya.
        </Text>
        {props.tables === 0 ? (
          <EmptyState
            icon="🍽️"
            title="Belum ada meja"
            hint="Atur jumlah meja di Setelan Pesanan dulu."
          />
        ) : (
          <>
            <button type="button" class="btn block" onclick="window.print()">
              🖨️ Cetak semua QR
            </button>
            <div class="qr-grid">
              {Array.from({ length: props.tables }, (_, index) => (
                <QrImage
                  data={`${props.baseUrl}/pesan?meja=${index + 1}`}
                  caption={`Meja ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </Card>
    </CmsPage>
  );
}

export const cmsPesananSetelan = new Hono<AppEnv>()
  .get("/pesanan/meja", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    const tables = content.order_settings?.tables ?? 0;
    const baseUrl = `https://${cms.tenant.slug}.${c.env.BASE_DOMAIN}`;
    return c.html(html(<MejaPage cms={cms} tables={tables} baseUrl={baseUrl} />));
  })
  .get("/pesanan/setelan", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    return c.html(
      await renderSetelan(c, cms, { notice: c.req.query("ok"), error: c.req.query("err") }),
    );
  })
  .post("/pesanan/setelan", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/pesanan/setelan");
    const values = formDataToValues(await c.req.formData());
    const settings = parseOrderSettings({
      enabled: Boolean(values.enabled),
      cash: Boolean(values.cash),
      taxPercent: values.tax_percent ?? "",
      minOrder: values.min_order ?? "",
      tables: values.tables ?? "",
      fees: Array.from({ length: MAX_FEES }, (_, index) => ({
        label: values[`fee_label_${index}`] ?? "",
        amount: values[`fee_amount_${index}`] ?? "",
      })),
    });
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    await saveSiteContent(c.env.DB, cms.tenant.id, { ...content, order_settings: settings });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/pesanan/setelan?ok=Setelan tersimpan.");
  })
  .post("/pesanan/metode", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/pesanan/setelan");
    const form = await c.req.formData();
    const typeRaw = String(form.get("type") ?? "");
    if (!isPaymentType(typeRaw)) return c.redirect("/pesanan/setelan?err=Tipe tidak valid.");
    const label = String(form.get("label") ?? "").trim();
    if (!label) return c.redirect("/pesanan/setelan?err=Label wajib diisi.");

    let imageKey: string | null = null;
    if (typeRaw === "qris") {
      const qr = form.get("qr");
      if (!(qr instanceof File) || qr.size === 0) {
        return c.redirect("/pesanan/setelan?err=Gambar QR wajib diunggah.");
      }
      if (qr.type !== "image/webp" || qr.size > MAX_QR_BYTES) {
        return c.redirect("/pesanan/setelan?err=Format QR tidak didukung atau terlalu besar.");
      }
      imageKey = buildImageKey(
        cms.tenant.slug,
        "payment",
        `${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}.webp`,
      );
      await storageFromEnv(c.env).put(imageKey, await qr.arrayBuffer(), "image/webp");
    }

    const detail = buildPaymentDetail(typeRaw, {
      bank: String(form.get("bank") ?? ""),
      account_no: String(form.get("account_no") ?? ""),
      account_name: String(form.get("account_name") ?? ""),
      provider: String(form.get("provider") ?? ""),
      phone: String(form.get("phone") ?? ""),
    });

    const existing = await listPaymentMethods(c.env.DB, cms.tenant.id);
    await createPaymentMethod(c.env.DB, {
      tenantId: cms.tenant.id,
      type: typeRaw,
      label: label.slice(0, 60),
      detail: JSON.stringify(detail),
      imageKey,
      sort: existing.length,
    });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/pesanan/setelan?ok=Metode ditambahkan.");
  })
  .post("/pesanan/metode/:id/aktif", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/pesanan/setelan");
    const id = Number(c.req.param("id"));
    const method = await findPaymentMethod(c.env.DB, id, cms.tenant.id);
    if (method) await setPaymentMethodActive(c.env.DB, id, cms.tenant.id, method.active !== 1);
    return c.redirect("/pesanan/setelan?ok=Metode diperbarui.");
  })
  .post("/pesanan/metode/:id/hapus", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/pesanan/setelan");
    const id = Number(c.req.param("id"));
    const method = await findPaymentMethod(c.env.DB, id, cms.tenant.id);
    if (method?.image_key) {
      c.executionCtx.waitUntil(storageFromEnv(c.env).delete(method.image_key));
    }
    await deletePaymentMethod(c.env.DB, id, cms.tenant.id);
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/pesanan/setelan?ok=Metode dihapus.");
  });
