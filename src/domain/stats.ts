const WIB_OFFSET_MS = 7 * 3_600_000;
const DAY_MS = 86_400_000;
const PRUNE_AFTER_DAYS = 90;

export type DayWindow = {
  date: string;
  startUtc: string;
  endUtc: string;
};

export function sqlUtcDateTime(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}

export function yesterdayWibWindow(nowMs: number): DayWindow {
  const wibNow = nowMs + WIB_OFFSET_MS;
  const wibTodayStart = Math.floor(wibNow / DAY_MS) * DAY_MS;
  const wibYesterdayStart = wibTodayStart - DAY_MS;
  const startUtcMs = wibYesterdayStart - WIB_OFFSET_MS;
  return {
    date: new Date(wibYesterdayStart).toISOString().slice(0, 10),
    startUtc: sqlUtcDateTime(startUtcMs),
    endUtc: sqlUtcDateTime(startUtcMs + DAY_MS),
  };
}

export function pruneCutoffUtc(nowMs: number): string {
  return sqlUtcDateTime(nowMs - PRUNE_AFTER_DAYS * DAY_MS);
}
