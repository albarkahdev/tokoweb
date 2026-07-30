import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import { storageFromEnv } from "@/db/storage-env";
import {
  DAY_KEYS,
  DAY_LABELS,
  formDataToValues,
  parseHoursForm,
  parseInfoForm,
  parseTrustForm,
} from "@/domain/cms";
import type { SiteContent } from "@/domain/content";
import { buildImageKey } from "@/domain/image-key";
import { generateOneTimeToken } from "@/domain/one-time-token";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Card, CardTitle, EmptyState, MediaRow, SubTitle } from "@/ui/display";
import { Button, CheckboxField, Field, FileField, Form, TextAreaField, TimeRow } from "@/ui/form";

const MAX_LOGO_BYTES = 256_000;

function InfoPage(props: {
  cms: CmsContext;
  content: SiteContent;
  notice?: string;
  error?: string;
}) {
  const info = props.content.info ?? {};
  const hours = props.content.hours ?? {};
  const trust = props.content.trust ?? {};
  return (
    <CmsPage
      title="Info Usaha"
      currentPath="/info"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>Logo Usaha</CardTitle>
        {info.logo_key ? (
          <MediaRow src={`/img/${info.logo_key}`} alt="Logo usaha">
            <Form action="/info/logo/hapus" confirm="Hapus logo?">
              <Button variant="danger">Hapus</Button>
            </Form>
          </MediaRow>
        ) : (
          <EmptyState
            icon="🖼️"
            title="Belum ada logo"
            hint="Logo tampil di header website & invoice. Kalau kosong, dipakai inisial nama usaha."
          />
        )}
        <Form action="/info/logo" multipart webpUpload>
          <FileField
            label="Unggah logo"
            name="logo"
            required
            hint="Bentuk persegi paling bagus. Otomatis dikompres (maks 250 KB)."
          />
          <Button block>Simpan Logo</Button>
        </Form>
      </Card>
      <Card>
        <CardTitle>Info Usaha</CardTitle>
        <Form action="/info">
          <Field label="Nama usaha" name="name" value={info.name} required />
          <Field label="Tagline" name="tagline" value={info.tagline} />
          <Field
            label="Teks banner atas"
            name="ticker_text"
            value={info.ticker_text}
            hint="Tampil di banner berjalan paling atas saat tidak ada promo aktif."
          />
          <TextAreaField label="Tentang" name="about" value={info.about} />
          <Field label="Alamat" name="address" value={info.address} />
          <Field label="Link Google Maps" name="maps_url" value={info.maps_url} />
          <Field
            label="Nomor WhatsApp"
            name="wa_number"
            value={info.wa_number}
            required
            inputmode="numeric"
            hint="Format 62xxxxxxxxxx"
          />
          <Field label="Telepon" name="phone" value={info.phone} inputmode="numeric" />
          <Field label="Instagram" name="instagram" value={info.instagram} hint="Tanpa @" />
          <SubTitle>Pengumuman</SubTitle>
          <Field
            label="Teks pengumuman"
            name="announcement_text"
            value={info.announcement?.text}
            hint="Info singkat 1 baris (libur, pindah, jam berubah). Tampil di banner atas, bisa ditutup pengunjung."
          />
          <CheckboxField
            label="Tampilkan pengumuman"
            name="announcement_active"
            checked={info.announcement?.active}
          />
          <SubTitle>Tutup sementara</SubTitle>
          <CheckboxField
            label="Tutup toko sekarang (menimpa jam buka)"
            name="temp_closed_active"
            checked={info.temp_closed?.active}
          />
          <Field
            label="Alasan (opsional)"
            name="temp_closed_reason"
            value={info.temp_closed?.reason}
            hint="Contoh: Libur sampai Senin. Tampil di badge status."
          />
          <SubTitle>Kepercayaan (opsional)</SubTitle>
          <Field
            label="Rating Google"
            name="google_rating"
            value={trust.google_rating}
            inputmode="decimal"
            hint="Isi manual, contoh: 4.8. Kosongkan kalau belum ada."
          />
          <Field label="Link Google Maps/Bisnis" name="google_url" value={trust.google_url} />
          <CheckboxField label="Bersertifikat Halal" name="halal" checked={trust.halal} />
          <TextAreaField
            label="Sertifikat lain"
            name="certs"
            value={trust.certs}
            hint="Satu per baris. Contoh: Higienis · PIRT · Juara Kuliner 2025."
          />
          <SubTitle>Jam buka</SubTitle>
          {DAY_KEYS.map((day) => {
            const entry = hours[day];
            return (
              <TimeRow
                label={DAY_LABELS[day]}
                openName={`${day}_open`}
                closeName={`${day}_close`}
                closedName={`${day}_closed`}
                open={entry?.[0] ?? "08:00"}
                close={entry?.[1] ?? "21:00"}
                closed={entry === null}
              />
            );
          })}
          <Button block>Simpan</Button>
        </Form>
      </Card>
    </CmsPage>
  );
}

export const cmsInfo = new Hono<AppEnv>()
  .get("/info", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    return c.html(html(<InfoPage cms={cms} content={content} notice={c.req.query("ok")} />));
  })
  .post("/info", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    if (cms.readOnly) {
      return c.html(
        html(<InfoPage cms={cms} content={content} error="CMS sedang mode baca." />),
        403,
      );
    }
    const values = formDataToValues(await c.req.formData());
    const info = parseInfoForm(values);
    if (!info.ok) {
      return c.html(html(<InfoPage cms={cms} content={content} error={info.error} />), 400);
    }
    const hours = parseHoursForm(values);
    if (!hours.ok) {
      return c.html(html(<InfoPage cms={cms} content={content} error={hours.error} />), 400);
    }
    const trust = parseTrustForm(values);
    if (!trust.ok) {
      return c.html(html(<InfoPage cms={cms} content={content} error={trust.error} />), 400);
    }
    await saveSiteContent(c.env.DB, cms.tenant.id, {
      ...content,
      info: { ...content.info, ...info.value },
      hours: hours.value,
      trust: trust.value,
    });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/info?ok=Tersimpan. Perubahan tampil beberapa detik lagi.");
  })
  .post("/info/logo", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/info");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    const logo = (await c.req.formData()).get("logo");
    if (!(logo instanceof File) || logo.size === 0 || logo.type !== "image/webp") {
      return c.html(
        html(<InfoPage cms={cms} content={content} error="Logo wajib gambar (WebP)." />),
        400,
      );
    }
    if (logo.size > MAX_LOGO_BYTES) {
      return c.html(
        html(<InfoPage cms={cms} content={content} error="Logo terlalu besar (maks 250 KB)." />),
        400,
      );
    }
    const oldKey = content.info?.logo_key;
    const key = buildImageKey(
      cms.tenant.slug,
      "logo",
      `${generateOneTimeToken().slice(0, 12)}.webp`,
    );
    await storageFromEnv(c.env).put(key, await logo.arrayBuffer(), "image/webp");
    await saveSiteContent(c.env.DB, cms.tenant.id, {
      ...content,
      info: { ...content.info, logo_key: key },
    });
    if (oldKey) c.executionCtx.waitUntil(storageFromEnv(c.env).delete(oldKey));
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/info?ok=Logo tersimpan.");
  })
  .post("/info/logo/hapus", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/info");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    const oldKey = content.info?.logo_key;
    const info = { ...content.info };
    info.logo_key = undefined;
    await saveSiteContent(c.env.DB, cms.tenant.id, { ...content, info });
    if (oldKey) c.executionCtx.waitUntil(storageFromEnv(c.env).delete(oldKey));
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/info?ok=Logo dihapus.");
  });
