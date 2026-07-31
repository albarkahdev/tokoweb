import { Hono } from "hono";
import { type ClosingSummary, countScans, listClosingsWithPayouts } from "@/db/referrals";
import { findReferrerByCode } from "@/db/referrers";
import { formDataToValues } from "@/domain/cms";
import { GUIDE_MITRA } from "@/domain/guides";
import { formatRupiah } from "@/domain/money";
import { hashOneTimeToken } from "@/domain/one-time-token";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import { isValidPin, isValidReferralCode } from "@/domain/referral-code";
import { verifyTurnstile } from "@/domain/turnstile";
import type { AppEnv } from "@/env";
import { AppLayout } from "@/ui/app-layout";
import { renderBrochureHtml } from "@/ui/brochure";
import {
  Alert,
  Badge,
  Card,
  CardTitle,
  PageTitle,
  StatRow,
  StatTile,
  Strong,
  Text,
  TextLink,
} from "@/ui/display";
import { Button, Field, Form } from "@/ui/form";
import { GuideView } from "@/ui/guide";
import { TurnstileWidget } from "@/ui/turnstile-widget";

const pinAttempts = createFixedWindowLimiter(5, 60_000);

const STATUS_LABEL: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "muted" }
> = {
  pending: { label: "menunggu", tone: "muted" },
  payable: { label: "siap cair", tone: "warning" },
  paid: { label: "sudah ditransfer", tone: "success" },
  void: { label: "hangus", tone: "danger" },
};

function PinPage(props: { code: string; error?: string; siteKey?: string }) {
  return (
    <AppLayout title={`Komisi ${props.code} — tokoweb`}>
      <Card>
        <PageTitle>Halaman Komisi</PageTitle>
        <Text small muted>
          Kode: <Strong>{props.code}</Strong>
        </Text>
        {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
        <Form action={`/r/${props.code}`}>
          <Field label="PIN 6 digit" name="pin" type="password" inputmode="numeric" required />
          <TurnstileWidget siteKey={props.siteKey} />
          <Button block>Lihat Komisi</Button>
        </Form>
      </Card>
    </AppLayout>
  );
}

function groupClosings(rows: ClosingSummary[]): Map<number, ClosingSummary[]> {
  const groups = new Map<number, ClosingSummary[]>();
  for (const row of rows) {
    const list = groups.get(row.referral_id) ?? [];
    list.push(row);
    groups.set(row.referral_id, list);
  }
  return groups;
}

export const referralPage = new Hono<AppEnv>()
  .get("/r/:code", (c) => {
    const code = c.req.param("code").toUpperCase();
    if (!isValidReferralCode(code)) return c.notFound();
    return c.html(
      `<!doctype html>${String(<PinPage code={code} siteKey={c.env.TURNSTILE_SITE_KEY} />)}`,
    );
  })
  .get("/r/:code/brosur", async (c) => {
    const code = c.req.param("code").toUpperCase();
    if (!isValidReferralCode(code)) return c.notFound();
    const referrer = await findReferrerByCode(c.env.DB, code);
    return c.html(
      renderBrochureHtml({
        code,
        demoUrl: `https://demo.${c.env.BASE_DOMAIN}/kuliner?ref=${code}`,
        referrerName: referrer?.status === "active" ? referrer.name : undefined,
      }),
    );
  })
  .post("/r/:code", async (c) => {
    const code = c.req.param("code").toUpperCase();
    if (!isValidReferralCode(code)) return c.notFound();
    const siteKey = c.env.TURNSTILE_SITE_KEY;

    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    if (!pinAttempts.allow(`${code}:${ip}`, Date.now())) {
      return c.html(
        `<!doctype html>${String(
          <PinPage
            code={code}
            error="Terlalu banyak percobaan. Tunggu 1 menit."
            siteKey={siteKey}
          />,
        )}`,
        429,
      );
    }

    const values = formDataToValues(await c.req.formData());
    const humanOk = await verifyTurnstile(
      c.env.TURNSTILE_SECRET,
      values["cf-turnstile-response"] ?? "",
      c.req.header("cf-connecting-ip"),
      c.env.ENVIRONMENT,
    );
    if (!humanOk) {
      return c.html(
        `<!doctype html>${String(
          <PinPage code={code} error="Verifikasi anti-robot gagal. Coba lagi." siteKey={siteKey} />,
        )}`,
        400,
      );
    }
    const pin = (values.pin ?? "").trim();
    const referrer = await findReferrerByCode(c.env.DB, code);
    const expectedHash = referrer?.pin_hash;
    const providedHash =
      isValidPin(pin) && expectedHash
        ? await hashOneTimeToken(`${pin}:${c.env.AUTH_SECRET}`)
        : null;
    if (!referrer || !expectedHash || providedHash !== expectedHash) {
      return c.html(`<!doctype html>${String(<PinPage code={code} error="PIN salah." />)}`, 401);
    }
    if (referrer.status !== "active") {
      return c.html(
        `<!doctype html>${String(
          <PinPage
            code={code}
            error="Akun mitramu belum aktif — tunggu verifikasi admin, kami hubungi via WA."
          />,
        )}`,
        403,
      );
    }

    const scans = await countScans(c.env.DB, referrer.id);
    const rows = await listClosingsWithPayouts(c.env.DB, referrer.id);
    const totalPaid = rows
      .filter((row) => row.status === "paid")
      .reduce((sum, row) => sum + row.amount, 0);
    const closings = groupClosings(rows);

    return c.html(
      `<!doctype html>${String(
        <AppLayout title={`Komisi ${code} — tokoweb`} heading={`Halo, ${referrer.name}!`}>
          <StatRow>
            <StatTile value={String(scans)} label="scan brosurmu" />
            <StatTile value={String(closings.size)} label="klien closing" />
            <StatTile value={formatRupiah(totalPaid)} label="total diterima" />
          </StatRow>
          <Card>
            <CardTitle>Brosurmu</CardTitle>
            <Text>
              Cetak brosur ber-QR atas namamu, lalu bagikan ke pemilik warung. Mereka scan →
              langsung lihat contoh website + kamu dapat komisinya.
            </Text>
            <Text last>
              <TextLink href={`/r/${code}/brosur`} external>
                🖨️ Buka & cetak brosur →
              </TextLink>
            </Text>
          </Card>
          {[...closings.values()].map((payouts) => (
            <Card>
              <CardTitle>{payouts[0]?.tenant_name}</CardTitle>
              {payouts.map((payout) => {
                const status = STATUS_LABEL[payout.status] ?? STATUS_LABEL.pending;
                return (
                  <Text last>
                    Cicilan #{payout.installment} · {formatRupiah(payout.amount)}{" "}
                    <Badge tone={status?.tone ?? "muted"}>{status?.label}</Badge>
                  </Text>
                );
              })}
            </Card>
          ))}
          {closings.size === 0 ? (
            <Card>
              <Text last>
                Belum ada closing. Terus bagikan brosurmu — komisi sampai {formatRupiah(300_000)}{" "}
                per klien!
              </Text>
            </Card>
          ) : null}
          <GuideView guide={GUIDE_MITRA} />
        </AppLayout>,
      )}`,
    );
  });
