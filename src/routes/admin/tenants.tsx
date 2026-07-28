import { Hono } from "hono";
import { issueToken } from "@/db/auth-tokens";
import { getSiteContent } from "@/db/contents";
import { invalidateTenantCache } from "@/db/edge-cache";
import { verifyPayment } from "@/db/payments";
import { listPayoutsForReferral, voidInstallment, voidUnpaidPayouts } from "@/db/payouts";
import { findClosingByTenant } from "@/db/referrals";
import { getSubscription, setSubscriptionCycle, upsertSubscription } from "@/db/subscriptions";
import {
  createTenant,
  findTenantById,
  findTenantBySlug,
  listTenants,
  setTenantStatus,
  type TenantRow,
  tenantHostnames,
} from "@/db/tenants";
import { createUser, findUserByEmail } from "@/db/users";
import { formDataToValues } from "@/domain/cms";
import { formatRupiah } from "@/domain/money";
import { generateOneTimeToken, INTAKE_TTL_MS, SET_PASSWORD_TTL_MS } from "@/domain/one-time-token";
import { hashPassword } from "@/domain/password";
import { isPlan, PLAN_PRICES } from "@/domain/plan";
import { nextDueDateAfterPayment, wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Badge, Card, ListTable } from "@/ui/display";
import { Button, Field, SelectField } from "@/ui/form";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,40}[a-z0-9])?$/;

function statusBadge(status: string) {
  if (status === "active") return <Badge tone="success">aktif</Badge>;
  if (status === "grace") return <Badge tone="warning">grace</Badge>;
  if (status === "suspended") return <Badge tone="danger">suspended</Badge>;
  return <Badge tone="muted">{status}</Badge>;
}

export const adminTenants = new Hono<AppEnv>()
  .get("/tenant", async (c) => {
    const tenants = await listTenants(c.env.DB);
    return c.html(
      adminHtml(
        <AdminPage title="Tenant" currentPath="/admin/tenant" notice={c.req.query("ok")}>
          <Card>
            <h2>Tenant ({tenants.length})</h2>
            <ListTable headers={["Usaha", "Status", ""]}>
              {tenants.map((tenant) => (
                <tr>
                  <td>
                    {tenant.name}
                    <div class="small muted">{tenant.slug}</div>
                  </td>
                  <td>{statusBadge(tenant.status)}</td>
                  <td>
                    <a href={`/admin/tenant/${tenant.id}`}>Kelola</a>
                  </td>
                </tr>
              ))}
            </ListTable>
          </Card>
          <Card>
            <h2>Buat Tenant Baru</h2>
            <form method="post" action="/admin/tenant">
              <Field label="Nama usaha" name="name" required />
              <Field label="Subdomain" name="slug" required hint="cth: warungbusari" />
              <SelectField
                label="Paket"
                name="plan"
                options={[
                  { value: "basic", label: "Basic — Rp 75rb/bln" },
                  { value: "pro", label: "Pro — Rp 200rb/bln" },
                ]}
              />
              <Button block>Buat (status draft)</Button>
            </form>
          </Card>
        </AdminPage>,
      ),
    );
  })
  .post("/tenant", async (c) => {
    const values = formDataToValues(await c.req.formData());
    const name = (values.name ?? "").trim();
    const slug = (values.slug ?? "").trim().toLowerCase();
    const plan = values.plan;
    if (!name || !SLUG_PATTERN.test(slug) || !isPlan(plan)) {
      return c.redirect("/admin/tenant?ok=Data tidak valid — cek nama dan subdomain.");
    }
    if (await findTenantBySlug(c.env.DB, slug)) {
      return c.redirect("/admin/tenant?ok=Subdomain sudah dipakai.");
    }
    const tenantId = await createTenant(c.env.DB, { slug, name, verticalId: 1, themeId: 1 });
    await upsertSubscription(c.env.DB, tenantId, plan, PLAN_PRICES[plan].monthly);
    return c.redirect(`/admin/tenant/${tenantId}?ok=Tenant dibuat.`);
  })
  .get("/tenant/:id", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const subscription = await getSubscription(c.env.DB, tenant.id);
    const closing = await findClosingByTenant(c.env.DB, tenant.id);
    const payouts = closing ? await listPayoutsForReferral(c.env.DB, closing.id) : [];
    const content = await getSiteContent(c.env.DB, tenant.id);
    const hasContent = Boolean(content.info?.name);

    return c.html(
      adminHtml(
        <AdminPage
          title={tenant.name}
          currentPath="/admin/tenant"
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        >
          <Card>
            <h2>
              {tenant.name} {statusBadge(tenant.status)}
            </h2>
            <p class="small">
              {tenant.slug}.{c.env.BASE_DOMAIN} · Paket {subscription?.plan ?? "?"} ·{" "}
              {formatRupiah(subscription?.monthly_price ?? 0)}/bln
              <br />
              Setup dibayar: {subscription?.setup_paid_at ?? "belum"} · Jatuh tempo:{" "}
              {subscription?.next_due_date ?? "-"}
            </p>
            <div class="row-actions">
              {tenant.status === "draft" && hasContent && subscription?.setup_paid_at ? (
                <form method="post" action={`/admin/tenant/${tenant.id}/golive`}>
                  <Button>Go Live 🚀</Button>
                </form>
              ) : null}
              {tenant.status === "suspended" ? (
                <form method="post" action={`/admin/tenant/${tenant.id}/pulihkan`}>
                  <Button>Pulihkan</Button>
                </form>
              ) : null}
              {tenant.status === "active" || tenant.status === "grace" ? (
                <form method="post" action={`/admin/tenant/${tenant.id}/suspend`}>
                  <Button variant="danger">Suspend</Button>
                </form>
              ) : null}
            </div>
          </Card>
          <Card>
            <h2>Verifikasi Pembayaran QRIS</h2>
            <form method="post" action={`/admin/tenant/${tenant.id}/bayar`}>
              <SelectField
                label="Jenis"
                name="kind"
                options={[
                  { value: "setup", label: "Setup (sekali)" },
                  { value: "monthly", label: "Langganan bulanan" },
                ]}
              />
              <Field label="Nominal (Rp)" name="amount" inputmode="numeric" required />
              <Field label="Periode" name="period" placeholder="2026-08" required />
              <Button block>Tandai Lunas</Button>
            </form>
          </Card>
          <Card>
            <h2>Akses Klien</h2>
            <form method="post" action={`/admin/tenant/${tenant.id}/link-intake`}>
              <Button variant="secondary">Buat Link Intake (3 hari)</Button>
            </form>
            <form method="post" action={`/admin/tenant/${tenant.id}/link-sandi`}>
              <Field label="Email owner" name="email" type="email" required />
              <Button variant="secondary">Buat Akun + Link Atur Password</Button>
            </form>
          </Card>
          {closing ? (
            <Card>
              <h2>Komisi Referral</h2>
              <ListTable headers={["Cicilan", "Nominal", "Status"]}>
                {payouts.map((payout) => (
                  <tr>
                    <td>#{payout.installment}</td>
                    <td>{formatRupiah(payout.amount)}</td>
                    <td>
                      <Badge
                        tone={
                          payout.status === "paid"
                            ? "success"
                            : payout.status === "payable"
                              ? "warning"
                              : payout.status === "void"
                                ? "danger"
                                : "muted"
                        }
                      >
                        {payout.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </ListTable>
              <form method="post" action={`/admin/tenant/${tenant.id}/refund`}>
                <Button variant="danger">Refund ≤ 7 hari (void cicilan-1)</Button>
              </form>
            </Card>
          ) : null}
        </AdminPage>,
      ),
    );
  })
  .post("/tenant/:id/bayar", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const session = c.get("session");
    const subscription = await getSubscription(c.env.DB, tenant.id);
    const values = formDataToValues(await c.req.formData());
    const kind = values.kind === "setup" ? "setup" : "monthly";
    const amount = Number((values.amount ?? "").replace(/\D/g, ""));
    const period = (values.period ?? "").trim();
    if (!amount || !/^\d{4}-\d{2}$/.test(period)) {
      return c.redirect(`/admin/tenant/${tenant.id}?err=Nominal atau periode tidak valid.`);
    }
    const result = await verifyPayment(c.env.DB, {
      tenantId: tenant.id,
      kind,
      amount,
      period,
      confirmedBy: session?.userId ?? 0,
      currentDueDate: subscription?.next_due_date ?? null,
      tenantStatus: tenant.status,
      nowMs: Date.now(),
    });
    if (result.tenantReactivated) {
      await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), ["/", "/menu"]);
    }
    const note = result.unlockedInstallment
      ? ` Cicilan komisi #${result.unlockedInstallment} siap cair.`
      : "";
    return c.redirect(`/admin/tenant/${tenant.id}?ok=Pembayaran dicatat.${note}`);
  })
  .post("/tenant/:id/golive", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const subscription = await getSubscription(c.env.DB, tenant.id);
    if (!subscription?.setup_paid_at) {
      return c.redirect(`/admin/tenant/${tenant.id}?err=Setup belum dibayar.`);
    }
    const liveDate = wibDateOf(Date.now());
    await setTenantStatus(c.env.DB, tenant.id, "active");
    await setSubscriptionCycle(c.env.DB, tenant.id, nextDueDateAfterPayment(liveDate), "active");
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), ["/", "/menu"]);
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=LIVE! ${tenant.slug}.${c.env.BASE_DOMAIN} tayang.`,
    );
  })
  .post("/tenant/:id/suspend", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    await setTenantStatus(c.env.DB, tenant.id, "suspended");
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), ["/", "/menu"]);
    return c.redirect(`/admin/tenant/${tenant.id}?ok=Tenant disuspend.`);
  })
  .post("/tenant/:id/pulihkan", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    await setTenantStatus(c.env.DB, tenant.id, "active");
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), ["/", "/menu"]);
    return c.redirect(`/admin/tenant/${tenant.id}?ok=Tenant aktif kembali.`);
  })
  .post("/tenant/:id/refund", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const closing = await findClosingByTenant(c.env.DB, tenant.id);
    if (closing) await voidInstallment(c.env.DB, closing.id, 1);
    await setTenantStatus(c.env.DB, tenant.id, "archived");
    if (closing) await voidUnpaidPayouts(c.env.DB, closing.id);
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), ["/", "/menu"]);
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=Refund dicatat — tenant diarsip, komisi di-void.`,
    );
  })
  .post("/tenant/:id/link-intake", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const token = await issueToken(
      c.env.DB,
      "intake",
      { tenantId: tenant.id },
      INTAKE_TTL_MS,
      Date.now(),
    );
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=Link intake: https://app.${c.env.BASE_DOMAIN}/intake/${token}`,
    );
  })
  .post("/tenant/:id/link-sandi", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const values = formDataToValues(await c.req.formData());
    const email = (values.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) {
      return c.redirect(`/admin/tenant/${tenant.id}?err=Email tidak valid.`);
    }
    let user = await findUserByEmail(c.env.DB, email);
    if (!user) {
      const randomPassword = await hashPassword(generateOneTimeToken());
      const userId = await createUser(c.env.DB, email, randomPassword, "owner", tenant.id);
      user = {
        id: userId,
        email,
        password_hash: randomPassword,
        role: "owner",
        tenant_id: tenant.id,
      };
    }
    const token = await issueToken(
      c.env.DB,
      "set_password",
      { userId: user.id },
      SET_PASSWORD_TTL_MS,
      Date.now(),
    );
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=Link atur password: https://app.${c.env.BASE_DOMAIN}/atur-sandi?token=${token}`,
    );
  });
