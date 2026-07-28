import { pruneTrackEvents, upsertDailyStats } from "@/db/daily-stats";
import { pruneCutoffUtc, yesterdayWibWindow } from "@/domain/stats";
import type { Bindings } from "@/env";

export async function runDailyJobs(env: Bindings, nowMs: number): Promise<void> {
  await upsertDailyStats(env.DB, yesterdayWibWindow(nowMs));
  await pruneTrackEvents(env.DB, pruneCutoffUtc(nowMs));
}
