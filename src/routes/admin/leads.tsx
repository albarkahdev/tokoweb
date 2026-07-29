import { Hono } from "hono";
import { findLeadById, listLeads, setLeadStatus } from "@/db/leads";
import { createClosing } from "@/db/referrals";
import { findReferrerById, listReferrers } from "@/db/referrers";
import { upsertSubscription } from "@/db/subscriptions";
import { createTenant, findTenantBySlug } from "@/db/tenants";
import { formDataToValues } from "@/domain/cms";
import { isPlan, PLAN_PRICES } from "@/domain/plan";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import {
  Actions,
  Badge,
  Card,
  CardTitle,
  Cell,
  CellStack,
  EmptyState,
  ListTable,
  Row,
  Text,
} from "@/ui/display";
import { Button, Field, Form, HiddenInput, SelectField } from "@/ui/form";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,40}[a-z0-9])?$/;

export const adminLeads = new Hono<AppEnv>()
  .get("/lead", async (c) => {
    const leads = await listLeads(c.env.DB);
    const referrers = await listReferrers(c.env.DB);
    const referrerName = new Map(referrers.map((referrer) => [referrer.id, referrer.name]));
    return c.html(
      adminHtml(
        <AdminPage
          title="Lead"
          currentPath="/admin/lead"
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        >
          <Card>
            <CardTitle>Lead masuk ({leads.length})</CardTitle>
            {leads.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="Belum ada lead"
                hint="Lead dari form demo dan brosur QR mitra muncul di sini."
              />
            ) : (
              <ListTable headers={["Prospek", "Mitra", "Status", ""]}>
                {leads.map((lead) => (
                  <Row>
                    <CellStack
                      top={lead.business_name}
                      bottom={`${lead.name} · ${lead.wa_number}`}
                    />
                    <Cell small>
                      {lead.referrer_id ? (referrerName.get(lead.referrer_id) ?? "?") : "—"}
                    </Cell>
                    <Cell>
                      <Badge
                        tone={
                          lead.status === "closed"
                            ? "success"
                            : lead.status === "new"
                              ? "warning"
                              : lead.status === "lost"
                                ? "danger"
                                : "muted"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </Cell>
                    <Cell>
                      {lead.status === "new" || lead.status === "contacted" ? (
                        <Actions>
                          <Form action={`/admin/lead/${lead.id}/status`}>
                            <HiddenInput name="status" value="contacted" />
                            <Button variant="secondary">Sudah di-WA</Button>
                          </Form>
                          <Form action={`/admin/lead/${lead.id}/status`}>
                            <HiddenInput name="status" value="lost" />
                            <Button variant="secondary">Lost</Button>
                          </Form>
                        </Actions>
                      ) : null}
                    </Cell>
                  </Row>
                ))}
              </ListTable>
            )}
          </Card>
          <Card>
            <CardTitle>Closing Lead → Tenant</CardTitle>
            <Form action="/admin/lead/closing">
              <Field label="ID Lead" name="lead_id" inputmode="numeric" required />
              <Field label="Subdomain" name="slug" required hint="cth: warungbusari" />
              <SelectField
                label="Paket"
                name="plan"
                options={[
                  { value: "basic", label: "Basic" },
                  { value: "pro", label: "Pro" },
                ]}
              />
              <Button block>Closing — buat tenant + komisi</Button>
            </Form>
            <Text small muted last>
              Komisi 3 cicilan dibuat otomatis kalau lead terikat kode mitra. Tarif terkunci sesuai
              paket saat closing.
            </Text>
          </Card>
        </AdminPage>,
      ),
    );
  })
  .post("/lead/:id/status", async (c) => {
    const values = formDataToValues(await c.req.formData());
    const status = values.status;
    if (status === "contacted" || status === "lost") {
      await setLeadStatus(c.env.DB, Number(c.req.param("id")), status);
    }
    return c.redirect("/admin/lead?ok=Status diperbarui.");
  })
  .post("/lead/closing", async (c) => {
    const values = formDataToValues(await c.req.formData());
    const lead = await findLeadById(c.env.DB, Number(values.lead_id));
    const slug = (values.slug ?? "").trim().toLowerCase();
    const plan = values.plan;
    if (!lead) return c.redirect("/admin/lead?err=Lead tidak ditemukan.");
    if (lead.status === "closed") return c.redirect("/admin/lead?err=Lead sudah closing.");
    if (!SLUG_PATTERN.test(slug) || !isPlan(plan)) {
      return c.redirect("/admin/lead?err=Subdomain atau paket tidak valid.");
    }
    if (await findTenantBySlug(c.env.DB, slug)) {
      return c.redirect("/admin/lead?err=Subdomain sudah dipakai.");
    }

    if (lead.referrer_id) {
      const referrer = await findReferrerById(c.env.DB, lead.referrer_id);
      if (referrer && referrer.wa_number === lead.wa_number) {
        return c.redirect(
          "/admin/lead?err=No WA lead sama dengan no WA mitra — self-referral, tinjau manual.",
        );
      }
    }

    const tenantId = await createTenant(c.env.DB, {
      slug,
      name: lead.business_name,
      verticalId: 1,
      themeId: 1,
    });
    await upsertSubscription(c.env.DB, tenantId, plan, PLAN_PRICES[plan].monthly);
    if (lead.referrer_id) {
      await createClosing(c.env.DB, lead.referrer_id, tenantId, plan, Date.now());
    }
    await setLeadStatus(c.env.DB, lead.id, "closed");
    return c.redirect(
      `/admin/tenant/${tenantId}?ok=Closing! Tenant dibuat${lead.referrer_id ? " + 3 cicilan komisi" : ""}. Lanjut: verifikasi setup fee.`,
    );
  });
