import { ORDER_STATUS_LABELS, type OrderStatus } from "@/domain/order";

export type OrderCsvRow = {
  code: string;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  fulfillment: string;
  table_no: string | null;
  status: string;
  cash: number;
  subtotal: number;
  fee_amount: number;
  tax_amount: number;
  total: number;
  note: string | null;
  items: string | null;
};

const HEADERS = [
  "Kode",
  "Tanggal",
  "Nama",
  "HP",
  "Jenis",
  "Meja",
  "Status",
  "Bayar",
  "Subtotal",
  "Biaya",
  "Pajak",
  "Total",
  "Catatan",
  "Item",
];

const FULFILLMENT_LABEL: Record<string, string> = {
  dine_in: "Makan di tempat",
  pickup: "Ambil sendiri",
};

function csvCell(value: string | number | null): string {
  if (typeof value === "number") return String(value);
  let text = value ?? "";
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowCells(row: OrderCsvRow): (string | number)[] {
  return [
    row.code,
    row.created_at,
    row.customer_name,
    row.customer_phone ?? "",
    FULFILLMENT_LABEL[row.fulfillment] ?? row.fulfillment,
    row.table_no ?? "",
    ORDER_STATUS_LABELS[row.status as OrderStatus] ?? row.status,
    row.cash === 1 ? "Tunai" : "Online",
    row.subtotal,
    row.fee_amount,
    row.tax_amount,
    row.total,
    row.note ?? "",
    row.items ?? "",
  ];
}

export function buildOrdersCsv(rows: OrderCsvRow[]): string {
  const lines = [HEADERS, ...rows.map(rowCells)].map((cells) => cells.map(csvCell).join(","));
  return lines.join("\r\n");
}

export function ordersCsvFilename(slug: string, today: string): string {
  return `pesanan-${slug}-${today}.csv`;
}
