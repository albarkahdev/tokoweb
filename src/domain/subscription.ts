export type LifecycleStatus = "active" | "grace" | "suspended" | "archived";

const SUSPEND_AFTER_DAYS = 7;
const ARCHIVE_AFTER_DAYS = 90;
const DAY_MS = 86_400_000;

function dateToMs(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid date: ${date}`);
  }
  return Date.UTC(year, month - 1, day);
}

export function daysOverdue(nextDueDate: string, todayWib: string): number {
  return Math.floor((dateToMs(todayWib) - dateToMs(nextDueDate)) / DAY_MS);
}

export function lifecycleStatusFor(nextDueDate: string, todayWib: string): LifecycleStatus {
  const overdue = daysOverdue(nextDueDate, todayWib);
  if (overdue < 0) return "active";
  if (overdue >= ARCHIVE_AFTER_DAYS) return "archived";
  if (overdue >= SUSPEND_AFTER_DAYS) return "suspended";
  return "grace";
}

export function nextDueDateAfterPayment(currentDueDate: string): string {
  const [year, month, day] = currentDueDate.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid date: ${currentDueDate}`);
  }
  const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDayOfTargetMonth);
  return new Date(Date.UTC(year, month, clampedDay)).toISOString().slice(0, 10);
}

export function wibDateOf(nowMs: number): string {
  return new Date(nowMs + 7 * 3_600_000).toISOString().slice(0, 10);
}
