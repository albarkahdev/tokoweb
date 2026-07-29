import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import {
  DAY_KEYS,
  DAY_LABELS,
  formDataToValues,
  parseHoursForm,
  parseInfoForm,
} from "@/domain/cms";
import type { SiteContent } from "@/domain/content";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Card, CardTitle, SubTitle } from "@/ui/display";
import { Button, Field, Form, TextAreaField, TimeRow } from "@/ui/form";

function InfoPage(props: {
  cms: CmsContext;
  content: SiteContent;
  notice?: string;
  error?: string;
}) {
  const info = props.content.info ?? {};
  const hours = props.content.hours ?? {};
  return (
    <CmsPage
      title="Info Usaha"
      currentPath="/info"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>Info Usaha</CardTitle>
        <Form action="/info">
          <Field label="Nama usaha" name="name" value={info.name} required />
          <Field label="Tagline" name="tagline" value={info.tagline} />
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
    await saveSiteContent(c.env.DB, cms.tenant.id, {
      ...content,
      info: { ...content.info, ...info.value },
      hours: hours.value,
    });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/info?ok=Tersimpan. Perubahan tampil beberapa detik lagi.");
  });
