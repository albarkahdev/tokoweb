import { formatRupiah } from "@/domain/money";
import { wibDateOf } from "@/domain/subscription";

export const MAX_BILLING_PROOF_BYTES = 512_000;

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

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

export function isValidPeriod(period: string): boolean {
  if (!PERIOD_PATTERN.test(period)) return false;
  const month = Number(period.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function periodOf(date: string): string {
  return date.slice(0, 7);
}

export function currentBillingPeriod(nextDueDate: string | null, nowMs: number): string {
  const base = nextDueDate ?? wibDateOf(nowMs);
  return periodOf(base);
}

export function amountDue(monthlyPrice: number | null | undefined): number {
  return monthlyPrice ?? 0;
}

export function formatPeriodLabel(period: string): string {
  if (!isValidPeriod(period)) return period;
  const year = period.slice(0, 4);
  const month = Number(period.slice(5, 7));
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function isBillingProofValid(type: string, size: number): boolean {
  return type === "image/webp" && size > 0 && size <= MAX_BILLING_PROOF_BYTES;
}

export function buildBillingWaMessage(input: {
  businessName: string;
  slug: string;
  period: string;
  amount: number;
}): string {
  return `[BAYAR LANGGANAN] ${input.businessName} (${input.slug}) — periode ${formatPeriodLabel(
    input.period,
  )}, nominal ${formatRupiah(input.amount)}. Bukti transfer sudah saya upload di CMS. Mohon dicek, terima kasih.`;
}

export function billingWaLink(adminNumber: string, message: string): string {
  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
}
