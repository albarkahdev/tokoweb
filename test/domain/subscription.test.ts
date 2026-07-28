import { describe, expect, it } from "vitest";
import {
  daysOverdue,
  lifecycleStatusFor,
  nextDueDateAfterPayment,
  wibDateOf,
} from "@/domain/subscription";

describe("lifecycleStatusFor", () => {
  it("is active before due date", () => {
    expect(lifecycleStatusFor("2026-08-15", "2026-08-14")).toBe("active");
  });

  it("enters grace on due date", () => {
    expect(lifecycleStatusFor("2026-08-15", "2026-08-15")).toBe("grace");
    expect(lifecycleStatusFor("2026-08-15", "2026-08-21")).toBe("grace");
  });

  it("suspends at H+7", () => {
    expect(lifecycleStatusFor("2026-08-15", "2026-08-22")).toBe("suspended");
    expect(lifecycleStatusFor("2026-08-15", "2026-11-12")).toBe("suspended");
  });

  it("archives at H+90", () => {
    expect(lifecycleStatusFor("2026-08-15", "2026-11-13")).toBe("archived");
  });
});

describe("daysOverdue", () => {
  it("is negative before due", () => {
    expect(daysOverdue("2026-08-15", "2026-08-12")).toBe(-3);
  });
});

describe("nextDueDateAfterPayment", () => {
  it("advances one month", () => {
    expect(nextDueDateAfterPayment("2026-08-15")).toBe("2026-09-15");
  });

  it("clamps to shorter month", () => {
    expect(nextDueDateAfterPayment("2026-08-31")).toBe("2026-09-30");
    expect(nextDueDateAfterPayment("2027-01-30")).toBe("2027-02-28");
  });

  it("crosses year boundary", () => {
    expect(nextDueDateAfterPayment("2026-12-15")).toBe("2027-01-15");
  });
});

describe("wibDateOf", () => {
  it("shifts UTC evening into next WIB day", () => {
    expect(wibDateOf(Date.UTC(2026, 6, 28, 18, 0))).toBe("2026-07-29");
    expect(wibDateOf(Date.UTC(2026, 6, 28, 12, 0))).toBe("2026-07-28");
  });
});
