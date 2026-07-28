import type { ThemeConfig } from "@/themes/engine/types";

const SERIF_WARM = "'Fraunces', 'Iowan Old Style', Georgia, 'Times New Roman', serif";
const SERIF_ELEGANT = "'Marcellus', 'Palatino Linotype', Palatino, Georgia, serif";
const SANS_CHARACTER = "'Bricolage Grotesque', 'Avenir Next', 'Segoe UI', system-ui, sans-serif";
const SANS_BODY = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const KULINER_THEMES: Record<string, ThemeConfig> = {
  hangat: {
    slug: "hangat",
    name: "Hangat",
    colors: {
      bg: "#FFFBF5",
      surface: "#FFFFFF",
      text: "#2D2A26",
      muted: "#6B655E",
      primary: "#C4501B",
      primaryContrast: "#FFFFFF",
      accent: "#E8A03C",
      heroOverlay: "rgba(45, 25, 10, 0.55)",
    },
    fonts: { heading: SERIF_WARM, body: SANS_BODY, headingWeight: 600 },
    radius: { card: "1rem", button: "9999px" },
    layout: { hero: "image-full", menu: "cards" },
  },
  arang: {
    slug: "arang",
    name: "Arang",
    colors: {
      bg: "#1A1815",
      surface: "#242019",
      text: "#EDE6DA",
      muted: "#A89F93",
      primary: "#C9A227",
      primaryContrast: "#1A1815",
      accent: "#8A9B7C",
      heroOverlay: "rgba(10, 8, 5, 0.65)",
    },
    fonts: { heading: SERIF_ELEGANT, body: SANS_BODY, headingWeight: 400 },
    radius: { card: "0.4rem", button: "0.4rem" },
    layout: { hero: "image-split", menu: "list" },
  },
  ceria: {
    slug: "ceria",
    name: "Ceria",
    colors: {
      bg: "#FFFDF7",
      surface: "#FFFFFF",
      text: "#27221C",
      muted: "#7A7168",
      primary: "#FF6B57",
      primaryContrast: "#FFFFFF",
      accent: "#4ECDC4",
      heroOverlay: "rgba(255, 107, 87, 0.12)",
    },
    fonts: { heading: SANS_CHARACTER, body: SANS_BODY, headingWeight: 700 },
    radius: { card: "1.25rem", button: "9999px" },
    layout: { hero: "color-block", menu: "grid-2" },
  },
};

export const DEFAULT_THEME = "hangat";

export function themeConfigFor(slug: string): ThemeConfig {
  return KULINER_THEMES[slug] ?? (KULINER_THEMES[DEFAULT_THEME] as ThemeConfig);
}
