import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { issueToken } from "@/db/auth-tokens";
import { getSiteContent } from "@/db/contents";
import { invalidateTenantCache } from "@/db/edge-cache";
import { verifyPayment } from "@/db/payments";
import { listPayoutsForReferral, voidInstallment, voidUnpaidPayouts } from "@/db/payouts";
import { findClosingByTenant } from "@/db/referrals";
import { statTotalsBetween, topPromoBetween } from "@/db/stats-read";
import { getSubscription, setSubscriptionCycle, upsertSubscription } from "@/db/subscriptions";
import {
  createTenant,
  findTenantById,
  findTenantBySlug,
  listTenants,
  setTenantStatus,
  tenantHostnames,
} from "@/db/tenants";
import { createUser, findUserByEmail } from "@/db/users";
import { formDataToValues } from "@/domain/cms";
import { formatRupiah } from "@/domain/money";
import { generateOneTimeToken, INTAKE_TTL_MS, SET_PASSWORD_TTL_MS } from "@/domain/one-time-token";
import { hashPassword } from "@/domain/password";
import { isPlan, PLAN_PRICES } from "@/domain/plan";
import { buildMonthlyReportText, previousMonthRange } from "@/domain/report";
import { isSlugReserved, SLUG_PATTERN, slugStatus, suggestSlug } from "@/domain/slug";
import { nextDueDateAfterPayment, wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { ADMIN_CMS_COOKIE } from "@/routes/cms/shared";
import { PUBLIC_PAGE_PATHS } from "@/themes/engine/types";
import {
  Actions,
  Badge,
  Card,
  CardTitle,
  Cell,
  CellStack,
  CopyArea,
  DataList,
  ListTable,
  Row,
  Text,
  TextLink,
} from "@/ui/display";
import { Button, Field, Form, SelectField } from "@/ui/form";

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
            <CardTitle>Tenant ({tenants.length})</CardTitle>
            <ListTable headers={["Usaha", "Status", ""]}>
              {tenants.map((tenant) => (
                <Row>
                  <CellStack top={tenant.name} bottom={tenant.slug} />
                  <Cell>{statusBadge(tenant.status)}</Cell>
                  <Cell>
                    <TextLink href={`/admin/tenant/${tenant.id}`}>Kelola</TextLink>
                  </Cell>
                </Row>
              ))}
            </ListTable>
          </Card>
          <Card>
            <CardTitle>Buat Tenant Baru</CardTitle>
            <Form action="/admin/tenant">
              <Field label="Nama usaha" name="name" required />
              <Field
                label="Subdomain"
                name="slug"
                required
                hint="Huruf kecil/angka/strip, 3–32 karakter. Hindari kata sistem (app, api, blog, dst)."
              />
              <SelectField
                label="Paket"
                name="plan"
                options={[
                  { value: "basic", label: "Basic — Rp 75rb/bln" },
                  { value: "pro", label: "Pro — Rp 200rb/bln" },
                ]}
              />
              <Button block>Buat (status draft)</Button>
            </Form>
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
    if (isSlugReserved(slug)) {
      return c.redirect("/admin/tenant?ok=Subdomain dipakai sistem — pilih yang lain.");
    }
    if (await findTenantBySlug(c.env.DB, slug)) {
      return c.redirect("/admin/tenant?ok=Subdomain sudah dipakai.");
    }
    const tenantId = await createTenant(c.env.DB, { slug, name, verticalId: 1, themeId: 1 });
    await upsertSubscription(c.env.DB, tenantId, plan, PLAN_PRICES[plan].monthly);
    return c.redirect(`/admin/tenant/${tenantId}?ok=Tenant dibuat.`);
  })
  .get("/slug-check", async (c) => {
    const slug = (c.req.query("slug") ?? "").trim().toLowerCase();
    const name = (c.req.query("name") ?? "").trim();
    let status = slugStatus(slug, []);
    if (status === "ok" && (await findTenantBySlug(c.env.DB, slug))) status = "taken";
    const suggestion = name ? suggestSlug(name, []) : undefined;
    return c.json({ slug, status, available: status === "ok", suggestion });
  })
  .get("/tenant/:id", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const subscription = await getSubscription(c.env.DB, tenant.id);
    const closing = await findClosingByTenant(c.env.DB, tenant.id);
    const payouts = closing ? await listPayoutsForReferral(c.env.DB, closing.id) : [];
    const content = await getSiteContent(c.env.DB, tenant.id);
    const hasContent = Boolean(content.info?.name);

    const month = previousMonthRange(wibDateOf(Date.now()));
    const monthBefore = previousMonthRange(month.from);
    const totals = await statTotalsBetween(c.env.DB, tenant.id, month.from, month.to);
    const prevTotals = await statTotalsBetween(
      c.env.DB,
      tenant.id,
      monthBefore.from,
      monthBefore.to,
    );
    const topPromo = await topPromoBetween(c.env.DB, tenant.id, `${month.from} 00:00:00`);
    const reportText = buildMonthlyReportText(
      tenant.name,
      month.label,
      totals,
      prevTotals.pageViews > 0 ? prevTotals : null,
      topPromo,
    );

    return c.html(
      adminHtml(
        <AdminPage
          title={tenant.name}
          currentPath="/admin/tenant"
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        >
          <Card>
            <CardTitle>
              {tenant.name} {statusBadge(tenant.status)}
            </CardTitle>
            <DataList
              rows={[
                {
                  label: "Website",
                  value: (
                    <TextLink href={`https://${tenant.slug}.${c.env.BASE_DOMAIN}`} external>
                      {tenant.slug}.{c.env.BASE_DOMAIN}
                    </TextLink>
                  ),
                },
                {
                  label: "Paket",
                  value: `${subscription?.plan ?? "?"} · ${formatRupiah(subscription?.monthly_price ?? 0)}/bln`,
                },
                { label: "Setup dibayar", value: subscription?.setup_paid_at ?? "belum" },
                { label: "Jatuh tempo", value: subscription?.next_due_date ?? "-" },
              ]}
            />
            <Actions>
              {tenant.status === "draft" && hasContent && subscription?.setup_paid_at ? (
                <Form action={`/admin/tenant/${tenant.id}/golive`}>
                  <Button>Go Live 🚀</Button>
                </Form>
              ) : null}
              {tenant.status === "suspended" ? (
                <Form action={`/admin/tenant/${tenant.id}/pulihkan`}>
                  <Button>Pulihkan</Button>
                </Form>
              ) : null}
              {tenant.status === "active" || tenant.status === "grace" ? (
                <Form
                  action={`/admin/tenant/${tenant.id}/suspend`}
                  confirm={`Suspend ${tenant.name}? Situs publiknya langsung nonaktif.`}
                >
                  <Button variant="danger">Suspend</Button>
                </Form>
              ) : null}
            </Actions>
          </Card>
          <Card>
            <CardTitle>Verifikasi Pembayaran QRIS</CardTitle>
            <Form
              action={`/admin/tenant/${tenant.id}/bayar`}
              confirm="Pastikan pembayaran benar-benar sudah masuk. Catat sekali saja per periode — dobel pencatatan bisa membuka komisi mitra tanpa pembayaran nyata. Lanjut?"
            >
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
            </Form>
          </Card>
          <Card>
            <CardTitle>Akses Klien</CardTitle>
            <Form action={`/admin/tenant/${tenant.id}/cms`}>
              <Button>Edit CMS Tenant Ini ✏️</Button>
            </Form>
            <Form action={`/admin/tenant/${tenant.id}/link-intake`}>
              <Button variant="secondary">Buat Link Intake (3 hari)</Button>
            </Form>
            <Form action={`/admin/tenant/${tenant.id}/link-sandi`}>
              <Field label="Email owner" name="email" type="email" required />
              <Button variant="secondary">Buat Akun + Link Atur Password</Button>
            </Form>
          </Card>
          <Card>
            <CardTitle>Laporan Bulanan (siap-copy)</CardTitle>
            <Text small muted>
              Salin, kirim via WA ke klien tiap tanggal 1.
            </Text>
            <CopyArea text={reportText} />
          </Card>
          {closing ? (
            <Card>
              <CardTitle>Komisi Referral</CardTitle>
              <ListTable headers={["Cicilan", "Nominal", "Status"]}>
                {payouts.map((payout) => (
                  <Row>
                    <Cell>#{payout.installment}</Cell>
                    <Cell>{formatRupiah(payout.amount)}</Cell>
                    <Cell>
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
                    </Cell>
                  </Row>
                ))}
              </ListTable>
              <Form
                action={`/admin/tenant/${tenant.id}/refund`}
                confirm="Refund? Tenant diarsip dan komisi belum cair di-void. Tidak bisa dibatalkan."
              >
                <Button variant="danger">Refund ≤ 7 hari (void cicilan-1)</Button>
              </Form>
            </Card>
          ) : null}
        </AdminPage>,
      ),
    );
  })
  .post("/tenant/:id/cms", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.redirect("/admin/tenant");
    setCookie(c, ADMIN_CMS_COOKIE, String(tenant.id), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    });
    return c.redirect("/");
  })
  .get("/tenant/:id/cms/keluar", (c) => {
    deleteCookie(c, ADMIN_CMS_COOKIE, { path: "/" });
    return c.redirect(`/admin/tenant/${c.req.param("id")}`);
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
    if (result.duplicate) {
      return c.redirect(
        `/admin/tenant/${tenant.id}?err=Pembayaran ${kind} periode ${period} sudah pernah dicatat. Tidak diproses ulang.`,
      );
    }
    if (result.tenantReactivated) {
      await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [
        ...PUBLIC_PAGE_PATHS,
      ]);
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
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [...PUBLIC_PAGE_PATHS]);
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=LIVE! ${tenant.slug}.${c.env.BASE_DOMAIN} tayang.`,
    );
  })
  .post("/tenant/:id/suspend", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    await setTenantStatus(c.env.DB, tenant.id, "suspended");
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [...PUBLIC_PAGE_PATHS]);
    return c.redirect(`/admin/tenant/${tenant.id}?ok=Tenant disuspend.`);
  })
  .post("/tenant/:id/pulihkan", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const today = wibDateOf(Date.now());
    await setTenantStatus(c.env.DB, tenant.id, "active");
    await setSubscriptionCycle(c.env.DB, tenant.id, nextDueDateAfterPayment(today), "active");
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [...PUBLIC_PAGE_PATHS]);
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=Tenant aktif kembali. Jatuh tempo berikutnya diset ulang.`,
    );
  })
  .post("/tenant/:id/refund", async (c) => {
    const tenant = await findTenantById(c.env.DB, Number(c.req.param("id")));
    if (!tenant) return c.notFound();
    const closing = await findClosingByTenant(c.env.DB, tenant.id);
    if (closing) await voidInstallment(c.env.DB, closing.id, 1);
    await setTenantStatus(c.env.DB, tenant.id, "archived");
    if (closing) await voidUnpaidPayouts(c.env.DB, closing.id);
    await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [...PUBLIC_PAGE_PATHS]);
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
    const existing = await findUserByEmail(c.env.DB, email);
    const userId =
      existing?.id ??
      (await createUser(
        c.env.DB,
        email,
        await hashPassword(generateOneTimeToken()),
        "owner",
        tenant.id,
      ));
    const token = await issueToken(
      c.env.DB,
      "set_password",
      { userId },
      SET_PASSWORD_TTL_MS,
      Date.now(),
    );
    return c.redirect(
      `/admin/tenant/${tenant.id}?ok=Link atur password: https://app.${c.env.BASE_DOMAIN}/atur-sandi?token=${token}`,
    );
  });
