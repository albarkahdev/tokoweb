import { describe, expect, it } from "vitest";
import { buildOrdersCsv, type OrderCsvRow, ordersCsvFilename } from "@/domain/order-csv";

function row(over: Partial<OrderCsvRow> = {}): OrderCsvRow {
  return {
    code: "ABC123",
    created_at: "2026-08-10 05:00:00",
    customer_name: "Budi",
    customer_phone: "628123",
    fulfillment: "dine_in",
    table_no: "5",
    status: "selesai",
    cash: 1,
    subtotal: 36000,
    fee_amount: 2000,
    tax_amount: 0,
    total: 38000,
    note: null,
    items: "Bakmi x2",
    ...over,
  };
}

describe("buildOrdersCsv", () => {
  it("emits header and a friendly row", () => {
    const csv = buildOrdersCsv([row()]);
    const [header, first] = csv.split("\r\n");
    expect(header).toBe(
      "Kode,Tanggal,Nama,HP,Jenis,Meja,Status,Bayar,Subtotal,Biaya,Pajak,Total,Catatan,Item",
    );
    expect(first).toContain("ABC123");
    expect(first).toContain("Makan di tempat");
    expect(first).toContain("Tunai");
    expect(first).toContain("Selesai");
    expect(first).toContain("Bakmi x2");
  });

  it("neutralizes CSV formula-injection in text cells", () => {
    const csv = buildOrdersCsv([row({ customer_name: "=cmd|'/c calc'!A1", note: "@SUM(1)" })]);
    expect(csv).toContain("'=cmd|");
    expect(csv).toContain("'@SUM(1)");
  });

  it("marks non-cash orders as Online", () => {
    expect(buildOrdersCsv([row({ cash: 0 })]).split("\r\n")[1]).toContain("Online");
  });

  it("escapes commas, quotes, and newlines", () => {
    const csv = buildOrdersCsv([row({ note: 'pedas, "banget"\nya', items: "A x1" })]);
    expect(csv).toContain('"pedas, ""banget""\nya"');
  });

  it("handles empty rows with only a header", () => {
    expect(buildOrdersCsv([])).toBe(
      "Kode,Tanggal,Nama,HP,Jenis,Meja,Status,Bayar,Subtotal,Biaya,Pajak,Total,Catatan,Item",
    );
  });

  it("builds a dated filename", () => {
    expect(ordersCsvFilename("warung", "2026-08-10")).toBe("pesanan-warung-2026-08-10.csv");
  });
});
