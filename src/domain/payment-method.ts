export const PAYMENT_TYPES = ["qris", "transfer", "ewallet"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export function isPaymentType(value: string): value is PaymentType {
  return (PAYMENT_TYPES as readonly string[]).includes(value);
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  qris: "QRIS",
  transfer: "Transfer Bank",
  ewallet: "E-Wallet",
};

export function parsePaymentDetail(json: string): Record<string, string> {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

export type PaymentLine = { label: string; value: string; copy?: boolean };

export function paymentMethodLines(
  type: PaymentType,
  detail: Record<string, string>,
): PaymentLine[] {
  if (type === "transfer") {
    const lines: PaymentLine[] = [];
    if (detail.bank) lines.push({ label: "Bank", value: detail.bank });
    if (detail.account_no)
      lines.push({ label: "No. Rekening", value: detail.account_no, copy: true });
    if (detail.account_name) lines.push({ label: "Atas Nama", value: detail.account_name });
    return lines;
  }
  if (type === "ewallet") {
    const lines: PaymentLine[] = [];
    if (detail.provider) lines.push({ label: "Aplikasi", value: detail.provider });
    if (detail.phone) lines.push({ label: "Nomor", value: detail.phone, copy: true });
    return lines;
  }
  return [];
}

export function buildPaymentDetail(
  type: PaymentType,
  values: Record<string, string>,
): Record<string, string> {
  if (type === "transfer") {
    return {
      bank: (values.bank ?? "").trim(),
      account_no: (values.account_no ?? "").trim(),
      account_name: (values.account_name ?? "").trim(),
    };
  }
  if (type === "ewallet") {
    return {
      provider: (values.provider ?? "").trim(),
      phone: (values.phone ?? "").trim(),
    };
  }
  return {};
}
