export type InvoiceKind = "setup" | "monthly";

export function invoiceNumber(id: number, period: string): string {
  const compact = period.replace(/-/g, "");
  return `INV-${compact}-${String(id).padStart(4, "0")}`;
}

export function invoiceLineLabel(kind: InvoiceKind, period: string): string {
  if (kind === "setup") return `Biaya setup & pembuatan website (${period})`;
  return `Langganan bulanan · ${period}`;
}
