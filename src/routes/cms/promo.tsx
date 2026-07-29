import { Hono } from "hono";
import type { PromoRow } from "@/db/promos";
import { createPromo, deletePromo, listPromos } from "@/db/promos";
import { formDataToValues, parsePromoForm } from "@/domain/cms";
import { isPromoActive } from "@/domain/promo";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Badge, Card, CardTitle, Cell, EmptyState, ListTable, Row, Text } from "@/ui/display";
import { Button, Field, Form, HiddenInput, TextAreaField } from "@/ui/form";

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
        <CardTitle>Promo</CardTitle>
        {props.promos.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="Belum ada promo"
            hint="Promo aktif tampil otomatis di websitemu — cara ampuh menarik pembeli."
          />
        ) : (
          <ListTable headers={["Promo", "Periode", ""]}>
            {props.promos.map((promo) => (
              <Row>
                <Cell>
                  {promo.title}{" "}
                  {isPromoActive(promo, props.today) ? (
                    <Badge tone="success">aktif</Badge>
                  ) : promo.start_date > props.today ? (
                    <Badge tone="warning">terjadwal</Badge>
                  ) : (
                    <Badge tone="muted">selesai</Badge>
                  )}
                </Cell>
                <Cell small>
                  {promo.start_date} s/d {promo.end_date}
                </Cell>
                <Cell>
                  <Form action="/promo/hapus" confirm={`Hapus promo "${promo.title}"?`}>
                    <HiddenInput name="id" value={String(promo.id)} />
                    <Button variant="danger">Hapus</Button>
                  </Form>
                </Cell>
              </Row>
            ))}
          </ListTable>
        )}
      </Card>
      <Card>
        <CardTitle>Pasang Promo Baru</CardTitle>
        <Form action="/promo">
          <Field label="Judul" name="title" placeholder="Diskon 20% semua menu" required />
          <TextAreaField label="Deskripsi (opsional)" name="description" rows={2} />
          <Field label="Mulai" name="start_date" type="date" required />
          <Field label="Berakhir" name="end_date" type="date" required />
          <Button block>Pasang</Button>
        </Form>
        <Text small muted last>
          Promo tampil otomatis mulai tanggal mulai dan hilang otomatis setelah tanggal berakhir.
        </Text>
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
