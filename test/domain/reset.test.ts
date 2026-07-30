import { describe, expect, it } from "vitest";
import {
  buildResetWaMessage,
  isValidWaNumber,
  normalizeWaNumber,
  resetWaLink,
} from "@/domain/reset";

describe("reset via WA", () => {
  it("normalizeWaNumber ke format 62", () => {
    expect(normalizeWaNumber("081234567890")).toBe("6281234567890");
    expect(normalizeWaNumber("81234567890")).toBe("6281234567890");
    expect(normalizeWaNumber("+62 812-3456-7890")).toBe("6281234567890");
    expect(normalizeWaNumber("6281234567890")).toBe("6281234567890");
  });

  it("isValidWaNumber", () => {
    expect(isValidWaNumber("081234567890")).toBe(true);
    expect(isValidWaNumber("0812")).toBe(false);
    expect(isValidWaNumber("halo")).toBe(false);
  });

  it("buildResetWaMessage tanda [RESET PASSWORD]", () => {
    expect(buildResetWaMessage("6281234567890")).toContain("[RESET PASSWORD]");
    expect(buildResetWaMessage("6281234567890")).toContain("6281234567890");
  });

  it("resetWaLink ke nomor kontak founder", () => {
    const link = resetWaLink("6289999", "6281234567890");
    expect(link.startsWith("https://wa.me/6289999?text=")).toBe(true);
    expect(decodeURIComponent(link)).toContain("[RESET PASSWORD]");
  });
});
