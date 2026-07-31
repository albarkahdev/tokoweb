import { Hono } from "hono";
import { getSiteContent } from "@/db/contents";
import {
  busiestDayBetween,
  orderCountsBetween,
  peakOrderHourBetween,
  type StatTotals,
  statTotalsBetween,
  topOrderItemsBetween,
  topPromoBetween,
} from "@/db/stats-read";
import { narrateOrders } from "@/domain/order-stats";
import { addDays, sqlUtcDateTime } from "@/domain/stats";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { CmsPage, html, loadCms } from "@/routes/cms/shared";
import { Card, CardTitle, Insight, StatRow, StatTile, Strong, Text } from "@/ui/display";

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

  const content = await getSiteContent(c.env.DB, cms.tenant.id);
  const orderingOn = content.order_settings?.enabled ?? false;
  const monthFrom = addDays(today, -30);
  const monthTo = addDays(today, -1);
  const orderCounts = orderingOn
    ? await orderCountsBetween(c.env.DB, cms.tenant.id, monthFrom, monthTo)
    : null;
  const topItems = orderingOn
    ? await topOrderItemsBetween(c.env.DB, cms.tenant.id, monthFrom, monthTo, 3)
    : [];
  const peakHour = orderingOn
    ? await peakOrderHourBetween(c.env.DB, cms.tenant.id, monthFrom, monthTo)
    : null;

  return c.html(
    html(
      <CmsPage title="Statistik" currentPath="/statistik" cms={cms}>
        <Card>
          <CardTitle>Minggu ini</CardTitle>
          {narrate(week, prevWeek).map((insight) => (
            <Insight>{insight}</Insight>
          ))}
        </Card>
        <StatRow>
          <StatTile value={String(week.pageViews)} label="kunjungan 7 hari" />
          <StatTile value={String(week.waClicks)} label="klik WhatsApp" />
          <StatTile value={String(week.uniqueVisitors)} label="pengunjung unik" />
        </StatRow>
        <Card>
          <CardTitle>30 hari terakhir</CardTitle>
          <Text>
            👀 {month.pageViews} kunjungan · 💬 {month.waClicks} klik WA · 📞 {month.phoneClicks}{" "}
            telepon · 📍 {month.mapsClicks} buka Maps
          </Text>
          {busiest ? (
            <Text>
              Hari teramai: <Strong>{busiest.date}</Strong> ({busiest.count} kunjungan).
            </Text>
          ) : null}
          {topPromo ? (
            <Text>
              🔥 Promo terpopuler: <Strong>{topPromo.title}</Strong> ({topPromo.clicks} klik).
            </Text>
          ) : null}
          <Text small muted last>
            Angka diperbarui tiap malam. Data pengunjung anonim — tanpa cookie, tanpa pelacakan
            pribadi.
          </Text>
        </Card>
        {orderCounts ? (
          <>
            <Card>
              <CardTitle>Pesanan (30 hari)</CardTitle>
              {narrateOrders(orderCounts, topItems, peakHour).map((insight) => (
                <Insight>{insight}</Insight>
              ))}
            </Card>
            <StatRow>
              <StatTile value={String(orderCounts.masuk)} label="pesanan masuk" />
              <StatTile value={String(orderCounts.selesai)} label="selesai" />
              <StatTile value={String(orderCounts.dibatalkan)} label="dibatalkan" />
            </StatRow>
            {topItems.length > 0 ? (
              <Card>
                <CardTitle>Menu terlaris</CardTitle>
                {topItems.map((item, index) => (
                  <Text last={index === topItems.length - 1}>
                    {index + 1}. <Strong>{item.name}</Strong> — {item.qty} porsi
                  </Text>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}
      </CmsPage>,
    ),
  );
});
