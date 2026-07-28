import { Hono } from "hono";
import { listPayablePayouts, markPayoutPaid } from "@/db/payouts";
import { formDataToValues } from "@/domain/cms";
import { formatRupiah } from "@/domain/money";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Card, ListTable } from "@/ui/display";
import { Button } from "@/ui/form";

export const adminPayouts = new Hono<AppEnv>()
  .get("/payout", async (c) => {
    const payable = await listPayablePayouts(c.env.DB);
    const total = payable.reduce((sum, payout) => sum + payout.amount, 0);
    return c.html(
      adminHtml(
        <AdminPage title="Payout" currentPath="/admin/payout" notice={c.req.query("ok")}>
          <Card>
            <h2>Siap cair ({payable.length})</h2>
            {payable.length > 0 ? (
              <p>
                Total transfer: <strong>{formatRupiah(total)}</strong> — target ≤ 1 hari kerja.
              </p>
            ) : (
              <p class="muted">Tidak ada cicilan menunggu transfer.</p>
            )}
            <ListTable headers={["Ojol", "Klien", "Cicilan", ""]}>
              {payable.map((payout) => (
                <tr>
                  <td>{payout.referrer_name}</td>
                  <td class="small">{payout.tenant_name}</td>
                  <td>
                    #{payout.installment} · {formatRupiah(payout.amount)}
                  </td>
                  <td>
                    <form method="post" action="/admin/payout/paid">
                      <input type="hidden" name="id" value={String(payout.id)} />
                      <Button>Sudah ditransfer</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </ListTable>
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
