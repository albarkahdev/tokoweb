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
import { Card } from "@/ui/display";
import { Button } from "@/ui/form";

function PesanPage(props: {
  cms: CmsContext;
  pending: TestimonialRow[];
  approved: TestimonialRow[];
  notice?: string;
}) {
  return (
    <CmsPage title="Pesan Masuk" currentPath="/pesan" cms={props.cms} notice={props.notice}>
      <Card>
        <h2>Menunggu persetujuan ({props.pending.length})</h2>
        {props.pending.length === 0 ? (
          <p class="muted mb-0">Tidak ada testimoni baru.</p>
        ) : (
          props.pending.map((testimonial) => (
            <div class="card">
              <strong>{testimonial.author_name}</strong>
              {testimonial.rating ? <span class="small"> · {testimonial.rating}/5</span> : null}
              <p>{testimonial.body}</p>
              <div class="row-actions">
                <form method="post" action="/pesan/setujui">
                  <input type="hidden" name="id" value={String(testimonial.id)} />
                  <Button>Tampilkan di website</Button>
                </form>
                <form method="post" action="/pesan/hapus">
                  <input type="hidden" name="id" value={String(testimonial.id)} />
                  <Button variant="danger">Hapus</Button>
                </form>
              </div>
            </div>
          ))
        )}
      </Card>
      <Card>
        <h2>Tampil di website ({props.approved.length})</h2>
        {props.approved.map((testimonial) => (
          <div class="card">
            <strong>{testimonial.author_name}</strong>
            <p>{testimonial.body}</p>
            <form method="post" action="/pesan/hapus">
              <input type="hidden" name="id" value={String(testimonial.id)} />
              <Button variant="danger">Hapus</Button>
            </form>
          </div>
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
