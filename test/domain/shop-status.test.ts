import { describe, expect, it } from "vitest";
import { isManuallyClosed, isOpenAt, type OpenHours, shopStatusAt } from "@/domain/shop-status";

const HOURS: OpenHours = {
  mon: ["08:00", "21:00"],
  sun: null,
};

describe("shop-status", () => {
  it("isManuallyClosed hanya true saat active", () => {
    expect(isManuallyClosed({ active: true, reason: "libur" })).toBe(true);
    expect(isManuallyClosed({ active: false })).toBe(false);
    expect(isManuallyClosed(undefined)).toBe(false);
  });

  it("isOpenAt di dalam & luar jam", () => {
    expect(isOpenAt(HOURS, "mon", "10:00")).toBe(true);
    expect(isOpenAt(HOURS, "mon", "08:00")).toBe(true);
    expect(isOpenAt(HOURS, "mon", "21:00")).toBe(true);
    expect(isOpenAt(HOURS, "mon", "07:59")).toBe(false);
    expect(isOpenAt(HOURS, "mon", "21:01")).toBe(false);
    expect(isOpenAt(HOURS, "sun", "10:00")).toBe(false);
    expect(isOpenAt(HOURS, "tue", "10:00")).toBe(false);
    expect(isOpenAt(undefined, "mon", "10:00")).toBe(false);
  });

  it("shopStatusAt: manual menang atas jadwal", () => {
    expect(shopStatusAt(HOURS, { active: true }, "mon", "10:00")).toBe("closed_manual");
    expect(shopStatusAt(HOURS, undefined, "mon", "10:00")).toBe("open");
    expect(shopStatusAt(HOURS, { active: false }, "mon", "23:00")).toBe("closed_schedule");
    expect(shopStatusAt(HOURS, undefined, "sun", "10:00")).toBe("closed_schedule");
  });
});
