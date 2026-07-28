import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Card, StatRow, StatTile } from "@/ui/display";

export const adminDashboard = new Hono<AppEnv>().get("/", async (c) => {
  const [tenants, leads, intakes, payouts] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM tenants WHERE status = 'active'").first<{
      n: number;
    }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'new'").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM intake_forms WHERE processed = 0").first<{
      n: number;
    }>(),
    c.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM commission_payouts WHERE status = 'payable'",
    ).first<{
      n: number;
    }>(),
  ]);

  return c.html(
    adminHtml(
      <AdminPage title="Ringkasan" currentPath="/admin">
        <StatRow>
          <StatTile value={String(tenants?.n ?? 0)} label="tenant aktif" />
          <StatTile value={String(leads?.n ?? 0)} label="lead baru" />
          <StatTile value={String(intakes?.n ?? 0)} label="intake belum diproses" />
          <StatTile value={String(payouts?.n ?? 0)} label="payout siap cair" />
        </StatRow>
        <Card>
          <h2>Alur kerja harian</h2>
          <p class="small mb-0">
            1. Cek <a href="/admin/lead">lead baru</a> → follow-up WA. 2. Cek{" "}
            <a href="/admin/intake">intake</a> → kurasi → Go Live. 3. Cek{" "}
            <a href="/admin/payout">payout</a> → transfer ≤ 1 hari. 4. Verifikasi pembayaran QRIS di
            halaman <a href="/admin/tenant">tenant</a>.
          </p>
        </Card>
      </AdminPage>,
    ),
  );
});
