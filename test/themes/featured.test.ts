import { describe, expect, it } from "vitest";
import {
  FEATURED_DEMO_THEME,
  FEATURED_THEME_SLUGS,
  featuredThemes,
  isFeaturedTheme,
  KULINER_THEMES,
  themeConfigFor,
  themeSwatch,
} from "@/themes/kuliner/configs";

describe("kurasi tema unggulan", () => {
  it("tepat 15 tema unggulan sesuai urutan", () => {
    expect(FEATURED_THEME_SLUGS).toEqual([
      "hangat",
      "senja",
      "sambal",
      "kopi",
      "manis",
      "lampion",
      "pasar",
      "karnaval",
      "blueprint",
      "bara",
      "loket",
      "lilin",
      "sawah",
      "kunang",
      "jeruk",
    ]);
    expect(featuredThemes()).toHaveLength(15);
  });

  it("hanya tema unggulan yang bertanda featured", () => {
    const flagged = Object.values(KULINER_THEMES).filter((t) => t.featured === true);
    expect(flagged.map((t) => t.slug).sort()).toEqual([...FEATURED_THEME_SLUGS].sort());
  });

  it("isFeaturedTheme benar untuk unggulan & non-unggulan", () => {
    expect(isFeaturedTheme("lampion")).toBe(true);
    expect(isFeaturedTheme("arang")).toBe(false);
    expect(isFeaturedTheme("tidak-ada")).toBe(false);
  });

  it("demo default adalah tema unggulan", () => {
    expect(isFeaturedTheme(FEATURED_DEMO_THEME)).toBe(true);
  });

  it("swatch memakai warna tema", () => {
    const lampion = themeConfigFor("lampion");
    const swatch = themeSwatch(lampion);
    expect(swatch.textColor).toBe(lampion.colors.text);
    expect(swatch.gradient).toContain(lampion.colors.primary);
  });
});
