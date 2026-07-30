export type DayHours = [string, string] | null;
export type OpenHours = Record<string, DayHours>;
export type TempClosed = { active?: boolean; reason?: string } | undefined;
export type ShopStatus = "open" | "closed_schedule" | "closed_manual";

export const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function isManuallyClosed(temp: TempClosed): boolean {
  return temp?.active === true;
}

export function isOpenAt(hours: OpenHours | undefined, weekday: string, hhmm: string): boolean {
  const today = hours?.[weekday];
  if (!today) return false;
  const [open, close] = today;
  return hhmm >= open && hhmm <= close;
}

export function shopStatusAt(
  hours: OpenHours | undefined,
  temp: TempClosed,
  weekday: string,
  hhmm: string,
): ShopStatus {
  if (isManuallyClosed(temp)) return "closed_manual";
  return isOpenAt(hours, weekday, hhmm) ? "open" : "closed_schedule";
}
