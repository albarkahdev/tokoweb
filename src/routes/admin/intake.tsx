import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import { invalidateTenantCache } from "@/db/edge-cache";
import { findIntakeById, listIntakes, markIntakeProcessed } from "@/db/intake";
import { findTenantById, tenantHostnames } from "@/db/tenants";
import { formDataToValues } from "@/domain/cms";
import { parseSiteContent } from "@/domain/content";
import { buildCurationPrompt } from "@/domain/intake-prompt";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Badge, Card, ListTable } from "@/ui/display";
import { Button, TextAreaField } from "@/ui/form";

export const adminIntake = new Hono<AppEnv>()
  .get("/intake", async (c) => {
    const intakes = await listIntakes(c.env.DB);
    return c.html(
      adminHtml(
        <AdminPage title="Intake" currentPath="/admin/intake" notice={c.req.query("ok")}>
          <Card>
            <h2>Form intake masuk</h2>
            <ListTable headers={["ID", "Tenant", "Status", ""]}>
              {intakes.map((intake) => (
                <tr>
                  <td>#{intake.id}</td>
                  <td>{intake.tenant_id}</td>
                  <td>
                    {intake.processed ? (
                      <Badge tone="success">diproses</Badge>
                    ) : (
                      <Badge tone="warning">baru</Badge>
                    )}
                  </td>
                  <td>
                    <a href={`/admin/intake/${intake.id}`}>Kurasi</a>
                  </td>
                </tr>
              ))}
            </ListTable>
          </Card>
        </AdminPage>,
      ),
    );
  })
  .get("/intake/:id", async (c) => {
    const intake = await findIntakeById(c.env.DB, Number(c.req.param("id")));
    if (!intake) return c.notFound();
    const tenant = await findTenantById(c.env.DB, intake.tenant_id);
    if (!tenant) return c.notFound();
    const content = await getSiteContent(c.env.DB, tenant.id);
    const prompt = buildCurationPrompt(tenant.name, intake.raw);

    return c.html(
      adminHtml(
        <AdminPage
          title={`Intake #${intake.id}`}
          currentPath="/admin/intake"
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        >
          <Card>
            <h2>
              Intake #{intake.id} — {tenant.name}
            </h2>
            <h3>Data mentah klien</h3>
            <pre style="white-space:pre-wrap; font-size:0.8rem; background:var(--bg); padding:0.75rem; border-radius:0.5rem; overflow-x:auto;">
              {JSON.stringify(JSON.parse(intake.raw), null, 2)}
            </pre>
          </Card>
          <Card>
            <h2>Copy Prompt AI</h2>
            <p class="small muted">
              Salin prompt ini, tempel ke Gemini, lalu pakai hasilnya di editor konten di bawah.
            </p>
            <textarea
              rows={8}
              style="width:100%; font-size:0.8rem;"
              onclick="this.select()"
              readonly
            >
              {prompt}
            </textarea>
          </Card>
          <Card>
            <h2>Editor Konten (JSON)</h2>
            <form method="post" action={`/admin/intake/${intake.id}/simpan`}>
              <TextAreaField
                label="contents.data"
                name="data"
                rows={16}
                value={JSON.stringify(
                  Object.keys(content).length > 0 ? content : JSON.parse(intake.raw),
                  null,
                  2,
                )}
              />
              <Button block>Simpan konten + tandai diproses</Button>
            </form>
            <p class="small muted mb-0">
              Setelah tersimpan: buka tenant → Go Live. Lanjutkan kurasi kapan pun dari sini.
            </p>
          </Card>
        </AdminPage>,
      ),
    );
  })
  .post("/intake/:id/simpan", async (c) => {
    const intake = await findIntakeById(c.env.DB, Number(c.req.param("id")));
    if (!intake) return c.notFound();
    const tenant = await findTenantById(c.env.DB, intake.tenant_id);
    if (!tenant) return c.notFound();
    const values = formDataToValues(await c.req.formData());
    const content = parseSiteContent(values.data ?? "");
    if (!content.info?.name) {
      return c.redirect(`/admin/intake/${intake.id}?err=JSON tidak valid atau info.name kosong.`);
    }
    await saveSiteContent(c.env.DB, tenant.id, content);
    await markIntakeProcessed(c.env.DB, intake.id);
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), ["/", "/menu"]);
    return c.redirect(`/admin/intake/${intake.id}?ok=Konten tersimpan.`);
  });
