import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { AdminPage, adminHtml } from "@/routes/admin/shared";
import { Card, CardTitle, StatRow, StatTile, Text, TextLink } from "@/ui/display";

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
          <CardTitle>Alur kerja harian</CardTitle>
          <Text small last>
            1. Cek <TextLink href="/admin/lead">lead baru</TextLink> → follow-up WA. 2. Cek{" "}
            <TextLink href="/admin/intake">intake</TextLink> → kurasi → Go Live. 3. Cek{" "}
            <TextLink href="/admin/payout">payout</TextLink> → transfer ≤ 1 hari. 4. Verifikasi
            pembayaran QRIS di halaman <TextLink href="/admin/tenant">tenant</TextLink>.
          </Text>
        </Card>
      </AdminPage>,
    ),
  );
});
