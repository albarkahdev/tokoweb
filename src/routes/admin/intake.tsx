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
import { PUBLIC_PAGE_PATHS } from "@/themes/engine/types";
import {
  Badge,
  Card,
  CardTitle,
  Cell,
  CodeBlock,
  CopyArea,
  EmptyState,
  ListTable,
  Row,
  SubTitle,
  Text,
  TextLink,
} from "@/ui/display";
import { Button, Form, TextAreaField } from "@/ui/form";

export const adminIntake = new Hono<AppEnv>()
  .get("/intake", async (c) => {
    const intakes = await listIntakes(c.env.DB);
    return c.html(
      adminHtml(
        <AdminPage title="Intake" currentPath="/admin/intake" notice={c.req.query("ok")}>
          <Card>
            <CardTitle>Form intake masuk</CardTitle>
            {intakes.length === 0 ? (
              <EmptyState
                icon="📥"
                title="Belum ada intake"
                hint="Kiriman form data usaha dari klien muncul di sini untuk dikurasi."
              />
            ) : (
              <ListTable headers={["ID", "Tenant", "Status", ""]}>
                {intakes.map((intake) => (
                  <Row>
                    <Cell>#{intake.id}</Cell>
                    <Cell>{intake.tenant_id}</Cell>
                    <Cell>
                      {intake.processed ? (
                        <Badge tone="success">diproses</Badge>
                      ) : (
                        <Badge tone="warning">baru</Badge>
                      )}
                    </Cell>
                    <Cell>
                      <TextLink href={`/admin/intake/${intake.id}`}>Kurasi</TextLink>
                    </Cell>
                  </Row>
                ))}
              </ListTable>
            )}
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
            <CardTitle>
              Intake #{intake.id} — {tenant.name}
            </CardTitle>
            <SubTitle>Data mentah klien</SubTitle>
            <CodeBlock text={JSON.stringify(JSON.parse(intake.raw), null, 2)} />
          </Card>
          <Card>
            <CardTitle>Copy Prompt AI</CardTitle>
            <Text small muted>
              Salin prompt ini, tempel ke Gemini, lalu pakai hasilnya di editor konten di bawah.
            </Text>
            <CopyArea text={prompt} />
          </Card>
          <Card>
            <CardTitle>Editor Konten (JSON)</CardTitle>
            <Form action={`/admin/intake/${intake.id}/simpan`}>
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
            </Form>
            <Text small muted last>
              Setelah tersimpan: buka tenant → Go Live. Lanjutkan kurasi kapan pun dari sini.
            </Text>
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
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [...PUBLIC_PAGE_PATHS]);
    return c.redirect(`/admin/intake/${intake.id}?ok=Konten tersimpan.`);
  });
