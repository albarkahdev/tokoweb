import { describe, expect, it } from "vitest";
import { pruneCutoffUtc, sqlUtcDateTime, yesterdayWibWindow } from "@/domain/stats";

describe("yesterdayWibWindow", () => {
  it("computes yesterday WIB day when cron fires at 00:30 WIB", () => {
    const window = yesterdayWibWindow(Date.UTC(2026, 6, 29, 17, 30));
    expect(window).toEqual({
      date: "2026-07-29",
      startUtc: "2026-07-28 17:00:00",
      endUtc: "2026-07-29 17:00:00",
    });
  });

  it("computes correct day just before WIB midnight", () => {
    const window = yesterdayWibWindow(Date.UTC(2026, 6, 29, 16, 0));
    expect(window).toEqual({
      date: "2026-07-28",
      startUtc: "2026-07-27 17:00:00",
      endUtc: "2026-07-28 17:00:00",
    });
  });

  it("crosses month boundary correctly", () => {
    const window = yesterdayWibWindow(Date.UTC(2026, 7, 1, 17, 30));
    expect(window.date).toBe("2026-08-01");
    expect(window.startUtc).toBe("2026-07-31 17:00:00");
  });
});

describe("pruneCutoffUtc", () => {
  it("is 90 days before now in SQL datetime format", () => {
    expect(pruneCutoffUtc(Date.UTC(2026, 6, 29, 17, 30))).toBe("2026-04-30 17:30:00");
  });
});

describe("sqlUtcDateTime", () => {
  it("matches D1 datetime('now') format", () => {
    expect(sqlUtcDateTime(Date.UTC(2026, 0, 5, 3, 7, 9))).toBe("2026-01-05 03:07:09");
  });
});
