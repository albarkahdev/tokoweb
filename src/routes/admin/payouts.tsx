import { Hono } from "hono";
import { listPayablePayouts, markPayoutPaid } from "@/db/payouts";
import { formDataToValues } from "@/domain/cms";
import { formatRupiah } from "@/domain/money";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Card, CardTitle, Cell, EmptyState, ListTable, Row, Strong, Text } from "@/ui/display";
import { Button, Form, HiddenInput } from "@/ui/form";

export const adminPayouts = new Hono<AppEnv>()
  .get("/payout", async (c) => {
    const payable = await listPayablePayouts(c.env.DB);
    const total = payable.reduce((sum, payout) => sum + payout.amount, 0);
    return c.html(
      adminHtml(
        <AdminPage title="Payout" currentPath="/admin/payout" notice={c.req.query("ok")}>
          <Card>
            <CardTitle>Siap cair ({payable.length})</CardTitle>
            {payable.length > 0 ? (
              <>
                <Text>
                  Total transfer: <Strong>{formatRupiah(total)}</Strong> — target ≤ 1 hari kerja.
                </Text>
                <ListTable headers={["Ojol", "Klien", "Cicilan", ""]}>
                  {payable.map((payout) => (
                    <Row>
                      <Cell>{payout.referrer_name}</Cell>
                      <Cell small>{payout.tenant_name}</Cell>
                      <Cell>
                        #{payout.installment} · {formatRupiah(payout.amount)}
                      </Cell>
                      <Cell>
                        <Form
                          action="/admin/payout/paid"
                          confirm={`Tandai cicilan #${payout.installment} ${payout.referrer_name} (${formatRupiah(payout.amount)}) sudah ditransfer?`}
                        >
                          <HiddenInput name="id" value={String(payout.id)} />
                          <Button>Sudah ditransfer</Button>
                        </Form>
                      </Cell>
                    </Row>
                  ))}
                </ListTable>
              </>
            ) : (
              <EmptyState
                icon="💸"
                title="Tidak ada cicilan menunggu transfer"
                hint="Cicilan komisi jadi siap cair setelah pembayaran klien diverifikasi."
              />
            )}
          </Card>
        </AdminPage>,
      ),
    );
  })
  .post("/payout/paid", async (c) => {
    const values = formDataToValues(await c.req.formData());
    await markPayoutPaid(c.env.DB, Number(values.id), Date.now());
    return c.redirect("/admin/payout?ok=Payout ditandai sudah ditransfer.");
  });
