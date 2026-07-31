import { describe, expect, it } from "vitest";
import { invoiceLineLabel, invoiceNumber } from "@/domain/invoice";

describe("invoice", () => {
  it("invoiceNumber padat & padded", () => {
    expect(invoiceNumber(7, "2026-08")).toBe("INV-202608-0007");
    expect(invoiceNumber(1234, "2026-08")).toBe("INV-202608-1234");
  });

  it("invoiceLineLabel per kind", () => {
    expect(invoiceLineLabel("setup", "2026-08")).toContain("setup");
    expect(invoiceLineLabel("monthly", "2026-08")).toBe("Langganan bulanan · 2026-08");
  });
});
