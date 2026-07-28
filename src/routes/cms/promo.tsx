import { Hono } from "hono";
import type { PromoRow } from "@/db/promos";
import { createPromo, deletePromo, listPromos } from "@/db/promos";
import { formDataToValues, parsePromoForm } from "@/domain/cms";
import { isPromoActive } from "@/domain/promo";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Badge, Card, ListTable } from "@/ui/display";
import { Button, Field, TextAreaField } from "@/ui/form";

function PromoPage(props: {
  cms: CmsContext;
  promos: PromoRow[];
  today: string;
  notice?: string;
  error?: string;
}) {
  return (
    <CmsPage
      title="Promo"
      currentPath="/promo"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <h2>Promo</h2>
        {props.promos.length === 0 ? (
          <p class="muted">Belum ada promo. Promo aktif tampil otomatis di websitemu.</p>
        ) : (
          <ListTable headers={["Promo", "Periode", ""]}>
            {props.promos.map((promo) => (
              <tr>
                <td>
                  {promo.title}{" "}
                  {isPromoActive(promo, props.today) ? (
                    <Badge tone="success">aktif</Badge>
                  ) : promo.start_date > props.today ? (
                    <Badge tone="warning">terjadwal</Badge>
                  ) : (
                    <Badge tone="muted">selesai</Badge>
                  )}
                </td>
                <td class="small">
                  {promo.start_date} s/d {promo.end_date}
                </td>
                <td>
                  <form method="post" action="/promo/hapus">
                    <input type="hidden" name="id" value={String(promo.id)} />
                    <Button variant="danger">Hapus</Button>
                  </form>
                </td>
              </tr>
            ))}
          </ListTable>
        )}
      </Card>
      <Card>
        <h2>Pasang Promo Baru</h2>
        <form method="post" action="/promo">
          <Field label="Judul" name="title" placeholder="Diskon 20% semua menu" required />
          <TextAreaField label="Deskripsi (opsional)" name="description" rows={2} />
          <Field label="Mulai" name="start_date" type="date" required />
          <Field label="Berakhir" name="end_date" type="date" required />
          <Button block>Pasang</Button>
        </form>
        <p class="small muted mb-0">
          Promo tampil otomatis mulai tanggal mulai dan hilang otomatis setelah tanggal berakhir.
        </p>
      </Card>
    </CmsPage>
  );
}

export const cmsPromo = new Hono<AppEnv>()
  .get("/promo", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const promos = await listPromos(c.env.DB, cms.tenant.id);
    return c.html(
      html(
        <PromoPage
          cms={cms}
          promos={promos}
          today={wibDateOf(Date.now())}
          notice={c.req.query("ok")}
        />,
      ),
    );
  })
  .post("/promo", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const promos = await listPromos(c.env.DB, cms.tenant.id);
    const today = wibDateOf(Date.now());
    if (cms.readOnly) {
      return c.html(
        html(<PromoPage cms={cms} promos={promos} today={today} error="CMS sedang mode baca." />),
        403,
      );
    }
    const parsed = parsePromoForm(formDataToValues(await c.req.formData()));
    if (!parsed.ok) {
      return c.html(
        html(<PromoPage cms={cms} promos={promos} today={today} error={parsed.error} />),
        400,
      );
    }
    await createPromo(c.env.DB, cms.tenant.id, parsed.value);
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/promo?ok=Promo terpasang.");
  })
  .post("/promo/hapus", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/promo");
    const values = formDataToValues(await c.req.formData());
    await deletePromo(c.env.DB, cms.tenant.id, Number(values.id));
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/promo?ok=Promo dihapus.");
  });
