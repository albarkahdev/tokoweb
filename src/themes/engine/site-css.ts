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
  overflow-x: clip;
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

:root { --tk-h: 2.3rem; --nav-h: 3.5rem; }
.promo-ticker {
  position: sticky; top: 0; z-index: 60; display: flex; align-items: center;
  height: var(--tk-h); overflow: hidden;
  background: var(--text); color: var(--bg); text-decoration: none;
  font-weight: 700; font-size: 0.85rem;
  border-bottom: 2px solid var(--accent);
}
.promo-ticker .tk { display: flex; width: max-content; animation: tk-run var(--tk-dur, 20s) linear infinite; }
.promo-ticker .tk > span { padding-right: 3rem; white-space: nowrap; }
.promo-ticker:hover .tk { animation-play-state: paused; }
@keyframes tk-run { to { transform: translateX(-50%); } }

.announce-bar {
  display: flex; align-items: center; gap: 0.6rem; z-index: 61;
  padding: 0.5rem 1rem; font-size: 0.82rem; font-weight: 600; line-height: 1.35;
  background: var(--primary); color: var(--primary-contrast);
}
.announce-bar .announce-text { flex: 1; min-width: 0; }
.announce-bar .announce-close {
  flex-shrink: 0; background: rgb(255 255 255 / 0.16); color: inherit; border: none;
  width: 1.6rem; height: 1.6rem; border-radius: 9999px; font-size: 1.05rem; line-height: 1;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.announce-bar .announce-close:hover { background: rgb(255 255 255 / 0.28); }

.site-nav {
  position: sticky; top: 0; z-index: 55;
  height: var(--nav-h); display: flex; align-items: center; gap: 1rem;
  padding: 0 1.4rem;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 22%, transparent);
}
.site-nav.with-ticker { top: var(--tk-h); }
.nav-brand {
  font-family: var(--f-heading); font-weight: var(--w-heading); font-size: 1.15rem;
  text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
.nav-links { display: none; margin-left: auto; gap: 1.15rem; }
@media (min-width: 52rem) { .nav-links { display: flex; } }
.nav-links a {
  text-decoration: none; font-weight: 650; font-size: 0.88rem; color: var(--muted);
  transition: color 0.15s ease;
}
.nav-links a:hover { color: var(--primary); }
.nav-wa {
  margin-left: auto; flex-shrink: 0;
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: var(--primary); color: var(--primary-contrast);
  padding: 0.42rem 1rem; border-radius: var(--r-btn);
  font-weight: 700; font-size: 0.84rem; text-decoration: none;
}
@media (min-width: 52rem) { .nav-wa { margin-left: 0; } }

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
  align-self: flex-start; width: fit-content; max-width: 100%;
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
.menu-list .mi-head .leader { flex: 1; min-width: 1.5rem; border-bottom: 2px dotted color-mix(in srgb, var(--muted) 45%, transparent); transform: translateY(-0.3rem); }
.menu-list .price { font-size: 1rem; white-space: nowrap; }
@media (max-width: 40rem) {
  .menu-list .mi-head { flex-wrap: wrap; row-gap: 0.1rem; }
  .menu-list .mi-head h3 { flex-shrink: 1; }
  .menu-list .mi-head .price { margin-left: auto; }
}

.menu-grid-2 .menu-item:nth-child(3n+2) .mi-body { background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }

.badge-fav {
  display: inline-block; background: var(--accent);
  color: #241C10;
  font-size: 0.7rem; font-weight: 800; padding: 0.14rem 0.62rem;
  border-radius: 9999px; vertical-align: middle; letter-spacing: 0.02em;
  margin: 0.12rem 0;
}
h3 .badge-fav { margin-left: 0.35rem; }

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
.lightbox .lb-prev, .lightbox .lb-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 2.9rem; height: 2.9rem; border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 0.35);
  background: rgb(0 0 0 / 0.45); color: #FFF; font-size: 2rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  padding: 0 0 0.25rem;
}
.lightbox .lb-prev { left: 0.8rem; }
.lightbox .lb-next { right: 0.8rem; }
.lightbox .lb-prev:hover, .lightbox .lb-next:hover { background: rgb(0 0 0 / 0.75); }
.lightbox .lb-count {
  position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
  color: rgb(255 255 255 / 0.85); font-size: 0.85rem; font-weight: 600;
}

.menu-item.has-pop { cursor: pointer; position: relative; }
.mi-open, .pr-open {
  position: absolute; inset: 0; z-index: 1;
  background: none; border: none; cursor: pointer; padding: 0;
  border-radius: inherit;
}
.mi-open:focus-visible, .pr-open:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.menu-item .ask { position: relative; z-index: 2; }
.badge-special { background: var(--primary); color: var(--primary-contrast); }
.special-sec .menu-item {
  border: 2px solid color-mix(in srgb, var(--primary) 55%, transparent);
  box-shadow: 0 10px 30px -14px color-mix(in srgb, var(--primary) 50%, transparent);
}
.mi-pop {
  position: fixed; inset: 0; z-index: 100; display: none;
  align-items: flex-end; justify-content: center;
  background: rgb(0 0 0 / 0.6); backdrop-filter: blur(3px);
}
.mi-pop.show { display: flex; }
@media (min-width: 40rem) { .mi-pop { align-items: center; padding: 1.5rem; } }
.mp-box {
  position: relative; background: var(--surface); color: var(--text);
  width: 100%; max-width: 26rem; max-height: 88dvh; overflow-y: auto;
  border-radius: var(--r-card) var(--r-card) 0 0;
  animation: mp-up 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (min-width: 40rem) { .mp-box { border-radius: var(--r-card); } }
@keyframes mp-up { from { transform: translateY(2.5rem); opacity: 0; } to { transform: none; opacity: 1; } }
.mp-close {
  position: absolute; top: 0.5rem; right: 0.6rem; z-index: 2;
  width: 2.2rem; height: 2.2rem; border-radius: 50%;
  border: none; background: rgb(0 0 0 / 0.45); color: #FFF;
  font-size: 1.4rem; line-height: 1; cursor: pointer;
}
.mp-media { position: relative; }
.mp-media img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.mp-prev, .mp-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 2.3rem; height: 2.3rem; border-radius: 50%;
  border: none; background: rgb(0 0 0 / 0.45); color: #FFF;
  font-size: 1.6rem; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0 0 0.2rem;
}
.mp-prev { left: 0.6rem; }
.mp-next { right: 0.6rem; }
.mp-count {
  position: absolute; bottom: 0.6rem; right: 0.7rem;
  background: rgb(0 0 0 / 0.55); color: #FFF; font-size: 0.75rem; font-weight: 700;
  padding: 0.1rem 0.6rem; border-radius: 9999px;
}
.mp-body { padding: 1.2rem 1.3rem 1.4rem; display: flex; flex-direction: column; gap: 0.45rem; }
.mp-body h3 { font-size: 1.3rem; }
.mp-price { color: var(--primary); font-weight: 800; font-size: 1.15rem; }
.mp-body p { color: var(--muted); font-size: 0.92rem; }
.mp-body p:empty { display: none; }
.mp-body .btn-wa { justify-content: center; margin-top: 0.5rem; }
.mp-tag {
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--primary);
}
.mp-until {
  align-self: flex-start; font-size: 0.8rem; font-weight: 700;
  background: color-mix(in srgb, var(--accent) 25%, var(--surface));
  padding: 0.25rem 0.8rem; border-radius: 9999px;
}
.mp-share { margin: 0.6rem 0 0; align-self: stretch; text-align: center; padding: 0.6rem 1rem; }
.share-btn {
  margin-left: auto; flex-shrink: 0;
  white-space: nowrap; font: inherit; font-weight: 700; font-size: 0.87rem;
  color: var(--primary-contrast); background: var(--primary);
  padding: 0.35rem 1rem; border-radius: 9999px; border: none; cursor: pointer;
}
@media (prefers-reduced-motion: reduce) { .mp-box { animation: none; } }
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
  position: sticky; top: var(--nav-h); background: color-mix(in srgb, var(--bg) 92%, transparent);
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
.subnav .back { border: none; font-weight: 800; color: var(--primary); padding-left: 0; }
.subnav .here {
  align-self: center; font-size: 0.78rem; font-weight: 800;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);
}

.reveal {
  opacity: 0;
  transform: translateY(2rem);
  transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1), transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.in { opacity: 1; transform: none; }
.menu-grid > .reveal:nth-child(2), .testi-grid > .reveal:nth-child(2), .gallery-grid > .reveal:nth-child(2) { transition-delay: 0.12s; }
.menu-grid > .reveal:nth-child(3), .testi-grid > .reveal:nth-child(3), .gallery-grid > .reveal:nth-child(3) { transition-delay: 0.24s; }
.menu-grid > .reveal:nth-child(4), .testi-grid > .reveal:nth-child(4), .gallery-grid > .reveal:nth-child(4) { transition-delay: 0.36s; }
.menu-grid > .reveal:nth-child(5), .gallery-grid > .reveal:nth-child(5) { transition-delay: 0.48s; }
.menu-grid > .reveal:nth-child(6), .gallery-grid > .reveal:nth-child(6) { transition-delay: 0.6s; }
.hero .hero-inner > * { animation: hero-in 1s cubic-bezier(0.22, 1, 0.36, 1) both; }
.hero .hero-inner > :nth-child(1) { animation-delay: 0.1s; }
.hero .hero-inner > :nth-child(2) { animation-delay: 0.25s; }
.hero .hero-inner > :nth-child(3) { animation-delay: 0.4s; }
.hero .hero-inner > :nth-child(4) { animation-delay: 0.55s; }
@keyframes hero-in {
  from { opacity: 0; transform: translateY(1.4rem); }
  to { opacity: 1; transform: none; }
}
.hero-thumb, .hero-side { animation: hero-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both; }
${LAYOUT_EXTRAS_CSS}
${flairCss(theme.flair)}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .menu-item, .promo-card, .gallery-grid img, .btn-wa, .btn-ghost { transition: none; }
  .promo-ticker .tk { animation: none; flex-wrap: wrap; width: auto; }
  .promo-ticker .tk > span[aria-hidden] { display: none; }
  .poster-echo { animation: none; }
  .hero .hero-inner > *, .hero-thumb, .hero-side { animation: none; }
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
  .hero.split .hero-side img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
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
  padding: 1.6rem 1.25rem; align-items: flex-start; counter-increment: mag;
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 30%, transparent);
}
@media (max-width: 40rem) {
  .menu-magazine .menu-item { flex-wrap: wrap; gap: 0.9rem 1rem; }
  .menu-magazine .menu-item::before { flex-basis: 100%; }
  .menu-magazine .menu-item .mi-photo {
    order: 0; width: 100%; height: auto; aspect-ratio: 16/10; object-fit: cover;
  }
  .menu-magazine .menu-item .mi-body { order: 4; flex: 1 1 100%; }
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
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
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
  if (flair === "royal") {
    return `
.sec-title { text-align: left; }
.sec-title::after {
  content: "❦"; display: block; color: var(--accent); font-size: 1.1rem; margin-top: 0.5rem;
}
.hero.frame .hero-inner { border: 1px solid color-mix(in srgb, var(--accent) 60%, transparent); outline: 1px solid color-mix(in srgb, var(--accent) 60%, transparent); outline-offset: 5px; margin: 1.2rem auto; width: calc(100% - 2.4rem); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
}
.kicker { color: var(--accent); letter-spacing: 0.24em; }
.price { color: var(--accent); }
.badge-fav { background: var(--primary); color: var(--accent); }
.site-nav { border-bottom: 1px solid color-mix(in srgb, var(--accent) 55%, transparent); }
.nav-wa { background: var(--primary); color: var(--accent); }
`;
  }
  if (flair === "retro") {
    return `
:root { --shadow-card: 0 3px 0 color-mix(in srgb, var(--text) 80%, transparent); --shadow-pop: 0 5px 0 color-mix(in srgb, var(--text) 80%, transparent); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi, .open-badge {
  border: 2.5px solid var(--text);
}
.btn-wa, .btn-ghost, .nav-wa { border: 2.5px solid var(--text); box-shadow: 0 3px 0 var(--text); }
.btn-wa:hover, .btn-ghost:hover { transform: translateY(-2px); box-shadow: 0 5px 0 var(--text); }
.sec-title::after {
  content: ""; display: block; height: 0.5rem; width: 6.5rem; margin-top: 0.7rem; border-radius: 9999px;
  background: repeating-linear-gradient(90deg, var(--primary) 0 1.4rem, var(--accent) 1.4rem 2.8rem, var(--text) 2.8rem 3rem);
}
.hero.color-block .hero-inner { color: var(--text); }
.hero.color-block .btn-wa { background: var(--text); color: var(--bg); }
.hero.color-block .btn-ghost { border-color: var(--text); color: var(--text); }
.badge-fav { border: 2px solid var(--text); }
`;
  }
  if (flair === "mono") {
    return `
:root { --shadow-card: none; --shadow-pop: none; }
.hero.poster .hero-inner { color: var(--text); }
.hero.poster .btn-wa { background: var(--text); color: var(--bg); }
.hero.poster .btn-ghost { border-color: var(--text); color: var(--text); }
.poster-echo { color: var(--accent); opacity: 1; }
section { border-top: 1px solid var(--text); max-width: none; padding-left: max(1.4rem, calc((100vw - 66rem) / 2 + 1.4rem)); padding-right: max(1.4rem, calc((100vw - 66rem) / 2 + 1.4rem)); }
.hero { border-top: none; }
.sec-title { text-transform: uppercase; letter-spacing: -0.01em; }
.kicker { color: var(--accent); }
.menu-item, .hours-card, .contact-card, .testi, .promo-card { border: 1px solid var(--text); }
.menu-list .menu-item { border-bottom: 1px solid var(--text); }
.price { color: var(--accent); }
.btn-wa { box-shadow: none; }
.promo-card::before { background: var(--accent); }
.contact-card .c-ico { border-radius: 0; background: var(--text); color: var(--bg); }
`;
  }
  if (flair === "lampion") {
    return `
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
  outline: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  outline-offset: 3px;
}
.sec-title::before { content: "◆ "; color: var(--accent); font-size: 0.7em; vertical-align: middle; }
.site-nav { border-bottom: 2px solid var(--accent); }
.promo-ticker { background: var(--primary); color: #F9E8C9; border-bottom-color: var(--accent); }
.hero.color-block .hero-inner { color: #F9E8C9; }
.hero.color-block .btn-wa { background: var(--accent); color: var(--primary); }
.badge-fav { background: var(--accent); color: var(--primary); }
.gallery-grid .ph { border-radius: 9999px 9999px var(--r-card) var(--r-card); }
`;
  }
  if (flair === "sketsa") {
    return `
:root { --shadow-card: none; --shadow-pop: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi, .open-badge {
  border: 2px dashed color-mix(in srgb, var(--text) 55%, transparent);
  background: var(--surface);
}
.menu-item:nth-child(odd) { rotate: -0.7deg; }
.menu-item:nth-child(even) { rotate: 0.6deg; }
.menu-item:hover { rotate: 0deg; }
.sec-title { display: inline-block; border-bottom: 3px dashed var(--primary); padding-bottom: 0.3rem; }
.kicker { color: var(--accent); display: table; margin-bottom: 0.7rem; }
.price { color: var(--primary); }
.btn-wa { box-shadow: none; border: 2px dashed color-mix(in srgb, var(--text) 40%, transparent); }
.btn-ghost { border-style: dashed; }
.promo-card::before { background: repeating-linear-gradient(180deg, var(--primary) 0 10px, transparent 10px 18px); }
.contact-card .c-ico { background: transparent; border: 2px dashed color-mix(in srgb, var(--text) 45%, transparent); }
.hours-table td { border-bottom-style: dashed; }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
`;
  }
  if (flair === "blueprint") {
    return `
body {
  background-image:
    linear-gradient(color-mix(in srgb, var(--accent) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 7%, transparent) 1px, transparent 1px);
  background-size: 2.2rem 2.2rem;
}
:root { --shadow-card: none; --shadow-pop: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi, .open-badge {
  background: transparent; border: 1.5px solid color-mix(in srgb, var(--accent) 55%, transparent);
}
.menu-item .mi-body, .menu-grid-2 .menu-item:nth-child(3n+2) .mi-body { background: transparent; }
.sec-title { color: var(--accent); }
.sec-title::after { content: " —"; color: color-mix(in srgb, var(--accent) 55%, transparent); }
.kicker { letter-spacing: 0.3em; }
.btn-wa { box-shadow: none; }
.btn-ghost { border-style: dashed; }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
.site-nav { background: color-mix(in srgb, var(--bg) 88%, transparent); }
`;
  }
  if (flair === "koran") {
    return `
.sec-title { border-top: 3px double var(--text); border-bottom: 1px solid var(--text); padding: 0.4rem 0; }
.kicker { color: var(--accent); font-family: var(--f-body); }
:root { --shadow-card: none; --shadow-pop: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi { border: 1px solid var(--text); }
.menu-list .menu-item { border: none; border-bottom: 1px dotted var(--text); }
.price { color: var(--accent); }
.badge-fav { background: var(--accent); color: #FFF; border-radius: 0; }
.testi .qmark { color: var(--accent); }
.promo-card::before { background: var(--text); width: 4px; }
.hero.typo h1 { letter-spacing: -0.03em; }
.hero.typo .tagline { font-style: italic; }
`;
  }
  if (flair === "aurora") {
    return `
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  background: rgb(255 255 255 / 0.06);
  border: 1px solid rgb(255 255 255 / 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.menu-item .mi-body { background: transparent; }
.menu-item:hover { border-color: color-mix(in srgb, var(--accent) 60%, transparent); }
.hero.split .hero-side.pattern {
  background:
    radial-gradient(18rem 18rem at 30% 30%, color-mix(in srgb, var(--primary) 45%, transparent), transparent 70%),
    radial-gradient(16rem 16rem at 70% 75%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 70%);
}
.sec-title {
  background: linear-gradient(100deg, var(--primary), var(--accent));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.btn-wa { box-shadow: 0 0 26px color-mix(in srgb, var(--primary) 45%, transparent); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
.contact-card .c-cta { background: rgb(255 255 255 / 0.05); }
`;
  }
  if (flair === "keramik") {
    return `
.sec-title::after {
  content: ""; display: block; width: 7rem; height: 0.55rem; margin-top: 0.65rem;
  background: radial-gradient(circle at 0.28rem 0.28rem, var(--primary) 0 0.16rem, transparent 0.17rem),
    radial-gradient(circle at 0.83rem 0.28rem, var(--accent) 0 0.16rem, transparent 0.17rem);
  background-size: 1.1rem 0.55rem;
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 2px solid color-mix(in srgb, var(--primary) 25%, transparent);
}
.menu-item .mi-photo { border-bottom: 4px solid var(--accent); }
.hero.color-block .hero-inner { color: var(--primary-contrast); }
.badge-fav { background: var(--primary); color: #FFF; }
.gallery-grid .ph { border: 3px solid var(--surface); outline: 2px solid color-mix(in srgb, var(--primary) 30%, transparent); }
`;
  }
  if (flair === "pixel") {
    return `
:root { --shadow-card: 0.35rem 0.35rem 0 color-mix(in srgb, var(--accent) 60%, transparent); --shadow-pop: 0.5rem 0.5rem 0 var(--accent); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi, .open-badge, .btn-wa, .btn-ghost, .nav-wa {
  border-radius: 0 !important; border: 2px solid var(--text);
}
.btn-wa { box-shadow: 0.3rem 0.3rem 0 var(--accent); }
.btn-ghost { box-shadow: 0.3rem 0.3rem 0 color-mix(in srgb, var(--accent) 45%, transparent); }
.hero.poster h1 { text-shadow: 0.22rem 0.22rem 0 var(--accent); }
.hero.poster .hero-inner { color: var(--text); }
.hero.poster .btn-wa { background: var(--primary); color: var(--primary-contrast); }
.sec-title { text-shadow: 0.14rem 0.14rem 0 color-mix(in srgb, var(--accent) 70%, transparent); }
.kicker::before { content: "▶ "; }
.price { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.08); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
`;
  }
  if (flair === "stempel") {
    return `
.kicker {
  display: table; border: 2px solid var(--accent); color: var(--accent);
  padding: 0.15rem 0.7rem; rotate: -1.5deg; border-radius: 0.3rem;
  margin-bottom: 0.7rem;
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1.5px solid color-mix(in srgb, var(--text) 30%, transparent);
}
.menu-polaroid .menu-item { box-shadow: 0 4px 10px rgb(0 0 0 / 0.12); }
.badge-fav { rotate: -2deg; border: 1.5px dashed var(--text); background: transparent; color: var(--text); }
.hero.frame .hero-inner {
  border: 2px dashed color-mix(in srgb, var(--text) 40%, transparent); margin: 1.2rem auto; width: calc(100% - 2.4rem); rotate: -0.4deg;
}
.price { color: var(--accent); }
.sec-title { rotate: -0.5deg; display: inline-block; }
`;
  }
  if (flair === "disko") {
    return `
.hero.poster h1 {
  background: linear-gradient(95deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  font-style: italic;
}
.hero.poster .hero-inner { color: var(--text); }
.hero.poster .btn-wa { background: linear-gradient(120deg, var(--primary), var(--accent)); color: #FFF; }
.poster-echo { color: var(--accent); opacity: 0.5; font-style: italic; }
.sec-title { font-style: italic; }
.menu-item, .promo-card, .testi, .hours-card, .contact-card {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    linear-gradient(120deg, color-mix(in srgb, var(--primary) 50%, transparent), color-mix(in srgb, var(--accent) 50%, transparent)) border-box;
}
.menu-item .mi-body { background: transparent; }
.price {
  background: linear-gradient(100deg, var(--primary), var(--accent));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
`;
  }
  if (flair === "hutan") {
    return `
.sec-title::after { content: ""; display: block; width: 5rem; height: 1px; background: var(--accent); margin-top: 0.7rem; }
.kicker { color: var(--accent); letter-spacing: 0.28em; }
:root { --shadow-card: none; --shadow-pop: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
}
.menu-item .mi-body { background: transparent; }
.price { color: var(--accent); }
.hero.split .hero-side img { filter: saturate(0.9); }
.hero.split .hero-side.pattern {
  background:
    radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--accent) 25%, transparent) 0 0.4rem, transparent 0.45rem),
    radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--accent) 18%, transparent) 0 0.6rem, transparent 0.65rem);
  background-size: 4rem 4rem;
}
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
.testi .qmark { color: color-mix(in srgb, var(--accent) 55%, transparent); }
`;
  }
  if (flair === "teraso") {
    return `
body {
  background-image:
    radial-gradient(circle at 12% 20%, rgb(224 122 95 / 0.16) 0 0.45rem, transparent 0.5rem),
    radial-gradient(circle at 55% 8%, rgb(61 90 128 / 0.14) 0 0.35rem, transparent 0.4rem),
    radial-gradient(circle at 85% 35%, rgb(129 178 154 / 0.16) 0 0.5rem, transparent 0.55rem),
    radial-gradient(circle at 30% 70%, rgb(242 204 143 / 0.2) 0 0.4rem, transparent 0.45rem),
    radial-gradient(circle at 75% 85%, rgb(224 122 95 / 0.13) 0 0.35rem, transparent 0.4rem);
  background-size: 11rem 11rem;
}
section { background: transparent; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi { border: 1.5px solid var(--text); }
.sec-title::after {
  content: "● ● ●"; display: block; font-size: 0.5rem; letter-spacing: 0.6em;
  color: var(--accent); margin-top: 0.6rem;
}
.badge-fav { background: var(--text); color: var(--bg); }
`;
  }
  if (flair === "krim") {
    return `
.menu-item, .promo-card { border-radius: 1.9rem 1.1rem 1.9rem 1.1rem; }
.hours-card, .contact-card { border-radius: 1.1rem 1.9rem 1.1rem 1.9rem; }
.testi { border-radius: 1.9rem 1.9rem 1.9rem 0.4rem; }
:root { --shadow-card: 0 6px 0 color-mix(in srgb, var(--accent) 55%, transparent); --shadow-pop: 0 9px 0 color-mix(in srgb, var(--accent) 75%, transparent); }
.menu-item:hover { transform: translateY(-3px); }
.sec-title::after {
  content: ""; display: block; width: 6rem; height: 0.7rem; margin-top: 0.6rem;
  border-radius: 9999px; background: var(--accent);
}
.badge-fav { background: var(--text); color: var(--accent); }
.contact-card .c-ico { border-radius: 50%; }
`;
  }
  if (flair === "ombak") {
    return `
section { position: relative; }
.sec-title::after {
  content: ""; display: block; width: 8rem; height: 0.6rem; margin-top: 0.7rem;
  background: radial-gradient(circle at 0.5rem -0.15rem, transparent 0 0.32rem, var(--primary) 0.33rem 0.45rem, transparent 0.46rem);
  background-size: 1rem 0.6rem;
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1.5px solid color-mix(in srgb, var(--primary) 30%, transparent);
  border-bottom-width: 4px;
}
.hours-card { border-top: 0.5rem solid var(--accent); }
.kicker { color: var(--accent); }
.price { color: var(--primary); }
.badge-fav { background: var(--accent); color: #FFF; }
.gallery-grid .ph { border-radius: 50% 50% var(--r-card) var(--r-card) / 18% 18% var(--r-card) var(--r-card); }
`;
  }
  if (flair === "rempah") {
    return `
.hero.color-block h1 {
  -webkit-text-stroke: 2px var(--primary-contrast); color: transparent;
  letter-spacing: 0.01em; text-transform: uppercase;
}
.hero.color-block .tagline { font-weight: 700; }
.sec-title { text-transform: uppercase; }
.sec-title::after {
  content: "• • • • •"; display: block; font-size: 0.55rem; letter-spacing: 0.5em;
  color: var(--accent); margin-top: 0.5rem;
}
.menu-magazine .menu-item::before { color: var(--accent); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border-left: 5px solid var(--accent);
}
.badge-fav { background: var(--accent); color: #FFF; }
.price { color: var(--primary); }
`;
  }
  if (flair === "kelopak") {
    return `
.menu-item, .testi { border-radius: 2rem 0.4rem 2rem 0.4rem; }
.promo-card, .hours-card, .contact-card { border-radius: 0.4rem 2rem 0.4rem 2rem; }
.menu-item .mi-photo { border-radius: 1.7rem 0.2rem 0 0; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
}
.sec-title::after { content: " ✿"; color: var(--accent); font-size: 0.8em; }
.kicker { color: var(--primary); }
.badge-fav { background: var(--accent); color: var(--text); }
.gallery-grid .ph:nth-child(even) { border-radius: 2rem 0.4rem 2rem 0.4rem; }
.gallery-grid .ph:nth-child(odd) { border-radius: 0.4rem 2rem 0.4rem 2rem; }
`;
  }
  if (flair === "gerabah") {
    return `
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border-bottom: 6px solid color-mix(in srgb, var(--primary) 55%, transparent);
  border-radius: var(--r-card) var(--r-card) 0.3rem 0.3rem;
}
.menu-item .mi-photo { border-radius: 100vw 100vw 0 0; padding: 0.7rem 0.7rem 0; background: var(--surface); }
.sec-title::after {
  content: ""; display: block; width: 5.5rem; height: 4px; margin-top: 0.7rem;
  background: repeating-linear-gradient(90deg, var(--primary) 0 0.8rem, transparent 0.8rem 1.2rem);
}
.hero.split .hero-side.pattern {
  background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--primary) 14%, transparent) 0 0.4rem, transparent 0.4rem 1.6rem);
}
.hero.split .hero-side img { border-radius: 100vw 100vw 0 0; margin: clamp(2rem, 6vw, 3.5rem) 1.5rem 0; height: calc(100% - clamp(2rem, 6vw, 3.5rem)); width: calc(100% - 3rem); }
.kicker { color: var(--primary); }
`;
  }
  if (flair === "beku") {
    return `
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 18%, transparent);
  border-top: 3px solid var(--accent);
}
.sec-title::after { content: " ✦"; color: var(--primary); font-size: 0.7em; vertical-align: super; }
.kicker { letter-spacing: 0.3em; color: var(--primary); }
.hero.frame .hero-inner { border-top: 3px solid var(--accent); border-bottom: 3px solid var(--accent); margin: 1.2rem auto; width: calc(100% - 2.4rem); }
.hero.frame h1 { letter-spacing: 0.08em; }
.price { color: var(--primary); }
.gallery-grid .ph { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: -3px; }
`;
  }
  if (flair === "api") {
    return `
.hero.poster h1 {
  background: linear-gradient(0deg, var(--primary) 15%, var(--accent) 85%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 20px color-mix(in srgb, var(--primary) 50%, transparent));
}
.btn-wa { animation: api-pulse 2.2s ease-in-out infinite; }
@keyframes api-pulse {
  0%, 100% { box-shadow: 0 0 18px color-mix(in srgb, var(--primary) 45%, transparent); }
  50% { box-shadow: 0 0 34px color-mix(in srgb, var(--primary) 75%, transparent); }
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
  border-bottom: 3px solid color-mix(in srgb, var(--primary) 65%, transparent);
}
.price { color: var(--accent); text-shadow: 0 0 14px color-mix(in srgb, var(--primary) 65%, transparent); }
.kicker { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { .btn-wa { animation: none; } }
`;
  }
  if (flair === "anyaman") {
    return `
body {
  background-image:
    repeating-linear-gradient(45deg, color-mix(in srgb, var(--primary) 4%, transparent) 0 2px, transparent 2px 14px),
    repeating-linear-gradient(-45deg, color-mix(in srgb, var(--primary) 4%, transparent) 0 2px, transparent 2px 14px);
}
section { background: transparent; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border-left: 6px solid var(--primary);
  border-right: 6px solid var(--primary);
  border-radius: 0.4rem;
}
.menu-polaroid .menu-item { border-left-width: 6px; border-right-width: 6px; }
.sec-title::after {
  content: ""; display: block; width: 6rem; height: 5px; margin-top: 0.7rem;
  background: repeating-linear-gradient(90deg, var(--primary) 0 0.7rem, var(--accent) 0.7rem 1.4rem);
}
.badge-fav { background: var(--primary); color: #FFF; }
`;
  }
  if (flair === "sutra") {
    return `
:root { --shadow-card: 0 2px 4px rgb(0 0 0 / 0.03), 0 18px 44px -24px rgb(0 0 0 / 0.18); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi { border: none; }
.kicker { letter-spacing: 0.34em; }
.kicker::after { content: " —"; color: var(--accent); }
.sec-title { font-weight: 400; letter-spacing: 0.03em; }
.menu-magazine .menu-item { border-bottom: 1px solid color-mix(in srgb, var(--muted) 25%, transparent); }
.menu-magazine .menu-item::before { color: color-mix(in srgb, var(--accent) 90%, transparent); }
.price { color: var(--primary); font-weight: 600; }
.hero.split .hero-side.pattern {
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 40%, transparent), transparent 60%);
}
.btn-wa { box-shadow: none; }
`;
  }
  if (flair === "segar") {
    return `
.menu-item, .promo-card, .hours-card, .contact-card, .testi, .open-badge {
  border: 3px solid var(--text); box-shadow: 0 0.45rem 0 var(--text);
}
.menu-item:hover, .promo-card:hover { transform: translateY(-3px); box-shadow: 0 0.7rem 0 var(--text); }
.btn-wa, .btn-ghost, .nav-wa { border: 3px solid var(--text); box-shadow: 0 0.3rem 0 var(--text); }
.btn-wa:hover, .btn-ghost:hover { transform: translateY(-2px); }
.sec-title::after {
  content: ""; display: inline-block; width: 1.05rem; height: 1.05rem; margin-left: 0.5rem;
  border-radius: 50%; border: 3px dashed var(--accent); vertical-align: middle;
}
.hero.color-block .hero-inner { color: #FFFFFF; }
.hero.color-block .btn-wa { background: var(--text); color: var(--bg); }
.hero.color-block .btn-ghost { border-color: #FFFFFF; color: #FFFFFF; box-shadow: 0 0.3rem 0 rgb(0 0 0 / 0.4); }
.badge-fav { border: 2px solid var(--text); rotate: -3deg; }
.menu-polaroid .menu-item:nth-child(odd) { rotate: -1.2deg; }
`;
  }
  if (flair === "bulu") {
    return `
.sec-title {
  background: linear-gradient(100deg, var(--primary) 30%, var(--accent) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.sec-title::after {
  content: ""; display: block; width: 7rem; height: 0.7rem; margin-top: 0.6rem;
  background: radial-gradient(circle at 0.35rem 0.7rem, transparent 0 0.3rem, var(--accent) 0.31rem 0.42rem, transparent 0.43rem);
  background-size: 0.8rem 0.7rem;
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px dotted color-mix(in srgb, var(--accent) 75%, transparent);
  outline: 1px solid color-mix(in srgb, var(--primary) 18%, transparent);
  outline-offset: 3px;
}
.hero.color-block .hero-inner { color: var(--primary-contrast); }
.hero.color-block .btn-wa { background: var(--accent); color: var(--primary); }
.kicker { color: var(--accent); letter-spacing: 0.26em; }
.price { color: var(--primary); }
.badge-fav { background: linear-gradient(100deg, var(--primary), var(--accent)); color: #FFF; }
`;
  }
  if (flair === "sinar") {
    return `
.hero.typo { background-size: 200% 200%; animation: sinar-shift 14s ease-in-out infinite alternate; }
@keyframes sinar-shift { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }
.menu-item:hover { box-shadow: 0 18px 40px -14px color-mix(in srgb, var(--primary) 55%, transparent); }
.sec-title::after {
  content: ""; display: block; width: 5.5rem; height: 4px; margin-top: 0.7rem; border-radius: 9999px;
  background: linear-gradient(90deg, var(--primary), var(--accent));
}
.kicker { color: var(--primary); }
.open-badge { animation: sinar-glow 3.5s ease-in-out infinite; }
@keyframes sinar-glow { 0%,100% { box-shadow: 0 2px 10px rgb(0 0 0 / 0.12); } 50% { box-shadow: 0 2px 18px color-mix(in srgb, var(--accent) 70%, transparent); } }
@media (prefers-reduced-motion: reduce) { .hero.typo, .open-badge { animation: none; } }
`;
  }
  if (flair === "kunang") {
    return `
body::before, body::after {
  content: ""; position: fixed; z-index: 1; pointer-events: none;
  width: 0.4rem; height: 0.4rem; border-radius: 50%;
  background: var(--accent); filter: blur(0.5px);
  box-shadow: 0 0 14px var(--accent), 0 0 4px var(--accent);
  animation: kunang-float 12s ease-in-out infinite;
}
body::before { left: 14%; top: 32%; }
body::after { left: 76%; top: 58%; animation-delay: -6s; animation-duration: 16s; }
@keyframes kunang-float {
  0%, 100% { transform: translate(0, 0); opacity: 0.15; }
  50% { transform: translate(2.2rem, -3.5rem); opacity: 0.9; }
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
}
.price { color: var(--primary); }
.kicker { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { body::before, body::after { animation: none; opacity: 0.4; } }
`;
  }
  if (flair === "uap") {
    return `
.hero.frame .hero-inner { position: relative; }
.hero.frame .hero-inner::before, .hero.frame .hero-inner::after {
  content: ""; position: absolute; top: 1.2rem; left: 50%; pointer-events: none;
  width: 1.1rem; height: 2.8rem; border-radius: 9999px;
  background: color-mix(in srgb, var(--primary) 22%, transparent); filter: blur(6px);
  animation: uap-rise 4.5s ease-in-out infinite;
}
.hero.frame .hero-inner::before { margin-left: -1.4rem; }
.hero.frame .hero-inner::after { margin-left: 0.6rem; animation-delay: -2.2s; }
@keyframes uap-rise {
  0% { transform: translateY(0) scaleY(1); opacity: 0; }
  40% { opacity: 0.7; }
  100% { transform: translateY(-2.6rem) scaleY(1.4); opacity: 0; }
}
.menu-magazine .menu-item::before { color: var(--accent); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
}
.kicker { letter-spacing: 0.28em; color: var(--primary); }
@media (prefers-reduced-motion: reduce) { .hero.frame .hero-inner::before, .hero.frame .hero-inner::after { animation: none; opacity: 0; } }
`;
  }
  if (flair === "denyut") {
    return `
.menu-item, .promo-card { border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); }
.menu-item:hover, .promo-card:hover { animation: denyut-border 1.6s ease-in-out infinite; }
@keyframes denyut-border {
  0%, 100% { border-color: color-mix(in srgb, var(--primary) 40%, transparent); }
  50% { border-color: var(--accent); box-shadow: 0 0 22px color-mix(in srgb, var(--primary) 35%, transparent); }
}
.hero.poster h1 { color: var(--primary); text-shadow: 0 0 26px color-mix(in srgb, var(--primary) 55%, transparent); }
.hero.poster .hero-inner { color: var(--text); }
.hero.poster .btn-wa { background: var(--primary); color: #06211C; position: relative; }
.btn-wa::after {
  content: ""; position: absolute; inset: -0.45rem; border-radius: inherit; pointer-events: none;
  border: 2px solid color-mix(in srgb, var(--primary) 60%, transparent);
  animation: denyut-ring 2.4s ease-out infinite;
}
@keyframes denyut-ring { 0% { opacity: 1; transform: scale(0.9); } 100% { opacity: 0; transform: scale(1.15); } }
.price { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { .btn-wa::after, .menu-item:hover, .promo-card:hover { animation: none; } }
`;
  }
  if (flair === "melayang") {
    return `
.menu-item, .testi { animation: melayang-idle 7s ease-in-out infinite; }
.menu-item:nth-child(even), .testi:nth-child(even) { animation-delay: -3.5s; }
@keyframes melayang-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.45rem); } }
.menu-item:hover { transform: translateY(-0.6rem); animation-play-state: paused; }
:root { --shadow-card: 0 14px 34px -18px rgb(44 58 85 / 0.35); }
.hero.split .hero-side.pattern {
  background:
    radial-gradient(3.5rem 1.6rem at 30% 30%, #FFFFFF 60%, transparent 61%),
    radial-gradient(5rem 2.2rem at 65% 55%, #FFFFFF 60%, transparent 61%),
    radial-gradient(3rem 1.4rem at 45% 80%, #FFFFFF 60%, transparent 61%),
    linear-gradient(180deg, #DCEBFF 0%, #F2F7FF 100%);
}
.sec-title::after { content: " ☁"; color: var(--accent); font-size: 0.7em; }
.kicker { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { .menu-item, .testi { animation: none; } }
`;
  }
  if (flair === "tinta") {
    return `
.kicker { display: table; margin-bottom: 0.7rem; }
.sec-title { position: relative; display: inline-block; }
.sec-title::after {
  content: ""; position: absolute; left: 0; bottom: -0.35rem; height: 0.45rem; width: 100%;
  background: var(--accent); border-radius: 0.3rem 0.6rem 0.2rem 0.5rem / 0.5rem 0.2rem 0.6rem 0.3rem;
  transform: scaleX(0); transform-origin: left; transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
section:hover .sec-title::after, .reveal.in ~ .sec-title::after { transform: scaleX(1); }
.hero.typo h1 { border-bottom: 5px solid var(--accent); display: inline-block; padding-bottom: 0.2rem; }
:root { --shadow-card: none; --shadow-pop: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi { border: 1.5px solid var(--text); }
.menu-list .menu-item { border: none; border-bottom: 1.5px solid var(--text); }
.badge-fav { background: var(--accent); color: #FFF; }
.kicker { color: var(--accent); }
.btn-wa { box-shadow: none; }
`;
  }
  if (flair === "prisma") {
    return `
body::before {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(30rem 22rem at 15% 10%, rgb(139 92 246 / 0.1), transparent 60%),
    radial-gradient(26rem 20rem at 85% 85%, rgb(94 234 212 / 0.12), transparent 60%);
  animation: prisma-hue 16s linear infinite;
}
@keyframes prisma-hue { to { filter: hue-rotate(360deg); } }
.menu-item, .promo-card, .hours-card, .contact-card, .testi { position: relative; z-index: 1; }
.sec-title {
  background: linear-gradient(100deg, var(--primary), var(--accent), var(--primary));
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: prisma-slide 7s linear infinite;
}
@keyframes prisma-slide { to { background-position: 200% 0; } }
.menu-item { border: 1px solid color-mix(in srgb, var(--primary) 18%, transparent); }
.price { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { body::before, .sec-title { animation: none; } }
`;
  }
  if (flair === "loket") {
    return `
.hero.poster .hero-inner {
  color: var(--text);
  border: 4px solid var(--accent); border-radius: 1rem; margin: 1.2rem auto; width: calc(100% - 2.4rem); position: relative;
  background-image: radial-gradient(circle, var(--accent) 0 0.22rem, transparent 0.23rem);
  background-size: 1.6rem 1.6rem; background-repeat: repeat-x; background-position: 0.8rem 0.5rem;
  animation: loket-chase 1.2s steps(2) infinite;
}
@keyframes loket-chase { to { background-position: 2.4rem 0.5rem; } }
.hero.poster .btn-wa { background: var(--primary); color: #FFF; }
.hero.poster h1 { color: var(--accent); text-shadow: 0 4px 0 color-mix(in srgb, var(--primary) 70%, transparent); }
.menu-polaroid .menu-item { border: 2px dashed color-mix(in srgb, var(--accent) 50%, transparent); }
.promo-card::before { background: repeating-linear-gradient(180deg, var(--accent) 0 10px, transparent 10px 16px); }
.kicker { color: var(--accent); }
.price { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.12); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { .hero.poster .hero-inner { animation: none; } }
`;
  }
  if (flair === "sawah") {
    return `
.gallery-grid .ph { animation: sawah-sway 9s ease-in-out infinite; transform-origin: bottom center; }
.gallery-grid .ph:nth-child(even) { animation-delay: -4.5s; }
@keyframes sawah-sway { 0%, 100% { rotate: -0.6deg; } 50% { rotate: 0.6deg; } }
.sec-title::after {
  content: ""; display: block; width: 7rem; height: 0.55rem; margin-top: 0.7rem;
  background: radial-gradient(circle at 0.4rem -0.1rem, transparent 0 0.28rem, var(--primary) 0.29rem 0.4rem, transparent 0.41rem);
  background-size: 0.85rem 0.55rem;
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
  border-bottom: 4px solid color-mix(in srgb, var(--accent) 60%, transparent);
}
.kicker { color: var(--primary); }
.price { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { .gallery-grid .ph { animation: none; } }
`;
  }
  if (flair === "kilau") {
    return `
.sec-title {
  background: linear-gradient(100deg, var(--primary) 20%, #FFF6DC 50%, var(--primary) 80%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: kilau-sweep 5.5s ease-in-out infinite;
}
@keyframes kilau-sweep { 0% { background-position: 100% 0; } 100% { background-position: -50% 0; } }
.hero.frame .hero-inner { border: 1px solid color-mix(in srgb, var(--primary) 50%, transparent); margin: 1.2rem auto; width: calc(100% - 2.4rem); }
.hero.frame h1 { color: var(--accent); letter-spacing: 0.06em; }
:root { --shadow-card: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
}
.menu-magazine .menu-item::before { color: var(--primary); }
.price { color: var(--primary); }
.kicker { color: var(--primary); letter-spacing: 0.3em; }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { .sec-title { animation: none; } }
`;
  }
  if (flair === "gelembung") {
    return `
body::before, body::after {
  content: ""; position: fixed; bottom: -3rem; z-index: 0; pointer-events: none;
  width: 1.6rem; height: 1.6rem; border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--primary) 35%, transparent);
  animation: gelembung-naik 13s linear infinite;
}
body::before { left: 18%; }
body::after { left: 74%; width: 1rem; height: 1rem; animation-delay: -6s; animation-duration: 17s; }
@keyframes gelembung-naik {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 0.7; }
  100% { transform: translateY(-105vh); opacity: 0; }
}
.menu-item, .btn-wa { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.menu-item:hover { transform: translateY(-4px) scale(1.015); }
.hero.color-block .hero-inner { color: #FFF7EF; }
.hero.color-block .btn-wa { background: var(--surface); color: var(--text); }
.sec-title::after { content: " ○ ｡ ○"; color: var(--accent); font-size: 0.5em; vertical-align: super; }
.price { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { body::before, body::after { animation: none; opacity: 0; } }
`;
  }
  if (flair === "lilin") {
    return `
.hero.typo h1 {
  color: var(--accent);
  animation: lilin-flicker 4s ease-in-out infinite;
}
@keyframes lilin-flicker {
  0%, 100% { text-shadow: 0 0 22px color-mix(in srgb, var(--primary) 55%, transparent); }
  47% { text-shadow: 0 0 30px color-mix(in srgb, var(--primary) 75%, transparent); }
  52% { text-shadow: 0 0 16px color-mix(in srgb, var(--primary) 40%, transparent); }
  70% { text-shadow: 0 0 26px color-mix(in srgb, var(--primary) 65%, transparent); }
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
  animation: lilin-breathe 6s ease-in-out infinite;
}
@keyframes lilin-breathe {
  0%, 100% { box-shadow: 0 6px 22px -10px rgb(0 0 0 / 0.5); }
  50% { box-shadow: 0 6px 30px -8px color-mix(in srgb, var(--primary) 30%, transparent); }
}
.price { color: var(--primary); }
.kicker { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { .hero.typo h1, .menu-item, .promo-card, .hours-card, .contact-card, .testi { animation: none; } }
`;
  }
  if (flair === "orbit") {
    return `
.hero.poster .open-badge { position: relative; }
.hero.poster .open-badge::after {
  content: ""; position: absolute; inset: -0.85rem -1.4rem; border-radius: 9999px;
  border: 1.5px dashed color-mix(in srgb, var(--accent) 55%, transparent);
  animation: orbit-spin 14s linear infinite;
}
@keyframes orbit-spin { to { rotate: 360deg; } }
body::before {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(circle at 20% 25%, rgb(255 255 255 / 0.5) 0 1px, transparent 2px),
    radial-gradient(circle at 70% 15%, rgb(255 255 255 / 0.4) 0 1px, transparent 2px),
    radial-gradient(circle at 85% 60%, rgb(255 255 255 / 0.45) 0 1px, transparent 2px),
    radial-gradient(circle at 40% 80%, rgb(255 255 255 / 0.35) 0 1px, transparent 2px);
  animation: orbit-twinkle 5s ease-in-out infinite alternate;
}
@keyframes orbit-twinkle { from { opacity: 0.35; } to { opacity: 0.9; } }
.hero.poster .hero-inner { color: var(--text); }
.hero.poster h1 { color: var(--primary); text-shadow: 0.2rem 0.2rem 0 color-mix(in srgb, var(--accent) 55%, transparent); }
.hero.poster .btn-wa { background: var(--primary); color: #FFF; }
.menu-item { border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); }
.price { color: var(--accent); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { .hero.poster .open-badge::after, body::before { animation: none; } }
`;
  }
  if (flair === "gugur") {
    return `
body::before, body::after {
  content: "🍂"; position: fixed; top: -3rem; z-index: 1; pointer-events: none;
  font-size: 1.1rem; opacity: 0;
  animation: gugur-jatuh 11s linear infinite;
}
body::before { left: 22%; }
body::after { left: 70%; animation-delay: -5.5s; animation-duration: 14s; font-size: 0.9rem; }
@keyframes gugur-jatuh {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  100% { transform: translateY(108vh) rotate(300deg); opacity: 0; }
}
.menu-magazine .menu-item::before { color: var(--accent); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
}
.hero.split .hero-side.pattern {
  background: radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--accent) 35%, transparent) 0 0.5rem, transparent 0.55rem);
  background-size: 3.2rem 3.2rem;
}
.kicker { color: var(--primary); }
.price { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { body::before, body::after { animation: none; opacity: 0; } }
`;
  }
  if (flair === "sirup") {
    return `
.hero.color-block { overflow: hidden; }
.hero.color-block::before {
  content: ""; position: absolute; right: -4rem; top: -4rem; width: 16rem; height: 16rem;
  background: color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: 58% 42% 55% 45% / 45% 58% 42% 55%;
  animation: sirup-morph 9s ease-in-out infinite alternate;
}
@keyframes sirup-morph {
  from { border-radius: 58% 42% 55% 45% / 45% 58% 42% 55%; transform: rotate(0deg); }
  to { border-radius: 45% 55% 42% 58% / 55% 45% 58% 42%; transform: rotate(12deg); }
}
.hero.color-block .hero-inner { color: #FFF5FA; }
.hero.color-block .btn-wa { background: var(--surface); color: var(--text); }
.menu-polaroid .menu-item { border: 2px solid color-mix(in srgb, var(--primary) 30%, transparent); }
.sec-title::after {
  content: ""; display: block; width: 5rem; height: 0.6rem; margin-top: 0.6rem;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 9999px 0.2rem 9999px 0.2rem;
}
.price { color: var(--primary); }
.badge-fav { background: var(--accent); color: var(--text); }
@media (prefers-reduced-motion: reduce) { .hero.color-block::before { animation: none; } }
`;
  }
  if (flair === "jendela") {
    return `
.hero.frame { position: relative; overflow: hidden; }
.hero.frame::before {
  content: ""; position: absolute; top: -20%; bottom: -20%; width: 8rem; pointer-events: none;
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 0.75), transparent);
  transform: skewX(-12deg);
  animation: jendela-sinar 8s ease-in-out infinite;
}
@keyframes jendela-sinar { 0% { left: -30%; } 55%, 100% { left: 120%; } }
.hero.frame .hero-inner {
  border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
  margin: 1.2rem auto; width: calc(100% - 2.4rem);
  background:
    linear-gradient(color-mix(in srgb, var(--primary) 25%, transparent) 1px, transparent 1px) center / 100% 50%,
    none;
  background-blend-mode: normal;
}
:root { --shadow-card: 0 10px 30px -20px rgb(59 55 46 / 0.35); }
.menu-item, .promo-card, .hours-card, .contact-card, .testi { border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); }
.kicker { letter-spacing: 0.3em; color: var(--primary); }
@media (prefers-reduced-motion: reduce) { .hero.frame::before { animation: none; opacity: 0; } }
`;
  }
  if (flair === "komet") {
    return `
body::before, body::after {
  content: ""; position: fixed; z-index: 0; pointer-events: none;
  width: 7rem; height: 1.5px;
  background: linear-gradient(90deg, transparent, var(--accent));
  transform: rotate(-32deg);
  animation: komet-lintas 7s ease-in infinite;
  opacity: 0;
}
body::before { top: 18%; left: 60%; }
body::after { top: 55%; left: 15%; animation-delay: -3.4s; animation-duration: 9s; }
@keyframes komet-lintas {
  0%, 82% { opacity: 0; transform: translate(0, 0) rotate(-32deg); }
  86% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(-9rem, 5.6rem) rotate(-32deg); }
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
}
.hero.typo h1 { color: var(--accent); }
.price { color: var(--accent); }
.kicker { color: var(--primary); }
.open-badge { background: rgb(255 255 255 / 0.1); }
.open-badge.open { color: #6EE7A0; }
.open-badge.closed { color: #FCA5A5; }
@media (prefers-reduced-motion: reduce) { body::before, body::after { animation: none; } }
`;
  }
  if (flair === "angin") {
    return `
.menu-item { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.menu-item:hover { transform: perspective(40rem) rotateY(2.5deg) translateY(-4px); }
.menu-item:nth-child(even):hover { transform: perspective(40rem) rotateY(-2.5deg) translateY(-4px); }
.sec-title::after {
  content: "〜"; display: block; color: var(--primary); font-size: 0.9em; margin-top: 0.2rem;
  animation: angin-goyang 5s ease-in-out infinite;
}
@keyframes angin-goyang { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(0.6rem); } }
.hero.split .hero-side.pattern {
  background: repeating-linear-gradient(105deg, color-mix(in srgb, var(--primary) 12%, transparent) 0 0.35rem, transparent 0.35rem 1.5rem);
}
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
}
.kicker { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { .sec-title::after { animation: none; } }
`;
  }
  if (flair === "aksara") {
    return `
.hero.typo .tagline {
  overflow: hidden; white-space: nowrap; max-width: fit-content;
  border-right: 2px solid var(--accent);
  animation: aksara-ketik 2.4s steps(28, end) 0.3s backwards, aksara-kedip 0.9s step-end infinite;
}
@keyframes aksara-ketik { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes aksara-kedip { 50% { border-color: transparent; } }
:root { --shadow-card: none; }
.menu-item, .promo-card, .hours-card, .contact-card, .testi {
  border: 1px solid color-mix(in srgb, var(--text) 25%, transparent);
}
.menu-magazine .menu-item::before { color: var(--accent); }
.sec-title::before { content: "// "; color: var(--accent); }
.kicker { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.1em; }
.price { color: var(--accent); }
@media (max-width: 40rem) { .hero.typo .tagline { animation: none; border-right: none; white-space: normal; } }
@media (prefers-reduced-motion: reduce) { .hero.typo .tagline { animation: none; border-right: none; white-space: normal; } }
`;
  }
  if (flair === "karnaval") {
    return `
.hero.color-block::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1.3rem; z-index: 3;
  background:
    linear-gradient(135deg, var(--accent) 50%, transparent 51%) 0 0 / 1.3rem 1.3rem repeat-x,
    linear-gradient(225deg, var(--accent) 50%, transparent 51%) 0.65rem 0 / 1.3rem 1.3rem repeat-x;
  animation: karnaval-kibar 3.5s ease-in-out infinite;
  transform-origin: top;
}
@keyframes karnaval-kibar { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.92); } }
.hero.color-block .hero-inner { color: #FFFBEF; }
.hero.color-block .btn-wa { background: var(--accent); color: #10312C; }
.menu-polaroid .menu-item { border: 2.5px solid var(--text); }
.sec-title::after {
  content: "● ● ●"; display: block; font-size: 0.45rem; letter-spacing: 0.8em; margin-top: 0.6rem;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.badge-fav { rotate: -3deg; border: 2px solid var(--text); }
.price { color: var(--primary); }
@media (prefers-reduced-motion: reduce) { .hero.color-block::before { animation: none; } }
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
