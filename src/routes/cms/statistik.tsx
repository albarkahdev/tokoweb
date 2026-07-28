import { Hono } from "hono";
import {
  busiestDayBetween,
  type StatTotals,
  statTotalsBetween,
  topPromoBetween,
} from "@/db/stats-read";
import { addDays, sqlUtcDateTime } from "@/domain/stats";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import { Card, StatRow, StatTile } from "@/ui/display";

const DAY_MS = 86_400_000;

function narrate(week: StatTotals, prevWeek: StatTotals): string[] {
  const insights: string[] = [];
  if (week.waClicks > 0) {
    insights.push(
      `${week.waClicks} orang klik tombol WhatsApp minggu ini — itu calon pembeli yang menghubungimu langsung.`,
    );
  }
  if (prevWeek.pageViews > 0) {
    const delta = Math.round(((week.pageViews - prevWeek.pageViews) / prevWeek.pageViews) * 100);
    if (delta > 0) insights.push(`Kunjungan naik ${delta}% dibanding minggu lalu. 📈`);
    else if (delta < 0)
      insights.push(
        `Kunjungan turun ${Math.abs(delta)}% dibanding minggu lalu — coba pasang promo baru.`,
      );
  }
  if (week.mapsClicks > 0) {
    insights.push(`${week.mapsClicks} orang buka lokasi di Maps — mereka berniat datang.`);
  }
  if (insights.length === 0) {
    insights.push(
      "Belum ada aktivitas minggu ini. Bagikan link websitemu di status WA dan Instagram!",
    );
  }
  return insights;
}

export const cmsStatistik = new Hono<AppEnv>().get("/statistik", async (c) => {
  const cms = await loadCms(c);
  if (!cms) return c.redirect("/masuk");
  const today = wibDateOf(Date.now());
  const week = await statTotalsBetween(
    c.env.DB,
    cms.tenant.id,
    addDays(today, -7),
    addDays(today, -1),
  );
  const prevWeek = await statTotalsBetween(
    c.env.DB,
    cms.tenant.id,
    addDays(today, -14),
    addDays(today, -8),
  );
  const month = await statTotalsBetween(
    c.env.DB,
    cms.tenant.id,
    addDays(today, -30),
    addDays(today, -1),
  );
  const busiest = await busiestDayBetween(
    c.env.DB,
    cms.tenant.id,
    addDays(today, -30),
    addDays(today, -1),
  );
  const topPromo = await topPromoBetween(
    c.env.DB,
    cms.tenant.id,
    sqlUtcDateTime(Date.now() - 30 * DAY_MS),
  );

  return c.html(
    html(
      <CmsPage title="Statistik" currentPath="/statistik" cms={cms}>
        <Card>
          <h2>Minggu ini</h2>
          {narrate(week, prevWeek).map((insight) => (
            <p>{insight}</p>
          ))}
        </Card>
        <StatRow>
          <StatTile value={String(week.pageViews)} label="kunjungan 7 hari" />
          <StatTile value={String(week.waClicks)} label="klik WhatsApp" />
          <StatTile value={String(week.uniqueVisitors)} label="pengunjung unik" />
        </StatRow>
        <Card>
          <h2>30 hari terakhir</h2>
          <p>
            👀 {month.pageViews} kunjungan · 💬 {month.waClicks} klik WA · 📞 {month.phoneClicks}{" "}
            telepon · 📍 {month.mapsClicks} buka Maps
          </p>
          {busiest ? (
            <p>
              Hari teramai: <strong>{busiest.date}</strong> ({busiest.count} kunjungan).
            </p>
          ) : null}
          {topPromo ? (
            <p>
              🔥 Promo terpopuler: <strong>{topPromo.title}</strong> ({topPromo.clicks} klik).
            </p>
          ) : null}
          <p class="small muted mb-0">
            Angka diperbarui tiap malam. Data pengunjung anonim — tanpa cookie, tanpa pelacakan
            pribadi.
          </p>
        </Card>
      </CmsPage>,
    ),
  );
});
