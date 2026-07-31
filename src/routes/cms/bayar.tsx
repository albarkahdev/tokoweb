import { Hono } from "hono";
import { getSubmissionForPeriod, upsertBillingSubmission } from "@/db/billing";
import { findClosingByTenant } from "@/db/referrals";
import { storageFromEnv } from "@/db/storage-env";
import {
  amountDue,
  billingWaLink,
  buildBillingWaMessage,
  currentBillingPeriod,
  formatPeriodLabel,
  isBillingProofValid,
} from "@/domain/billing";
import { buildImageKey } from "@/domain/image-key";
import { formatRupiah } from "@/domain/money";
import { generateOneTimeToken } from "@/domain/one-time-token";
import { isPlan, PLAN_PRICES, setupFee } from "@/domain/plan";
import { sqlUtcDateTime } from "@/domain/stats";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms } from "@/routes/cms/shared";
import {
  Alert,
  Badge,
  Card,
  CardTitle,
  CopyArea,
  DataList,
  MediaRow,
  Text,
  TextLink,
} from "@/ui/display";
import { Button, FileField, Form, TextAreaField } from "@/ui/form";

const MAX_PROOF_HINT = "Foto/tangkapan layar bukti transfer. Otomatis dikompres, maks 512 KB.";

type BillingView = {
  cms: CmsContext;
  period: string;
  amount: number;
  bankConfigured: boolean;
  bank: { name: string; accountNo: string; accountName: string };
  adminNumber: string;
  referred: boolean;
  submission: Awaited<ReturnType<typeof getSubmissionForPeriod>>;
  ok?: string;
  error?: string;
};

function statusBadge(status: string) {
  if (status === "active") return <Badge tone="success">LUNAS ✓</Badge>;
  if (status === "grace") return <Badge tone="warning">Jatuh tempo ⚠</Badge>;
  return <Badge tone="danger">Nonaktif</Badge>;
}

function BayarPage(view: BillingView) {
  const { cms, submission } = view;
  const plan = cms.subscription?.plan;
  const waLink = billingWaLink(
    view.adminNumber,
    buildBillingWaMessage({
      businessName: cms.tenant.name,
      slug: cms.tenant.slug,
      period: view.period,
      amount: view.amount,
    }),
  );
  return (
    <CmsPage
      title="Bayar Langganan"
      currentPath="/bayar"
      cms={cms}
      notice={view.ok}
      error={view.error}
    >
      <Card>
        <CardTitle>Tagihan {statusBadge(cms.tenant.status)}</CardTitle>
        <DataList
          rows={[
            {
              label: "Paket",
              value: `${cms.subscription?.plan === "pro" ? "Pro" : "Basic"} · ${formatRupiah(
                cms.subscription?.monthly_price ?? 0,
              )}/bulan`,
            },
            { label: "Periode", value: formatPeriodLabel(view.period) },
            { label: "Jatuh tempo", value: cms.subscription?.next_due_date ?? "belum aktif" },
            { label: "Total bayar", value: <strong>{formatRupiah(view.amount)}</strong> },
          ]}
        />
        {view.referred && isPlan(plan) ? (
          <Text small muted last>
            Kamu klien referral — biaya setup hemat 30%:{" "}
            <s>{formatRupiah(PLAN_PRICES[plan].setup)}</s>{" "}
            <strong>{formatRupiah(setupFee(plan, true))}</strong>.
          </Text>
        ) : null}
      </Card>

      {view.bankConfigured ? (
        <Card>
          <CardTitle>Transfer ke rekening ini</CardTitle>
          <DataList
            rows={[
              { label: "Bank", value: view.bank.name },
              { label: "Atas nama", value: view.bank.accountName },
            ]}
          />
          <Text small muted>
            Nomor rekening (ketuk untuk salin):
          </Text>
          <CopyArea text={view.bank.accountNo} />
          <Text small muted last>
            Transfer sesuai nominal <strong>{formatRupiah(view.amount)}</strong>, lalu upload bukti
            di bawah. Kami cek manual dan tandai lunas — biasanya di jam kerja.
          </Text>
        </Card>
      ) : (
        <Card>
          <CardTitle>Rekening belum tersedia</CardTitle>
          <Text muted>
            Detail rekening belum disetel. Hubungi admin untuk info pembayaran.{" "}
            <TextLink href={waLink} external>
              Chat admin →
            </TextLink>
          </Text>
        </Card>
      )}

      {submission ? (
        <Card>
          <CardTitle>
            Bukti untuk {formatPeriodLabel(submission.period)}{" "}
            {submission.status === "matched" ? (
              <Badge tone="success">Terverifikasi ✓</Badge>
            ) : submission.status === "rejected" ? (
              <Badge tone="danger">Ditolak</Badge>
            ) : (
              <Badge tone="warning">Menunggu dicek</Badge>
            )}
          </CardTitle>
          {submission.proof_key ? (
            <MediaRow src={`/img/${submission.proof_key}`} alt="Bukti transfer" />
          ) : null}
          {submission.status === "pending" ? (
            <Alert tone="success">
              Bukti terkirim. Admin akan cek dan tandai lunas. Butuh cepat?{" "}
              <TextLink href={waLink} external>
                Konfirmasi via WhatsApp →
              </TextLink>
            </Alert>
          ) : submission.status === "rejected" ? (
            <Alert tone="danger">
              Bukti sebelumnya ditolak. Cek kembali nominal/tujuan lalu upload ulang.
            </Alert>
          ) : null}
        </Card>
      ) : null}

      {view.bankConfigured && cms.tenant.status !== "active" ? (
        <Card>
          <CardTitle>
            {submission ? "Upload ulang bukti" : "Sudah transfer? Upload bukti"}
          </CardTitle>
          <Form action="/bayar" multipart webpUpload>
            <FileField label="Bukti transfer" name="proof" required hint={MAX_PROOF_HINT} />
            <TextAreaField
              label="Catatan (opsional)"
              name="note"
              rows={2}
              hint="Mis. nama pengirim jika beda dari rekeningmu."
            />
            <Button block>Kirim Bukti</Button>
          </Form>
        </Card>
      ) : view.bankConfigured ? (
        <Card>
          <CardTitle>Sudah bayar lebih awal?</CardTitle>
          <Text muted last>
            Langgananmu masih aktif. Kalau mau bayar untuk periode berikutnya, transfer lalu upload
            buktinya.
          </Text>
          <Form action="/bayar" multipart webpUpload>
            <FileField label="Bukti transfer" name="proof" required hint={MAX_PROOF_HINT} />
            <TextAreaField label="Catatan (opsional)" name="note" rows={2} />
            <Button block variant="secondary">
              Kirim Bukti
            </Button>
          </Form>
        </Card>
      ) : null}
    </CmsPage>
  );
}

function buildView(
  cms: CmsContext,
  env: AppEnv["Bindings"],
  nowMs: number,
  submission: Awaited<ReturnType<typeof getSubmissionForPeriod>>,
  referred: boolean,
  extra?: { ok?: string; error?: string },
): BillingView {
  return {
    cms,
    period: currentBillingPeriod(cms.subscription?.next_due_date ?? null, nowMs),
    amount: amountDue(cms.subscription?.monthly_price),
    bankConfigured: Boolean(env.BILLING_BANK && env.BILLING_ACCOUNT_NO && env.BILLING_ACCOUNT_NAME),
    bank: {
      name: env.BILLING_BANK,
      accountNo: env.BILLING_ACCOUNT_NO,
      accountName: env.BILLING_ACCOUNT_NAME,
    },
    adminNumber: env.PHONE_NUMBER_ADMIN,
    referred,
    submission,
    ok: extra?.ok,
    error: extra?.error,
  };
}

export const cmsBayar = new Hono<AppEnv>()
  .get("/bayar", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const nowMs = Date.now();
    const period = currentBillingPeriod(cms.subscription?.next_due_date ?? null, nowMs);
    const submission = await getSubmissionForPeriod(c.env.DB, cms.tenant.id, period);
    const referred = (await findClosingByTenant(c.env.DB, cms.tenant.id)) !== null;
    return c.html(
      html(
        <BayarPage
          {...buildView(cms, c.env, nowMs, submission, referred, {
            ok: c.req.query("ok"),
            error: c.req.query("err"),
          })}
        />,
      ),
    );
  })
  .post("/bayar", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const nowMs = Date.now();
    const period = currentBillingPeriod(cms.subscription?.next_due_date ?? null, nowMs);
    const amount = amountDue(cms.subscription?.monthly_price);
    const form = await c.req.formData();
    const proof = form.get("proof");
    const note = (form.get("note")?.toString() ?? "").slice(0, 280) || null;

    if (!(proof instanceof File) || !isBillingProofValid(proof.type, proof.size)) {
      const submission = await getSubmissionForPeriod(c.env.DB, cms.tenant.id, period);
      const referred = (await findClosingByTenant(c.env.DB, cms.tenant.id)) !== null;
      return c.html(
        html(
          <BayarPage
            {...buildView(cms, c.env, nowMs, submission, referred, {
              error: "Bukti wajib gambar (WebP) maksimal 512 KB.",
            })}
          />,
        ),
        400,
      );
    }

    const proofKey = buildImageKey(
      cms.tenant.slug,
      "proof",
      `${generateOneTimeToken().slice(0, 12)}.webp`,
    );
    await storageFromEnv(c.env).put(proofKey, await proof.arrayBuffer(), "image/webp");
    await upsertBillingSubmission(c.env.DB, {
      tenantId: cms.tenant.id,
      period,
      amount,
      proofKey,
      note,
      nowIso: sqlUtcDateTime(nowMs),
    });
    return c.redirect("/bayar?ok=Bukti terkirim. Admin akan cek dan tandai lunas.");
  });
