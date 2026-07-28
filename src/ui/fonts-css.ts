export const FONT_FILES = [
  "Fraunces.woff2",
  "Fraunces-Italic.woff2",
  "Marcellus.woff2",
  "BricolageGrotesque.woff2",
  "PlusJakartaSans.woff2",
  "Inter.woff2",
] as const;

const FACE = (family: string, file: string, extra = "") => `
@font-face {
  font-family: '${family}';
  src: url('/assets/fonts/${file}') format('woff2');
  font-weight: 100 900;
  font-display: swap;${extra}
}`;

export const FONTS_CSS = [
  FACE("Fraunces", "Fraunces.woff2"),
  FACE("Fraunces", "Fraunces-Italic.woff2", "\n  font-style: italic;"),
  FACE("Marcellus", "Marcellus.woff2"),
  FACE("Bricolage Grotesque", "BricolageGrotesque.woff2"),
  FACE("Plus Jakarta Sans", "PlusJakartaSans.woff2"),
  FACE("Inter", "Inter.woff2"),
].join("\n");
