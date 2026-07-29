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

.promo-ticker {
  position: sticky; top: 0; z-index: 60; display: block; overflow: hidden;
  background: var(--text); color: var(--bg); text-decoration: none;
  font-weight: 700; font-size: 0.85rem; padding: 0.5rem 0;
  border-bottom: 2px solid var(--accent);
}
.promo-ticker .tk { display: flex; width: max-content; animation: tk-run var(--tk-dur, 20s) linear infinite; }
.promo-ticker .tk > span { padding-right: 3rem; white-space: nowrap; }
.promo-ticker:hover .tk { animation-play-state: paused; }
@keyframes tk-run { to { transform: translateX(-50%); } }

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
  display: none; width: clamp(9rem, 18vw, 13rem); border-radius: var(--r-card);
  box-shadow: var(--shadow-pop); rotate: 2.5deg;
  position: absolute; right: clamp(1.4rem, 6vw, 5rem); bottom: -2.2rem; z-index: 3;
  border: 4px solid var(--surface);
}
@media (min-width: 48rem) {
  .hero.typo .hero-thumb { display: block; }
  .hero.typo .hero-inner { padding-right: clamp(14rem, 24vw, 18rem); }
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
.gallery-grid img { aspect-ratio: 1; object-fit: cover; width: 100%; transition: transform 0.35s ease; cursor: zoom-in; }
.gallery-grid .ph:hover img { transform: scale(1.06); }

.lightbox {
  position: fixed; inset: 0; z-index: 100; display: none;
  align-items: center; justify-content: center;
  background: rgb(0 0 0 / 0.88); padding: 1.2rem; cursor: zoom-out;
}
.lightbox.show { display: flex; }
.lightbox img {
  max-width: 94vw; max-height: 86vh; width: auto; height: auto;
  border-radius: 0.6rem; box-shadow: 0 30px 80px rgb(0 0 0 / 0.6);
}
.lightbox .lb-close {
  position: absolute; top: 0.8rem; right: 1rem;
  background: none; border: none; color: #FFF; font-size: 2.4rem;
  line-height: 1; cursor: pointer; padding: 0.4rem;
}

.testi-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); }
.testi {
  position: relative; background: var(--surface); border-radius: var(--r-card);
  padding: 1.9rem 1.6rem 1.4rem; box-shadow: var(--shadow-card);
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
  padding: clamp(1.4rem, 4vw, 2.2rem); display: grid; gap: 1.8rem;
}
@media (min-width: 46rem) { .contact-card { grid-template-columns: 1.25fr 1fr; align-items: start; } }
.contact-card .c-info { display: grid; gap: 1.05rem; }
.contact-card .c-row { display: flex; gap: 0.8rem; align-items: flex-start; }
.contact-card .c-ico {
  flex-shrink: 0; width: 2.4rem; height: 2.4rem; display: inline-flex;
  align-items: center; justify-content: center; font-size: 1.1rem;
  background: color-mix(in srgb, var(--accent) 22%, var(--surface));
  border-radius: calc(var(--r-card) * 0.6);
}
.contact-card .c-body { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.contact-card .c-label {
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--muted);
}
.contact-card .c-value { font-weight: 600; overflow-wrap: anywhere; }
.contact-card .c-value a { color: inherit; text-decoration-color: color-mix(in srgb, var(--primary) 55%, transparent); }
.contact-card .c-cta {
  display: flex; flex-direction: column; gap: 0.7rem;
  background: color-mix(in srgb, var(--primary) 7%, var(--surface));
  border-radius: calc(var(--r-card) * 0.75); padding: 1.3rem;
}
.contact-card .c-cta .btn-wa, .contact-card .c-cta .btn-ghost { justify-content: center; }
.contact-card .c-pitch { font-size: 0.9rem; color: var(--muted); }

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
${LAYOUT_EXTRAS_CSS}
${flairCss(theme.flair)}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .menu-item, .promo-card, .gallery-grid img, .btn-wa, .btn-ghost { transition: none; }
  .promo-ticker .tk { animation: none; flex-wrap: wrap; width: auto; }
  .promo-ticker .tk > span[aria-hidden] { display: none; }
  .poster-echo { animation: none; }
}
`;
}

const LAYOUT_EXTRAS_CSS = `
.hero.split { background: var(--hero-bg); align-items: stretch; }
.hero.split .hero-inner {
  display: flex; flex-direction: column; justify-content: center;
  padding-top: clamp(4rem, 10vw, 7rem);
}
.hero.split .hero-side { display: none; }
@media (min-width: 52rem) {
  .hero.split { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); min-height: 78vh; }
  .hero.split .hero-inner { max-width: none; margin: 0; padding-left: max(1.4rem, calc((100vw - 66rem) / 2 + 1.4rem)); padding-right: 2rem; }
  .hero.split .hero-side { display: block; position: relative; overflow: hidden; }
  .hero.split .hero-side img { width: 100%; height: 100%; object-fit: cover; }
  .hero.split .hero-side.pattern {
    background:
      radial-gradient(circle at 25% 25%, color-mix(in srgb, var(--accent) 45%, transparent) 0 0.55rem, transparent 0.55rem),
      radial-gradient(circle at 75% 75%, color-mix(in srgb, var(--primary) 35%, transparent) 0 0.55rem, transparent 0.55rem);
    background-size: 3.4rem 3.4rem;
  }
}

.hero.poster { background: var(--hero-bg); overflow: hidden; }
.hero.poster .hero-inner { color: var(--primary-contrast); text-align: center; padding-top: clamp(5.5rem, 16vw, 9rem); }
.hero.poster h1 {
  font-size: clamp(3rem, 14vw, 7rem); text-transform: uppercase; letter-spacing: -0.02em;
  line-height: 0.98;
}
.hero.poster .tagline { margin-left: auto; margin-right: auto; }
.hero.poster .hero-cta { justify-content: center; }
.hero.poster .btn-wa { background: var(--surface); color: var(--text); }
.hero.poster .btn-ghost { border-color: color-mix(in srgb, var(--primary-contrast) 55%, transparent); }
.poster-echo {
  position: absolute; top: 0.4rem; left: 0; z-index: 1; white-space: nowrap;
  font-family: var(--f-heading); font-weight: var(--w-heading); text-transform: uppercase;
  font-size: clamp(1rem, 3vw, 1.5rem); letter-spacing: 0.2em; opacity: 0.35;
  color: var(--primary-contrast); animation: echo-run 26s linear infinite;
}
@keyframes echo-run { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }

.hero.frame { background: var(--hero-bg); }
.hero.frame .hero-inner {
  text-align: center; max-width: 46rem;
  padding-top: clamp(6rem, 16vw, 9.5rem); padding-bottom: clamp(4.5rem, 12vw, 7rem);
}
.hero.frame h1 { font-size: clamp(2.4rem, 8vw, 4.2rem); letter-spacing: 0.04em; }
.hero.frame .tagline { margin-left: auto; margin-right: auto; letter-spacing: 0.06em; }
.hero.frame .hero-cta { justify-content: center; }

.menu-magazine .menu-grid { grid-template-columns: 1fr; gap: 0; max-width: 48rem; counter-reset: mag; }
.menu-magazine .menu-item {
  background: none; box-shadow: none; border-radius: 0; flex-direction: row; gap: 1.3rem;
  padding: 1.6rem 0; align-items: flex-start; counter-increment: mag;
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 30%, transparent);
}
.menu-magazine .menu-item:hover { transform: none; box-shadow: none; }
.menu-magazine .menu-item::before {
  content: counter(mag, decimal-leading-zero);
  font-family: var(--f-heading); font-weight: var(--w-heading);
  font-size: clamp(1.6rem, 4vw, 2.3rem); line-height: 1;
  color: color-mix(in srgb, var(--primary) 55%, transparent); flex-shrink: 0; min-width: 3rem;
}
.menu-magazine .menu-item .mi-photo { width: 6rem; height: 6rem; border-radius: var(--r-card); flex-shrink: 0; order: 3; }
.menu-magazine .menu-item .mi-body { padding: 0; flex: 1; }
.menu-magazine .menu-item.no-photo .mi-body { border-top: none; }
.menu-magazine .menu-item h3 { font-size: clamp(1.15rem, 3vw, 1.45rem); }
.menu-magazine .price { font-size: 1.1rem; }

.menu-polaroid .menu-grid { grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1.6rem; }
.menu-polaroid .menu-item { padding: 0.85rem 0.85rem 1.1rem; background: var(--surface); }
.menu-polaroid .menu-item:nth-child(odd) { rotate: -1.6deg; }
.menu-polaroid .menu-item:nth-child(even) { rotate: 1.4deg; }
.menu-polaroid .menu-item:hover { rotate: 0deg; }
.menu-polaroid .menu-item .mi-photo { border-radius: calc(var(--r-card) * 0.5); height: 10rem; }
.menu-polaroid .menu-item .mi-body { padding: 0.9rem 0.3rem 0; }
.menu-polaroid .menu-item.no-photo .mi-body {
  border-top: none; border-radius: calc(var(--r-card) * 0.5);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  padding: 1rem 0.8rem 0.9rem; margin-top: 0;
}
`;

function flairCss(flair?: string): string {
  if (flair === "batik") {
    return `
body {
  background-image:
    radial-gradient(circle at 0 0, color-mix(in srgb, var(--primary) 7%, transparent) 0 26%, transparent 27%),
    radial-gradient(circle at 3rem 3rem, color-mix(in srgb, var(--accent) 8%, transparent) 0 26%, transparent 27%);
  background-size: 6rem 6rem;
}
section { background: var(--bg); }
.hero.typo .hero-inner, section > .kicker, .sec-title { position: relative; }
.sec-title::after {
  content: ""; display: block; width: 4.5rem; height: 3px; margin-top: 0.7rem;
  background: repeating-linear-gradient(90deg, var(--accent) 0 0.6rem, transparent 0.6rem 1rem);
}
.hero.typo h1 { font-style: italic; }
`;
  }
  if (flair === "neon") {
    return `
.hero.poster h1 {
  background: linear-gradient(100deg, var(--primary) 10%, var(--accent) 90%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 18px color-mix(in srgb, var(--primary) 55%, transparent));
}
.btn-wa { box-shadow: 0 0 22px color-mix(in srgb, var(--primary) 60%, transparent); }
.menu-item { border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent); }
.menu-item:hover { border-color: var(--accent); box-shadow: 0 0 28px color-mix(in srgb, var(--accent) 30%, transparent); }
.price { text-shadow: 0 0 12px color-mix(in srgb, var(--primary) 60%, transparent); }
.kicker { color: var(--accent); text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 50%, transparent); }
.open-badge { background: rgb(255 255 255 / 0.08); color: var(--text); }
`;
  }
  if (flair === "brutal") {
    return `
:root { --shadow-card: none; --shadow-pop: none; }
.hero.color-block .hero-inner { color: var(--text); }
.hero.color-block .btn-wa { background: var(--text); color: var(--hero-bg, var(--bg)); }
.hero.color-block .btn-ghost { border-color: var(--text); color: var(--text); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi, .open-badge {
  border: 3px solid var(--text); box-shadow: 0.4rem 0.4rem 0 var(--text);
}
.menu-item:hover, .promo-card:hover { transform: translate(-2px, -2px); box-shadow: 0.55rem 0.55rem 0 var(--text); }
.btn-wa, .btn-ghost { border: 3px solid var(--text); box-shadow: 0.3rem 0.3rem 0 var(--text); }
.btn-wa:hover, .btn-ghost:hover { transform: translate(-2px, -2px); box-shadow: 0.45rem 0.45rem 0 var(--text); }
.badge-fav { border: 2px solid var(--text); }
.promo-card::before { background: var(--text); width: 10px; }
.sec-title { text-transform: uppercase; }
.promo-ticker { border-bottom: 3px solid var(--text); }
`;
  }
  if (flair === "zen") {
    return `
body::before {
  content: ""; position: fixed; inset: 0.9rem; z-index: 90; pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--text) 35%, transparent);
}
.kicker { letter-spacing: 0.34em; font-weight: 600; }
.sec-title { letter-spacing: 0.05em; }
:root { --shadow-card: none; --shadow-pop: 0 14px 30px -18px rgb(0 0 0 / 0.25); }
.menu-item, .hours-card, .contact-card, .testi, .promo-card {
  border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
}
.hero.frame .open-badge { box-shadow: none; border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); }
.testi .qmark { color: color-mix(in srgb, var(--primary) 35%, transparent); }
`;
  }
  if (flair === "tropis") {
    return `
section { position: relative; }
.hero.split .hero-side img { border-radius: 100vw 100vw 0 0; margin-top: clamp(2rem, 6vw, 4rem); height: calc(100% - clamp(2rem, 6vw, 4rem)); }
.hero.split .hero-side.pattern { border-radius: 100vw 100vw 0 0; margin: clamp(2rem, 6vw, 4rem) 1.5rem 0; }
.menu-item .mi-photo { border-radius: calc(var(--r-card) * 1.4) calc(var(--r-card) * 1.4) 0 0; }
.gallery-grid .ph:nth-child(odd) { border-radius: 100vw 100vw var(--r-card) var(--r-card); }
.sec-title::after {
  content: "🌿"; display: inline-block; margin-left: 0.5rem; font-size: 0.7em;
}
.open-badge { background: color-mix(in srgb, var(--surface) 92%, transparent); }
`;
  }
  return "";
}
