import { Hono } from "hono";
import { findLeadById, listLeads, setLeadStatus } from "@/db/leads";
import { createClosing } from "@/db/referrals";
import { findReferrerById, listReferrers } from "@/db/referrers";
import { getSubscription, upsertSubscription } from "@/db/subscriptions";
import { createTenant, findTenantBySlug } from "@/db/tenants";
import { formDataToValues } from "@/domain/cms";
import { isPlan, PLAN_PRICES } from "@/domain/plan";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Badge, Card, ListTable } from "@/ui/display";
import { Button, Field, SelectField } from "@/ui/form";

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
            <h2>Lead masuk ({leads.length})</h2>
            <ListTable headers={["Prospek", "Ojol", "Status", ""]}>
              {leads.map((lead) => (
                <tr>
                  <td>
                    <strong>{lead.business_name}</strong>
                    <div class="small muted">
                      {lead.name} · {lead.wa_number}
                    </div>
                  </td>
                  <td class="small">
                    {lead.referrer_id ? (referrerName.get(lead.referrer_id) ?? "?") : "—"}
                  </td>
                  <td>
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
                  </td>
                  <td>
                    {lead.status === "new" || lead.status === "contacted" ? (
                      <div class="row-actions">
                        <form method="post" action={`/admin/lead/${lead.id}/status`}>
                          <input type="hidden" name="status" value="contacted" />
                          <Button variant="secondary">Sudah di-WA</Button>
                        </form>
                        <form method="post" action={`/admin/lead/${lead.id}/status`}>
                          <input type="hidden" name="status" value="lost" />
                          <Button variant="secondary">Lost</Button>
                        </form>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </ListTable>
          </Card>
          <Card>
            <h2>Closing Lead → Tenant</h2>
            <form method="post" action="/admin/lead/closing">
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
            </form>
            <p class="small muted mb-0">
              Komisi 3 cicilan dibuat otomatis kalau lead terikat kode ojol. Tarif terkunci sesuai
              paket saat closing.
            </p>
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
          "/admin/lead?err=No WA lead sama dengan no WA ojol — self-referral, tinjau manual.",
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
