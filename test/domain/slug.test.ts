import { describe, expect, it } from "vitest";
import { isSlugReserved, slugify, slugStatus, suggestSlug } from "@/domain/slug";

describe("slug", () => {
  it("slugify normalisasi nama usaha", () => {
    expect(slugify("Warung Bu Sari!")).toBe("warung-bu-sari");
    expect(slugify("  Kopi   Kenangan  ")).toBe("kopi-kenangan");
    expect(slugify("Ayam & Bakar 88")).toBe("ayam-bakar-88");
  });

  it("isSlugReserved untuk kata sistem", () => {
    expect(isSlugReserved("app")).toBe(true);
    expect(isSlugReserved("toko")).toBe(true);
    expect(isSlugReserved("warungku")).toBe(false);
  });

  it("slugStatus mendeteksi semua kondisi", () => {
    expect(slugStatus("wa", [])).toBe("too_short");
    expect(slugStatus("a".repeat(40), [])).toBe("too_long");
    expect(slugStatus("-bad-", [])).toBe("invalid");
    expect(slugStatus("admin", [])).toBe("reserved");
    expect(slugStatus("warung", ["warung"])).toBe("taken");
    expect(slugStatus("warung-bu-sari", ["lainnya"])).toBe("ok");
  });

  it("suggestSlug hindari reserved & yang terpakai", () => {
    expect(suggestSlug("Warung Bu Sari", [])).toBe("warung-bu-sari");
    expect(suggestSlug("Warung Bu Sari", ["warung-bu-sari"])).toBe("warung-bu-sari-2");
    expect(suggestSlug("Warung Bu Sari", ["warung-bu-sari", "warung-bu-sari-2"])).toBe(
      "warung-bu-sari-3",
    );
    expect(suggestSlug("Blog", [])).toBe("blog-2");
  });
});
