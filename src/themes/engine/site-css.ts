import type { ThemeConfig } from "@/themes/engine/types";
import { FONTS_CSS } from "@/ui/fonts-css";

export function siteCss(theme: ThemeConfig): string {
  return `
${FONTS_CSS}
:root {
  --bg: ${theme.colors.bg};
  --surface: ${theme.colors.surface};
  --text: ${theme.colors.text};
  --muted: ${theme.colors.muted};
  --primary: ${theme.colors.primary};
  --primary-contrast: ${theme.colors.primaryContrast};
  --accent: ${theme.colors.accent};
  --overlay: ${theme.colors.heroOverlay};
  --r-card: ${theme.radius.card};
  --r-btn: ${theme.radius.button};
  --f-heading: ${theme.fonts.heading};
  --f-body: ${theme.fonts.body};
  --w-heading: ${theme.fonts.headingWeight};
}
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--f-body);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { font-family: var(--f-heading); font-weight: var(--w-heading); line-height: 1.15; }
img { max-width: 100%; display: block; }
a { color: inherit; }
section { padding: clamp(3rem, 8vw, 5.5rem) 1.25rem; max-width: 64rem; margin: 0 auto; }
section > h2 { font-size: clamp(1.6rem, 5vw, 2.4rem); margin-bottom: 1.5rem; }
.btn-wa {
  display: inline-block;
  background: var(--primary);
  color: var(--primary-contrast);
  padding: 0.85rem 1.75rem;
  border-radius: var(--r-btn);
  font-weight: 700;
  text-decoration: none;
}
.btn-ghost {
  display: inline-block;
  border: 1.5px solid var(--primary);
  color: inherit;
  padding: 0.8rem 1.6rem;
  border-radius: var(--r-btn);
  font-weight: 600;
  text-decoration: none;
}
.hero { position: relative; min-height: 78vh; display: flex; align-items: flex-end; padding: 0; max-width: none; }
.hero .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero::after { content: ""; position: absolute; inset: 0; background: var(--overlay); }
.hero .hero-inner { position: relative; z-index: 1; padding: 2rem 1.25rem 4.5rem; max-width: 64rem; margin: 0 auto; width: 100%; }
.hero.image-full .hero-inner, .hero.image-split .hero-inner { color: #FFFFFF; }
.hero h1 { font-size: clamp(2.2rem, 9vw, 4.5rem); margin-bottom: 0.5rem; }
.hero .tagline { font-size: clamp(1rem, 3.5vw, 1.35rem); margin-bottom: 1.5rem; opacity: 0.92; }
.hero.color-block { background: var(--primary); min-height: 60vh; align-items: center; }
.hero.color-block::after { display: none; }
.hero.color-block .hero-inner { color: var(--primary-contrast); }
.hero.color-block .hero-bg { display: none; }
.hero.image-split { min-height: 65vh; }
.open-badge { display: inline-block; padding: 0.25rem 0.9rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 700; background: var(--surface); color: var(--text); margin-bottom: 1rem; }
.open-badge.open { color: #1B7C36; }
.open-badge.closed { color: #B3261E; }
.menu-grid { display: grid; gap: 1.25rem; }
.menu-cards .menu-grid { grid-template-columns: 1fr; }
.menu-grid-2 .menu-grid, .menu-cards .menu-grid { grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); }
.menu-item {
  background: var(--surface);
  border-radius: var(--r-card);
  overflow: hidden;
  box-shadow: 0 2px 16px rgb(0 0 0 / 0.06);
}
.menu-list .menu-item { box-shadow: none; background: none; border-bottom: 1px solid color-mix(in srgb, var(--primary) 35%, transparent); border-radius: 0; padding-bottom: 1rem; }
.menu-item img { width: 100%; height: 12rem; object-fit: cover; }
.menu-item .mi-body { padding: 1rem; }
.menu-list .menu-item .mi-body { padding: 0; }
.menu-item h3 { font-size: 1.1rem; margin-bottom: 0.2rem; }
.menu-item .price { color: var(--primary); font-weight: 700; margin-bottom: 0.35rem; }
.menu-item .desc { color: var(--muted); font-size: 0.9rem; margin-bottom: 0.6rem; }
.menu-item .ask { font-size: 0.85rem; font-weight: 600; color: var(--primary); text-decoration: none; }
.badge-fav { background: var(--accent); color: var(--text); font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.6rem; border-radius: 9999px; vertical-align: middle; }
.hours-table { width: 100%; border-collapse: collapse; max-width: 26rem; }
.hours-table td { padding: 0.35rem 0; border-bottom: 1px solid color-mix(in srgb, var(--muted) 25%, transparent); }
.hours-table td:last-child { text-align: right; }
.promo-card { background: var(--surface); border-left: 4px solid var(--accent); border-radius: var(--r-card); padding: 1.25rem; margin-bottom: 1rem; box-shadow: 0 2px 16px rgb(0 0 0 / 0.06); display: block; text-decoration: none; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: 0.6rem; }
.gallery-grid img { border-radius: var(--r-card); aspect-ratio: 1; object-fit: cover; }
.testi { background: var(--surface); border-radius: var(--r-card); padding: 1.25rem; margin-bottom: 1rem; box-shadow: 0 2px 16px rgb(0 0 0 / 0.06); }
.testi .who { color: var(--muted); font-size: 0.85rem; margin-top: 0.5rem; }
.contact p { margin-bottom: 0.75rem; }
.contact .row-cta { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.25rem; }
footer.site { text-align: center; padding: 2rem 1rem 6rem; color: var(--muted); font-size: 0.85rem; }
footer.site a { color: var(--muted); }
.wa-float {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 50;
  display: flex;
  justify-content: center;
}
.wa-float a { width: 100%; max-width: 30rem; text-align: center; box-shadow: 0 6px 24px rgb(0 0 0 / 0.25); }
.catnav { position: sticky; top: 0; background: var(--bg); padding: 0.75rem 1.25rem; display: flex; gap: 0.75rem; overflow-x: auto; z-index: 20; border-bottom: 1px solid color-mix(in srgb, var(--muted) 20%, transparent); }
.catnav a { white-space: nowrap; text-decoration: none; font-weight: 600; font-size: 0.9rem; color: var(--muted); }
.reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.5s ease, transform 0.5s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
}
`;
}
