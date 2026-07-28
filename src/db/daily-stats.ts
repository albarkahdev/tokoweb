import type { DayWindow } from "@/domain/stats";

export async function upsertDailyStats(db: D1Database, window: DayWindow): Promise<void> {
  await db.batch([
    db
      .prepare(
        `INSERT INTO daily_stats (tenant_id, date, type, count)
         SELECT tenant_id, ?1, type, COUNT(*)
         FROM track_events
         WHERE ts >= ?2 AND ts < ?3
         GROUP BY tenant_id, type
         ON CONFLICT (tenant_id, date, type) DO UPDATE SET count = excluded.count`,
      )
      .bind(window.date, window.startUtc, window.endUtc),
    db
      .prepare(
        `INSERT INTO daily_stats (tenant_id, date, type, count)
         SELECT tenant_id, ?1, 'unique_visitors', COUNT(DISTINCT visitor_hash)
         FROM track_events
         WHERE ts >= ?2 AND ts < ?3
         GROUP BY tenant_id
         ON CONFLICT (tenant_id, date, type) DO UPDATE SET count = excluded.count`,
      )
      .bind(window.date, window.startUtc, window.endUtc),
  ]);
}

export async function pruneTrackEvents(db: D1Database, cutoffUtc: string): Promise<void> {
  await db.prepare("DELETE FROM track_events WHERE ts < ?1").bind(cutoffUtc).run();
}
