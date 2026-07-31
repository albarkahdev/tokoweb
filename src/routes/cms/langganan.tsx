import { Hono } from "hono";
import { findPendingSubmission } from "@/db/billing";
import { getSiteContent } from "@/db/contents";
import { findPayment, listPayments } from "@/db/payments";
import { formatPeriodLabel } from "@/domain/billing";
import { invoiceLineLabel, invoiceNumber } from "@/domain/invoice";
import { formatRupiah } from "@/domain/money";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import {
  Actions,
  Alert,
  Card,
  CardTitle,
  Cell,
  EmptyState,
  ListTable,
  Row,
  Text,
  TextLink,
} from "@/ui/display";
import { LinkButton } from "@/ui/form";
import { renderInvoiceHtml } from "@/ui/invoice";

function dateLabel(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z"));
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export const cmsLangganan = new Hono<AppEnv>()
  .get("/langganan", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const payments = await listPayments(c.env.DB, cms.tenant.id);
    const pending = await findPendingSubmission(c.env.DB, cms.tenant.id);
    return c.html(
      html(
        <CmsPage title="Langganan & Invoice" currentPath="/langganan" cms={cms}>
          <Card>
            <CardTitle>Bayar Langganan</CardTitle>
            {pending ? (
              <Alert tone="warning">
                Bukti untuk {formatPeriodLabel(pending.period)} sedang menunggu verifikasi admin.
              </Alert>
            ) : (
              <Text muted>
                Transfer ke rekening TokoWeb lalu upload bukti — kami cek dan tandai lunas.
              </Text>
            )}
            <Actions>
              <LinkButton href="/bayar">
                {pending ? "Lihat / Upload Ulang" : "Bayar Sekarang"}
              </LinkButton>
            </Actions>
          </Card>
          <Card>
            <CardTitle>Riwayat Pembayaran</CardTitle>
            {payments.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="Belum ada pembayaran"
                hint="Invoice muncul di sini setelah pembayaran diverifikasi admin."
              />
            ) : (
              <ListTable headers={["Tanggal", "Keterangan", "Jumlah", ""]}>
                {payments.map((payment) => (
                  <Row>
                    <Cell small>{dateLabel(payment.confirmed_at)}</Cell>
                    <Cell>{invoiceLineLabel(payment.kind, payment.period)}</Cell>
                    <Cell>{formatRupiah(payment.amount)}</Cell>
                    <Cell>
                      <TextLink href={`/invoice/${payment.id}`} external>
                        Invoice →
                      </TextLink>
                    </Cell>
                  </Row>
                ))}
              </ListTable>
            )}
            <Text small muted last>
              Klik “Invoice” untuk membuka versi cetak — bisa disimpan sebagai PDF dari HP maupun
              komputer.
            </Text>
          </Card>
        </CmsPage>,
      ),
    );
  })
  .get("/invoice/:id", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) return c.notFound();
    const payment = await findPayment(c.env.DB, id, cms.tenant.id);
    if (!payment) return c.notFound();
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    const info = content.info ?? {};
    return c.html(
      renderInvoiceHtml(
        {
          number: invoiceNumber(payment.id, payment.period),
          dateLabel: dateLabel(payment.confirmed_at),
          paid: payment.confirmed_at !== null,
          business: info.name ?? cms.tenant.name,
          address: info.address,
          lineLabel: invoiceLineLabel(payment.kind, payment.period),
          amount: payment.amount,
        },
        "/langganan",
      ),
    );
  });
