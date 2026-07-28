import { describe, expect, it } from "vitest";
import { buildMonthlyReportText, previousMonthRange } from "@/domain/report";

describe("previousMonthRange", () => {
  it("computes previous month within a year", () => {
    expect(previousMonthRange("2026-07-28")).toEqual({
      label: "Juni 2026",
      from: "2026-06-01",
      to: "2026-06-30",
    });
  });

  it("crosses year boundary in january", () => {
    expect(previousMonthRange("2026-01-05")).toEqual({
      label: "Desember 2025",
      from: "2025-12-01",
      to: "2025-12-31",
    });
  });
});

describe("buildMonthlyReportText", () => {
  const totals = { pageViews: 250, waClicks: 32, phoneClicks: 5, mapsClicks: 12 };

  it("builds full report with delta and top promo", () => {
    const text = buildMonthlyReportText(
      "Warung Bu Sari",
      "Juli 2026",
      totals,
      { pageViews: 200, waClicks: 20, phoneClicks: 3, mapsClicks: 10 },
      { title: "Diskon Merdeka", clicks: 18 },
    );
    expect(text).toContain("Laporan Warung Bu Sari — Juli 2026");
    expect(text).toContain("👀 250 kunjungan (naik 25% vs bulan lalu)");
    expect(text).toContain("💬 32 klik WhatsApp");
    expect(text).toContain("🔥 Promo terpopuler: Diskon Merdeka (18 klik)");
    expect(text).toContain("Lanjutkan! 💪");
  });

  it("omits delta and promo when unavailable", () => {
    const text = buildMonthlyReportText("Warung", "Juli 2026", totals, null, null);
    expect(text).toContain("👀 250 kunjungan\n");
    expect(text).not.toContain("Promo terpopuler");
  });

  it("reports decline honestly", () => {
    const text = buildMonthlyReportText(
      "Warung",
      "Juli 2026",
      totals,
      { pageViews: 500, waClicks: 0, phoneClicks: 0, mapsClicks: 0 },
      null,
    );
    expect(text).toContain("turun 50% vs bulan lalu");
  });
});
