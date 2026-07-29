import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import { storageFromEnv } from "@/db/storage-env";
import { formDataToValues } from "@/domain/cms";
import type { SiteContent } from "@/domain/content";
import { buildImageKey } from "@/domain/image-key";
import { generateOneTimeToken } from "@/domain/one-time-token";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Card, CardTitle, EmptyState, MediaRow } from "@/ui/display";
import { Button, Field, FileField, Form, HiddenInput } from "@/ui/form";

const MAX_UPLOAD_BYTES = 512_000;
const MAX_GALLERY_ITEMS = 12;

function GaleriPage(props: {
  cms: CmsContext;
  content: SiteContent;
  notice?: string;
  error?: string;
}) {
  const gallery = props.content.gallery ?? [];
  return (
    <CmsPage
      title="Galeri"
      currentPath="/galeri"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>
          Galeri ({gallery.length}/{MAX_GALLERY_ITEMS})
        </CardTitle>
        {gallery.length === 0 ? (
          <EmptyState
            icon="📷"
            title="Belum ada foto"
            hint="Foto suasana dan makanan bikin websitemu jauh lebih meyakinkan."
          />
        ) : null}
        {gallery.map((photo, index) => (
          <MediaRow src={`/img/${photo.image_key ?? ""}`} alt={photo.alt ?? ""}>
            <Form action="/galeri/hapus" confirm="Hapus foto ini?">
              <HiddenInput name="i" value={String(index)} />
              <Button variant="danger">Hapus</Button>
            </Form>
          </MediaRow>
        ))}
      </Card>
      <Card>
        <CardTitle>Tambah Foto</CardTitle>
        <Form action="/galeri" multipart webpUpload>
          <FileField
            label="Foto"
            name="photo"
            required
            hint="Otomatis dikompres sebelum diunggah."
          />
          <Field label="Keterangan foto" name="alt" placeholder="Suasana warung" required />
          <Button block>Unggah</Button>
        </Form>
      </Card>
    </CmsPage>
  );
}

export const cmsGaleri = new Hono<AppEnv>()
  .get("/galeri", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    return c.html(html(<GaleriPage cms={cms} content={content} notice={c.req.query("ok")} />));
  })
  .post("/galeri", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    if (cms.readOnly) {
      return c.html(
        html(<GaleriPage cms={cms} content={content} error="CMS sedang mode baca." />),
        403,
      );
    }
    if ((content.gallery ?? []).length >= MAX_GALLERY_ITEMS) {
      return c.html(
        html(
          <GaleriPage cms={cms} content={content} error="Galeri penuh. Hapus foto lama dulu." />,
        ),
        400,
      );
    }
    const formData = await c.req.formData();
    const photo = formData.get("photo");
    const alt = String(formData.get("alt") ?? "").trim();
    if (!(photo instanceof File) || photo.size === 0 || !alt) {
      return c.html(
        html(<GaleriPage cms={cms} content={content} error="Foto dan keterangan wajib diisi." />),
        400,
      );
    }
    if (photo.type !== "image/webp" || photo.size > MAX_UPLOAD_BYTES) {
      return c.html(
        html(
          <GaleriPage
            cms={cms}
            content={content}
            error="Format foto tidak didukung atau terlalu besar (maks 500 KB WebP)."
          />,
        ),
        400,
      );
    }
    const key = buildImageKey(
      cms.tenant.slug,
      "gallery",
      `${generateOneTimeToken().slice(0, 12)}.webp`,
    );
    await storageFromEnv(c.env).put(key, await photo.arrayBuffer(), "image/webp");
    const gallery = [...(content.gallery ?? []), { image_key: key, alt }];
    await saveSiteContent(c.env.DB, cms.tenant.id, { ...content, gallery });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/galeri?ok=Foto terunggah.");
  })
  .post("/galeri/hapus", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/galeri");
    const values = formDataToValues(await c.req.formData());
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    const gallery = [...(content.gallery ?? [])];
    const [removed] = gallery.splice(Number(values.i), 1);
    await saveSiteContent(c.env.DB, cms.tenant.id, { ...content, gallery });
    if (removed?.image_key) {
      c.executionCtx.waitUntil(storageFromEnv(c.env).delete(removed.image_key));
    }
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/galeri?ok=Foto dihapus.");
  });
