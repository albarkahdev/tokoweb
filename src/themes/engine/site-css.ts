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
  --hero-overlay: ${theme.colors.heroOverlay};
  --hero-bg: ${theme.colors.heroBg};
  --r-card: ${theme.radius.card};
  --r-btn: ${theme.radius.button};
  --f-heading: ${theme.fonts.heading};
  --f-body: ${theme.fonts.body};
  --w-heading: ${theme.fonts.headingWeight};
  --shadow-card: 0 2px 8px rgb(0 0 0 / 0.04), 0 12px 32px -12px rgb(0 0 0 / 0.12);
  --shadow-pop: 0 18px 44px -14px rgb(0 0 0 / 0.3);
}
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--f-body);
  background: var(--bg);
  color: var(--text);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--f-heading); font-weight: var(--w-heading); line-height: 1.12; letter-spacing: -0.01em; }
img { max-width: 100%; display: block; }
a { color: inherit; }
section { padding: clamp(3.2rem, 8vw, 5.5rem) 1.4rem; max-width: 66rem; margin: 0 auto; }
.kicker {
  display: inline-block; color: var(--primary); font-weight: 800; font-size: 0.78rem;
  letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.5rem;
}
section > h2, .sec-title { font-size: clamp(1.7rem, 5vw, 2.5rem); margin-bottom: 1.6rem; }

.btn-wa {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--primary); color: var(--primary-contrast);
  padding: 0.9rem 1.9rem; border-radius: var(--r-btn);
  font-weight: 700; text-decoration: none;
  box-shadow: 0 10px 26px -10px color-mix(in srgb, var(--primary) 70%, transparent);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-wa:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -12px color-mix(in srgb, var(--primary) 75%, transparent); }
.btn-wa:active { transform: translateY(0); }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.5rem;
  border: 1.5px solid color-mix(in srgb, var(--primary) 55%, transparent);
  color: inherit; padding: 0.85rem 1.7rem; border-radius: var(--r-btn);
  font-weight: 600; text-decoration: none; transition: border-color 0.15s ease, transform 0.15s ease;
}
.btn-ghost:hover { border-color: var(--primary); transform: translateY(-2px); }
.btn-wa:focus-visible, .btn-ghost:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

.hero { position: relative; padding: 0; max-width: none; display: flex; align-items: flex-end; }
.hero .hero-inner {
  position: relative; z-index: 2; width: 100%; max-width: 66rem;
  margin: 0 auto; padding: clamp(4.5rem, 14vw, 8rem) 1.4rem clamp(3rem, 9vw, 5rem);
}
.hero h1 { font-size: clamp(2.5rem, 10vw, 5rem); margin: 0.4rem 0 0.6rem; }
.hero .tagline { font-size: clamp(1.02rem, 3.2vw, 1.3rem); margin-bottom: 1.8rem; opacity: 0.92; max-width: 30rem; }
.hero .hero-cta { display: flex; gap: 0.8rem; flex-wrap: wrap; }

.hero.photo { min-height: 82vh; }
.hero.photo .hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero.photo .scrim { position: absolute; inset: 0; background: var(--hero-overlay); }
.hero.photo .hero-inner { color: #FFFFFF; }
.hero.photo .btn-ghost { border-color: rgb(255 255 255 / 0.5); color: #fff; }

.hero.typo { background: var(--hero-bg); }
.hero.typo .hero-inner { padding-top: clamp(5rem, 15vw, 8.5rem); }
.hero.typo .hero-thumb {
  width: clamp(9rem, 26vw, 13rem); border-radius: var(--r-card);
  box-shadow: var(--shadow-pop); rotate: 2.5deg;
  position: absolute; right: 1.4rem; bottom: -2.2rem; z-index: 3;
  border: 4px solid var(--surface);
}
.hero.typo .hero-thumb img { border-radius: calc(var(--r-card) - 4px); aspect-ratio: 4/3; object-fit: cover; }

.hero.color-block { background: var(--hero-bg); }
.hero.color-block .hero-inner { color: var(--primary-contrast); }
.hero.color-block .btn-wa { background: var(--surface); color: var(--text); }
.hero.color-block .btn-ghost { border-color: color-mix(in srgb, var(--primary-contrast) 55%, transparent); }

.open-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.32rem 1rem; border-radius: 9999px; font-size: 0.82rem; font-weight: 700;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  color: var(--text); backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.12);
}
.open-badge.open { color: #1B7C36; }
.open-badge.closed { color: #B3261E; }

.menu-grid { display: grid; gap: 1.15rem; }
.menu-cards .menu-grid, .menu-grid-2 .menu-grid { grid-template-columns: repeat(auto-fill, minmax(15.5rem, 1fr)); }
.menu-list .menu-grid { grid-template-columns: 1fr; gap: 0; max-width: 44rem; }

.menu-item {
  background: var(--surface); border-radius: var(--r-card);
  overflow: hidden; box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex; flex-direction: column;
}
.menu-item:hover { transform: translateY(-4px); box-shadow: var(--shadow-pop); }
.menu-item .mi-photo { width: 100%; height: 11.5rem; object-fit: cover; }
.menu-item .mi-body { padding: 1.1rem 1.2rem 1.2rem; display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
.menu-item.no-photo .mi-body { border-top: 4px solid var(--accent); }
.menu-item h3 { font-size: 1.12rem; }
.menu-item .price { color: var(--primary); font-weight: 800; font-size: 1.05rem; }
.menu-item .desc { color: var(--muted); font-size: 0.9rem; }
.menu-item .ask {
  margin-top: auto; padding-top: 0.6rem; font-size: 0.87rem; font-weight: 700;
  color: var(--primary); text-decoration: none;
}
.menu-item .ask:hover { text-decoration: underline; }

.menu-list .menu-item {
  background: none; box-shadow: none; border-radius: 0; flex-direction: row;
  gap: 1.1rem; padding: 1.15rem 0; align-items: flex-start;
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 28%, transparent);
}
.menu-list .menu-item:hover { transform: none; box-shadow: none; }
.menu-list .menu-item .mi-photo { width: 4.6rem; height: 4.6rem; border-radius: var(--r-card); flex-shrink: 0; }
.menu-list .menu-item .mi-body { padding: 0; }
.menu-list .menu-item.no-photo .mi-body { border-top: none; }
.menu-list .mi-head { display: flex; align-items: baseline; gap: 0.7rem; }
.menu-list .mi-head h3 { flex-shrink: 0; }
.menu-list .mi-head .leader { flex: 1; border-bottom: 2px dotted color-mix(in srgb, var(--muted) 45%, transparent); transform: translateY(-0.3rem); }
.menu-list .price { font-size: 1rem; }

.menu-grid-2 .menu-item:nth-child(3n+2) .mi-body { background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }

.badge-fav {
  display: inline-block; background: var(--accent);
  color: color-mix(in srgb, var(--text) 88%, #000);
  font-size: 0.7rem; font-weight: 800; padding: 0.14rem 0.62rem;
  border-radius: 9999px; vertical-align: middle; letter-spacing: 0.02em;
}

.more-menu { margin-top: 1.8rem; }

.hours-card {
  background: var(--surface); border-radius: var(--r-card); box-shadow: var(--shadow-card);
  padding: 1.5rem 1.6rem; max-width: 27rem;
}
.hours-table { width: 100%; border-collapse: collapse; }
.hours-table td { padding: 0.42rem 0; border-bottom: 1px solid color-mix(in srgb, var(--muted) 18%, transparent); font-size: 0.95rem; }
.hours-table tr:last-child td { border-bottom: none; }
.hours-table td:last-child { text-align: right; font-weight: 600; }
.hours-table .closed-day { color: var(--muted); }

.promo-card {
  position: relative; background: var(--surface);
  border-radius: var(--r-card); padding: 1.4rem 1.6rem 1.4rem 1.9rem;
  margin-bottom: 1rem; box-shadow: var(--shadow-card); overflow: hidden;
  cursor: pointer; transition: transform 0.2s ease;
}
.promo-card:hover { transform: translateY(-3px); }
.promo-card::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 7px;
  background: repeating-linear-gradient(180deg, var(--accent) 0 12px, transparent 12px 20px);
}
.promo-card h3 { font-size: 1.2rem; margin-bottom: 0.2rem; }
.promo-card .desc { color: var(--muted); font-size: 0.93rem; }
.promo-card .until {
  display: inline-block; margin-top: 0.6rem; font-size: 0.78rem; font-weight: 700;
  background: color-mix(in srgb, var(--accent) 25%, var(--surface));
  padding: 0.2rem 0.75rem; border-radius: 9999px;
}

.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: 0.7rem; }
.gallery-grid .ph { overflow: hidden; border-radius: var(--r-card); }
.gallery-grid img { aspect-ratio: 1; object-fit: cover; width: 100%; transition: transform 0.35s ease; }
.gallery-grid .ph:hover img { transform: scale(1.06); }

.testi {
  position: relative; background: var(--surface); border-radius: var(--r-card);
  padding: 1.9rem 1.6rem 1.4rem; margin-bottom: 1rem; box-shadow: var(--shadow-card);
  max-width: 38rem;
}
.testi .qmark {
  position: absolute; top: -0.4rem; left: 1.1rem;
  font-family: var(--f-heading); font-size: 4rem; line-height: 1;
  color: color-mix(in srgb, var(--accent) 65%, transparent);
}
.testi .body { position: relative; }
.testi .who { color: var(--muted); font-size: 0.86rem; margin-top: 0.7rem; font-weight: 600; }

.contact-card {
  background: var(--surface); border-radius: var(--r-card); box-shadow: var(--shadow-card);
  padding: 1.8rem 1.7rem; max-width: 34rem;
}
.contact-card .addr { margin-bottom: 1.2rem; }
.contact-card .row-cta { display: flex; gap: 0.7rem; flex-wrap: wrap; }

footer.site {
  text-align: center; padding: 2.2rem 1.4rem 6.5rem; color: var(--muted); font-size: 0.85rem;
  border-top: 1px solid color-mix(in srgb, var(--muted) 16%, transparent); margin-top: 2rem;
}
footer.site a { color: var(--muted); }

.wa-float {
  position: fixed; bottom: max(1rem, env(safe-area-inset-bottom)); left: 1rem; right: 1rem;
  z-index: 50; display: flex; justify-content: center; pointer-events: none;
}
.wa-float .btn-wa { pointer-events: auto; width: 100%; max-width: 28rem; justify-content: center; box-shadow: 0 14px 34px -8px rgb(0 0 0 / 0.4); }

.catnav {
  position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(10px); padding: 0.8rem 1.4rem; display: flex; gap: 0.55rem;
  overflow-x: auto; z-index: 20;
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 18%, transparent);
}
.catnav a {
  white-space: nowrap; text-decoration: none; font-weight: 700; font-size: 0.87rem;
  color: var(--muted); padding: 0.35rem 1rem; border-radius: 9999px;
  border: 1.5px solid color-mix(in srgb, var(--muted) 30%, transparent);
}
.catnav a:hover { color: var(--primary); border-color: var(--primary); }

.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.55s ease, transform 0.55s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .menu-item, .promo-card, .gallery-grid img, .btn-wa, .btn-ghost { transition: none; }
}
`;
}
