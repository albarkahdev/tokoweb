import { describe, expect, it } from "vitest";
import { buildImageKey, isValidImageKey } from "@/domain/image-key";

describe("buildImageKey", () => {
  it("builds key from slug, section, and filename", () => {
    expect(buildImageKey("warung-bu-sari", "menu", "ayam-bakar.webp")).toBe(
      "t/warung-bu-sari/menu/ayam-bakar.webp",
    );
  });

  it("rejects invalid tenant slug", () => {
    expect(() => buildImageKey("Warung Bu Sari", "menu", "a.webp")).toThrow();
    expect(() => buildImageKey("../etc", "menu", "a.webp")).toThrow();
  });

  it("rejects non-webp or unsafe filename", () => {
    expect(() => buildImageKey("warung", "menu", "foto.png")).toThrow();
    expect(() => buildImageKey("warung", "menu", "../../x.webp")).toThrow();
  });
});

describe("isValidImageKey", () => {
  it("accepts keys produced by buildImageKey", () => {
    expect(isValidImageKey("t/warung-bu-sari/gallery/01.webp")).toBe(true);
    expect(isValidImageKey(buildImageKey("warung", "logo", "abc123.webp"))).toBe(true);
  });

  it("rejects malformed keys", () => {
    expect(isValidImageKey("warung/menu/a.webp")).toBe(false);
    expect(isValidImageKey("t/warung/banner/a.webp")).toBe(false);
    expect(isValidImageKey("t/warung/menu/a.png")).toBe(false);
    expect(isValidImageKey("t/warung/menu/deep/a.webp")).toBe(false);
  });
});
