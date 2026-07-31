import type { MenuItem } from "@/domain/content";
import { formatRupiah } from "@/domain/money";

export const ORDER_STATUSES = [
  "baru",
  "menunggu_bayar",
  "cek_bayar",
  "diproses",
  "selesai",
  "dibatalkan",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILLMENTS = ["dine_in", "pickup"] as const;
export type Fulfillment = (typeof FULFILLMENTS)[number];

export type OrderTimestamps = {
  confirmed_at: string | null;
  paid_at: string | null;
  verified_at: string | null;
  processed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

export type OrderState = { status: OrderStatus } & OrderTimestamps;

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  baru: ["menunggu_bayar", "dibatalkan"],
  menunggu_bayar: ["cek_bayar", "dibatalkan"],
  cek_bayar: ["diproses", "menunggu_bayar", "dibatalkan"],
  diproses: ["selesai"],
  selesai: [],
  dibatalkan: [],
};

const STATUS_STAMP: Record<OrderStatus, (keyof OrderTimestamps)[]> = {
  baru: [],
  menunggu_bayar: ["confirmed_at"],
  cek_bayar: ["paid_at"],
  diproses: ["verified_at", "processed_at"],
  selesai: ["completed_at"],
  dibatalkan: ["cancelled_at"],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function isFulfillment(value: string): value is Fulfillment {
  return (FULFILLMENTS as readonly string[]).includes(value);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function applyTransition<T extends OrderState>(
  order: T,
  to: OrderStatus,
  nowIso: string,
): T {
  if (!canTransition(order.status, to)) {
    throw new Error(`Transisi ilegal: ${order.status} → ${to}`);
  }
  const next: T = { ...order, status: to };
  for (const field of STATUS_STAMP[to]) {
    if (!next[field]) {
      (next as OrderTimestamps)[field] = nowIso;
    }
  }
  return next;
}

export type OrderLine = { unit_price: number; qty: number };
export type OrderFee = { label: string; amount: number };
export type OrderTotals = {
  subtotal: number;
  tax_amount: number;
  fee_amount: number;
  total: number;
};

function nonNegativeInt(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

export function calculateOrderTotal(
  items: OrderLine[],
  taxPercent: number,
  fees: OrderFee[],
): OrderTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + nonNegativeInt(item.unit_price) * nonNegativeInt(item.qty),
    0,
  );
  const tax_amount = Math.round((subtotal * Math.max(0, taxPercent || 0)) / 100);
  const fee_amount = fees.reduce((sum, fee) => sum + nonNegativeInt(fee.amount), 0);
  return { subtotal, tax_amount, fee_amount, total: subtotal + tax_amount + fee_amount };
}

export type CheckoutLine = {
  name: string;
  unit_price: number;
  qty: number;
  available?: boolean;
};

export type CheckoutInput = {
  customer_name: string;
  fulfillment: string;
  table_no?: string;
  items: CheckoutLine[];
  total: number;
  min_order?: number;
};

export type CheckoutValidation = { ok: true } | { ok: false; error: string };

export const MAX_CUSTOMER_NAME = 60;
export const MAX_ITEM_NOTE = 140;

export function validateCheckout(input: CheckoutInput): CheckoutValidation {
  const name = (input.customer_name ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Nama wajib diisi." };
  if (name.length > MAX_CUSTOMER_NAME) return { ok: false, error: "Nama terlalu panjang." };
  if (!isFulfillment(input.fulfillment)) {
    return { ok: false, error: "Jenis pesanan tidak valid." };
  }
  const items = input.items ?? [];
  if (items.length === 0) return { ok: false, error: "Keranjang masih kosong." };
  if (items.some((item) => nonNegativeInt(item.qty) <= 0)) {
    return { ok: false, error: "Jumlah item tidak valid." };
  }
  if (items.some((item) => item.available === false)) {
    return { ok: false, error: "Ada menu yang sudah habis. Perbarui keranjangmu." };
  }
  if (input.fulfillment === "dine_in" && !(input.table_no ?? "").trim()) {
    return { ok: false, error: "Nomor meja wajib untuk makan di tempat." };
  }
  if (typeof input.min_order === "number" && input.min_order > 0 && input.total < input.min_order) {
    return { ok: false, error: `Minimum pesanan ${formatRupiah(input.min_order)}.` };
  }
  return { ok: true };
}

const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const ORDER_CODE_LENGTH = 8;

export function generateOrderCode(length: number = ORDER_CODE_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const byte of bytes) {
    out += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return out;
}

export function isItemAvailable(item: Pick<MenuItem, "available">): boolean {
  return item.available !== false;
}

export type WaOrderSummary = {
  code: string;
  customer_name: string;
  fulfillment: Fulfillment;
  table_no?: string | null;
  items: { name: string; qty: number; unit_price: number }[];
  subtotal: number;
  tax_amount: number;
  fee_amount: number;
  total: number;
};

export function buildWaMessage(order: WaOrderSummary, statusUrl: string): string {
  const lines: string[] = [`*Pesanan ${order.code}*`, `Nama: ${order.customer_name}`];
  lines.push(
    order.fulfillment === "dine_in"
      ? `Makan di tempat · Meja ${order.table_no ?? "-"}`
      : "Ambil sendiri (pick-up)",
  );
  lines.push("");
  for (const item of order.items) {
    lines.push(`${item.qty}x ${item.name} — ${formatRupiah(item.unit_price * item.qty)}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${formatRupiah(order.subtotal)}`);
  if (order.tax_amount > 0) lines.push(`Pajak: ${formatRupiah(order.tax_amount)}`);
  if (order.fee_amount > 0) lines.push(`Biaya: ${formatRupiah(order.fee_amount)}`);
  lines.push(`*Total: ${formatRupiah(order.total)}*`);
  lines.push("");
  lines.push(`Pantau status pesananmu: ${statusUrl}`);
  return lines.join("\n");
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  baru: "Baru masuk",
  menunggu_bayar: "Menunggu pembayaran",
  cek_bayar: "Cek pembayaran",
  diproses: "Sedang diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};
