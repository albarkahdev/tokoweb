import { Hono } from "hono";
import {
  approveTestimonial,
  deleteTestimonial,
  listTestimonials,
  type TestimonialRow,
} from "@/db/testimonials";
import { formDataToValues } from "@/domain/cms";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Actions, Card, CardTitle, EmptyState, Strong, Text } from "@/ui/display";
import { Button, Form, HiddenInput } from "@/ui/form";

function PesanPage(props: {
  cms: CmsContext;
  pending: TestimonialRow[];
  approved: TestimonialRow[];
  notice?: string;
}) {
  return (
    <CmsPage title="Pesan Masuk" currentPath="/pesan" cms={props.cms} notice={props.notice}>
      <Card>
        <CardTitle>Menunggu persetujuan ({props.pending.length})</CardTitle>
        {props.pending.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Tidak ada testimoni baru"
            hint="Testimoni dari pengunjung websitemu muncul di sini untuk kamu setujui."
          />
        ) : (
          props.pending.map((testimonial) => (
            <Card>
              <Text last>
                <Strong>{testimonial.author_name}</Strong>
                {testimonial.rating ? ` · ${testimonial.rating}/5` : ""}
              </Text>
              <Text>{testimonial.body}</Text>
              <Actions>
                <Form action="/pesan/setujui">
                  <HiddenInput name="id" value={String(testimonial.id)} />
                  <Button>Tampilkan di website</Button>
                </Form>
                <Form action="/pesan/hapus" confirm="Hapus testimoni ini?">
                  <HiddenInput name="id" value={String(testimonial.id)} />
                  <Button variant="danger">Hapus</Button>
                </Form>
              </Actions>
            </Card>
          ))
        )}
      </Card>
      <Card>
        <CardTitle>Tampil di website ({props.approved.length})</CardTitle>
        {props.approved.map((testimonial) => (
          <Card>
            <Text last>
              <Strong>{testimonial.author_name}</Strong>
            </Text>
            <Text>{testimonial.body}</Text>
            <Form action="/pesan/hapus" confirm="Hapus testimoni ini?">
              <HiddenInput name="id" value={String(testimonial.id)} />
              <Button variant="danger">Hapus</Button>
            </Form>
          </Card>
        ))}
      </Card>
    </CmsPage>
  );
}

export const cmsPesan = new Hono<AppEnv>()
  .get("/pesan", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const pending = await listTestimonials(c.env.DB, cms.tenant.id, "pending");
    const approved = await listTestimonials(c.env.DB, cms.tenant.id, "approved");
    return c.html(
      html(
        <PesanPage cms={cms} pending={pending} approved={approved} notice={c.req.query("ok")} />,
      ),
    );
  })
  .post("/pesan/setujui", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/pesan");
    const values = formDataToValues(await c.req.formData());
    await approveTestimonial(c.env.DB, cms.tenant.id, Number(values.id));
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/pesan?ok=Testimoni ditampilkan.");
  })
  .post("/pesan/hapus", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/pesan");
    const values = formDataToValues(await c.req.formData());
    await deleteTestimonial(c.env.DB, cms.tenant.id, Number(values.id));
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/pesan?ok=Testimoni dihapus.");
  });
