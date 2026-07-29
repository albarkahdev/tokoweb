import { Hono } from "hono";
import { countScans } from "@/db/referrals";
import {
  createReferrer,
  findReferrerByCode,
  listReferrers,
  setReferrerStatus,
} from "@/db/referrers";
import { formDataToValues } from "@/domain/cms";
import { hashOneTimeToken } from "@/domain/one-time-token";
import { generateReferralCode } from "@/domain/referral-code";
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
  Strong,
} from "@/ui/display";
import { Button, Field, Form, HiddenInput } from "@/ui/form";

export async function hashPin(pin: string, secret: string): Promise<string> {
  return hashOneTimeToken(`${pin}:${secret}`);
}

export const adminReferrers = new Hono<AppEnv>()
  .get("/referrer", async (c) => {
    const referrers = await listReferrers(c.env.DB);
    const scanCounts = await Promise.all(
      referrers.map((referrer) => countScans(c.env.DB, referrer.id)),
    );
    return c.html(
      adminHtml(
        <AdminPage
          title="Mitra"
          currentPath="/admin/referrer"
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        >
          <Card>
            <CardTitle>Mitra ({referrers.length})</CardTitle>
            {referrers.length === 0 ? (
              <EmptyState
                icon="🛵"
                title="Belum ada mitra"
                hint="Daftarkan mitra pertamamu (ojol, sales, siapa pun) — kode unik + brosur QR jadi mesin distribusimu."
              />
            ) : (
              <ListTable headers={["Nama", "Kode", "Scan", ""]}>
                {referrers.map((referrer, index) => (
                  <Row>
                    <CellStack top={referrer.name} bottom={referrer.wa_number} />
                    <Cell>
                      <Strong>{referrer.code}</Strong>{" "}
                      {referrer.status === "inactive" ? (
                        <Badge tone="danger">nonaktif</Badge>
                      ) : referrer.status === "pending" ? (
                        <Badge tone="warning">menunggu ✋</Badge>
                      ) : null}
                    </Cell>
                    <Cell>{scanCounts[index]}</Cell>
                    <Cell>
                      {referrer.status === "pending" ? (
                        <Actions>
                          <Form action={`/admin/referrer/${referrer.id}/status`}>
                            <HiddenInput name="status" value="active" />
                            <Button>Setujui ✓</Button>
                          </Form>
                          <Form action={`/admin/referrer/${referrer.id}/status`}>
                            <HiddenInput name="status" value="inactive" />
                            <Button variant="secondary">Tolak</Button>
                          </Form>
                        </Actions>
                      ) : (
                        <Form action={`/admin/referrer/${referrer.id}/status`}>
                          <HiddenInput
                            name="status"
                            value={referrer.status === "active" ? "inactive" : "active"}
                          />
                          <Button variant="secondary">
                            {referrer.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </Form>
                      )}
                    </Cell>
                  </Row>
                ))}
              </ListTable>
            )}
          </Card>
          <Card>
            <CardTitle>Daftarkan Mitra Baru</CardTitle>
            <Form action="/admin/referrer">
              <Field label="Nama" name="name" required />
              <Field label="No WA" name="wa_number" inputmode="numeric" required hint="62xxx" />
              <Field label="Rekening (bank + nomor)" name="bank_account" />
              <Field
                label="PIN 4 digit"
                name="pin"
                inputmode="numeric"
                required
                hint="Untuk halaman komisi /r/KODE"
              />
              <Button block>Daftarkan + buat kode</Button>
            </Form>
          </Card>
        </AdminPage>,
      ),
    );
  })
  .post("/referrer", async (c) => {
    const values = formDataToValues(await c.req.formData());
    const name = (values.name ?? "").trim();
    const waNumber = (values.wa_number ?? "").replace(/\D/g, "");
    const pin = (values.pin ?? "").trim();
    if (!name || !/^62\d{8,13}$/.test(waNumber) || !/^\d{4}$/.test(pin)) {
      return c.redirect("/admin/referrer?err=Nama, no WA (62xxx), dan PIN 4 digit wajib.");
    }
    let code = generateReferralCode(Math.random);
    for (let attempt = 0; attempt < 5 && (await findReferrerByCode(c.env.DB, code)); attempt++) {
      code = generateReferralCode(Math.random);
    }
    await createReferrer(c.env.DB, {
      code,
      name,
      waNumber,
      bankAccount: (values.bank_account ?? "").trim() || null,
      pinHash: await hashPin(pin, c.env.AUTH_SECRET),
      status: "active",
    });
    return c.redirect(
      `/admin/referrer?ok=Terdaftar. Kode: ${code} — URL QR: https://demo.${c.env.BASE_DOMAIN}/kuliner?ref=${code} (PIN jangan lupa dibagikan)`,
    );
  })
  .post("/referrer/:id/status", async (c) => {
    const values = formDataToValues(await c.req.formData());
    const status = values.status === "inactive" ? "inactive" : "active";
    await setReferrerStatus(c.env.DB, Number(c.req.param("id")), status);
    return c.redirect("/admin/referrer?ok=Status diperbarui.");
  });
