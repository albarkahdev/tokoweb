import type { OrderStatCounts } from "@/db/stats-read";

export function conversionRate(counts: OrderStatCounts): number {
  if (counts.masuk === 0) return 0;
  return Math.round((counts.selesai / counts.masuk) * 100);
}

export function narrateOrders(
  counts: OrderStatCounts,
  topItems: { name: string; qty: number }[],
  peakHour: { hour: number; count: number } | null,
): string[] {
  if (counts.masuk === 0) {
    return [
      "Belum ada pesanan periode ini. Sebarkan link websitemu dan tombol Pesan Online di status WA & Instagram.",
    ];
  }
  const insights: string[] = [];
  if (counts.selesai > 0) {
    insights.push(
      `${counts.masuk} pesanan masuk, ${counts.selesai} selesai — konversi ${conversionRate(counts)}%.`,
    );
  } else {
    insights.push(`${counts.masuk} pesanan masuk periode ini.`);
  }
  if (counts.diproses > 0) {
    insights.push(`${counts.diproses} pesanan masih berjalan (menunggu/diproses).`);
  }
  if (counts.dibatalkan > 0) {
    insights.push(
      `${counts.dibatalkan} dibatalkan — cek stok atau kecepatan konfirmasi saat ramai.`,
    );
  }
  const top = topItems[0];
  if (top) {
    insights.push(`Menu terlaris: ${top.name} (${top.qty} porsi terjual).`);
  }
  if (peakHour) {
    insights.push(`Jam paling ramai sekitar pukul ${String(peakHour.hour).padStart(2, "0")}.00.`);
  }
  return insights;
}
