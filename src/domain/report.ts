export type MonthTotals = {
  pageViews: number;
  waClicks: number;
  phoneClicks: number;
  mapsClicks: number;
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function previousMonthRange(todayWib: string): {
  label: string;
  from: string;
  to: string;
} {
  const [year, month] = todayWib.split("-").map(Number);
  if (year === undefined || month === undefined) throw new Error(`Invalid date: ${todayWib}`);
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const lastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    label: `${MONTH_NAMES[prevMonth - 1]} ${prevYear}`,
    from: `${prevYear}-${pad(prevMonth)}-01`,
    to: `${prevYear}-${pad(prevMonth)}-${pad(lastDay)}`,
  };
}

export function buildMonthlyReportText(
  businessName: string,
  monthLabel: string,
  totals: MonthTotals,
  previous: MonthTotals | null,
  topPromo: { title: string; clicks: number } | null,
): string {
  const delta =
    previous && previous.pageViews > 0
      ? Math.round(((totals.pageViews - previous.pageViews) / previous.pageViews) * 100)
      : null;
  const deltaText =
    delta === null
      ? ""
      : delta >= 0
        ? ` (naik ${delta}% vs bulan lalu)`
        : ` (turun ${Math.abs(delta)}% vs bulan lalu)`;

  const lines = [
    `Laporan ${businessName} — ${monthLabel}`,
    `👀 ${totals.pageViews} kunjungan${deltaText}`,
    `💬 ${totals.waClicks} klik WhatsApp`,
    `📞 ${totals.phoneClicks} klik telepon`,
    `📍 ${totals.mapsClicks} klik lokasi`,
  ];
  if (topPromo) lines.push(`🔥 Promo terpopuler: ${topPromo.title} (${topPromo.clicks} klik)`);
  lines.push("Websitemu bekerja untukmu. Lanjutkan! 💪");
  return lines.join("\n");
}
