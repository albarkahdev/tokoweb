import type { Child } from "hono/jsx";
import type { BlogBlock } from "@/domain/blog";
import { BrandLogo, FaviconLinks } from "@/ui/brand";
import { FONTS_CSS } from "@/ui/fonts-css";
import { TurnstileWidget } from "@/ui/turnstile-widget";

const DISPLAY_FONT = "'Fraunces', ui-serif, 'New York', Georgia, 'Times New Roman', serif";
const BODY_FONT = "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const LANDING_STYLES = `
${FONTS_CSS}
:root {
  --ink: #1C1917;
  --ink-soft: #44403C;
  --paper: #FBF7F0;
  --cream: #F5EEE2;
  --brand: #C4501B;
  --brand-hot: #E8632C;
  --brand-deep: #8C3A12;
  --gold: #E8A03C;
  --muted: #78716C;
  --surface: #FFFFFF;
  --border: #EBE2D4;
  --shadow-sm: 0 1px 2px rgb(28 25 23 / 0.05);
  --shadow-md: 0 10px 30px -8px rgb(28 25 23 / 0.14);
  --shadow-lg: 0 24px 60px -16px rgb(140 58 18 / 0.28);
  --display: ${DISPLAY_FONT};
  --body: ${BODY_FONT};
}
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--body);
  background: var(--paper);
  color: var(--ink);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
::selection { background: var(--gold); color: var(--ink); }

.wrap { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; }
.section { padding: clamp(4rem, 10vw, 7rem) 0; }
.section-tight { padding: clamp(2.5rem, 6vw, 4rem) 0; }

.topbar {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
}
.topbar .wrap { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 0.8rem; padding-bottom: 0.8rem; }
.topnav { display: flex; gap: 1.4rem; margin-left: auto; margin-right: 1.2rem; }
.topnav a { color: var(--ink-soft); text-decoration: none; font-weight: 600; font-size: 0.92rem; }
.topnav a:hover { color: var(--brand-deep); }
@media (max-width: 44rem) { .topnav { display: none; } }
.brand-logo { display: inline-flex; align-items: center; text-decoration: none; }
.brand-logo img { display: block; width: auto; }

.hero { position: relative; padding: clamp(1.5rem, 4vw, 3rem) 0 clamp(2.5rem, 6vw, 4rem); }
.hero .wrap { max-width: 82rem; }
.hero-bg {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(42rem 42rem at 88% 8%, color-mix(in srgb, var(--gold) 20%, transparent), transparent 60%),
    radial-gradient(36rem 36rem at -8% 82%, color-mix(in srgb, var(--brand-hot) 12%, transparent), transparent 55%);
}
.hero-grid { display: grid; gap: 3rem; align-items: center; grid-template-columns: 1fr; }
@media (min-width: 56rem) { .hero-grid { grid-template-columns: 1.15fr 0.85fr; } }

.eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--brand-deep); box-shadow: var(--shadow-sm);
  padding: 0.35rem 1rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem;
  letter-spacing: 0.02em; text-transform: uppercase;
}
.display {
  font-family: var(--display);
  font-size: clamp(2.6rem, 7.5vw, 4.6rem);
  line-height: 1.04; letter-spacing: -0.03em; font-weight: 640;
  margin: 1.1rem 0 1.25rem;
}
.display .accent {
  color: var(--brand); font-style: italic; font-weight: 600;
  background: linear-gradient(120deg, var(--brand) 0%, var(--brand-hot) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.lede { font-size: clamp(1.05rem, 2.6vw, 1.25rem); color: var(--ink-soft); max-width: 32rem; }
.lede strong { color: var(--ink); }

.cta-row { display: flex; gap: 0.85rem; flex-wrap: wrap; margin-top: 2rem; }
.btn {
  display: inline-flex; align-items: center; gap: 0.55rem;
  font: inherit; font-weight: 700; text-decoration: none; cursor: pointer;
  border-radius: 9999px; padding: 0.95rem 1.9rem; font-size: 1rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.btn:active { transform: translateY(1px) scale(0.99); }
.btn-fill {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-hot) 100%);
  color: #FFF7F2; border: none; box-shadow: 0 10px 24px -8px rgb(196 80 27 / 0.55);
}
.btn-fill:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgb(196 80 27 / 0.6); }
.btn-line { background: var(--surface); color: var(--ink); border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); }
.btn-line:hover { border-color: var(--brand); color: var(--brand-deep); transform: translateY(-2px); }
.btn:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }

.trust-row { display: flex; gap: 1.2rem 1.6rem; flex-wrap: wrap; margin-top: 1.9rem; }
.trust-item { display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.88rem; color: var(--muted); font-weight: 600; }
.trust-item svg { color: var(--brand); flex-shrink: 0; }

.phone-stage { position: relative; display: flex; justify-content: center; padding: 1rem 0; }
.phone {
  width: min(19.5rem, 80vw); border-radius: 2.4rem; background: var(--ink);
  padding: 0.55rem; box-shadow: var(--shadow-lg);
  transform: rotate(2.5deg);
  transition: transform 0.4s ease;
}
.phone:hover { transform: rotate(0.5deg) translateY(-6px); }
.phone-screen { border-radius: 1.9rem; overflow: hidden; display: block; background: #FDF6EC; font-family: var(--body); }
.pm-hero {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem;
  padding: 2.1rem 1.3rem 1.5rem; color: #F9E8C9;
  background:
    radial-gradient(9rem 9rem at 15% 0%, rgb(217 164 65 / 0.35), transparent 55%),
    radial-gradient(11rem 11rem at 90% 15%, rgb(255 120 90 / 0.25), transparent 55%),
    linear-gradient(170deg, #A32626 0%, #7E1B1B 100%);
}
.pm-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.04em;
  background: rgb(0 0 0 / 0.28); padding: 0.24rem 0.7rem; border-radius: 9999px;
}
.pm-badge .dot { width: 0.45rem; height: 0.45rem; border-radius: 9999px; background: #6EE7A0; }
.pm-name { font-family: var(--display); font-size: 1.6rem; font-weight: 600; line-height: 1.1; color: #FFF6E3; }
.pm-tagline { font-size: 0.72rem; color: #F3D9A8; }
.pm-wa {
  display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.35rem;
  background: #D9A441; color: #4A1F1A; font-size: 0.72rem; font-weight: 800;
  padding: 0.45rem 1rem; border-radius: 9999px;
}
.pm-sec { padding: 1rem 1.3rem 1.4rem; color: #4A1F1A; }
.pm-kicker {
  display: block; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.14em;
  text-transform: uppercase; color: #8E1F1F; margin-bottom: 0.55rem;
}
.pm-item { display: flex; align-items: baseline; gap: 0.5rem; padding: 0.34rem 0; font-size: 0.78rem; }
.pm-item b { font-weight: 700; white-space: nowrap; }
.pm-item i { flex: 1; border-bottom: 2px dotted rgb(140 106 93 / 0.45); transform: translateY(-0.2rem); }
.pm-item em { font-style: normal; font-weight: 800; color: #8E1F1F; white-space: nowrap; }
.pm-promo {
  display: block; margin-top: 0.8rem; font-size: 0.68rem; font-weight: 700;
  background: linear-gradient(120deg, rgb(217 164 65 / 0.25), rgb(217 164 65 / 0.12));
  border: 1px solid rgb(217 164 65 / 0.5); color: #7E1B1B;
  padding: 0.5rem 0.8rem; border-radius: 0.7rem;
}
.float-chip {
  position: absolute; z-index: 2; background: var(--surface); border: 1px solid var(--border);
  border-radius: 1rem; box-shadow: var(--shadow-md);
  padding: 0.6rem 0.95rem; font-size: 0.82rem; font-weight: 700;
  display: inline-flex; align-items: center; gap: 0.45rem;
  animation: floaty 5s ease-in-out infinite;
}
.float-chip.a { top: 12%; left: 2%; animation-delay: 0s; }
.float-chip.b { bottom: 18%; right: 0%; animation-delay: 2.2s; }
.float-chip .dot { width: 0.55rem; height: 0.55rem; border-radius: 9999px; background: #22A05A; }
@keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }

.metric-band { background: var(--ink); color: #FAF5EC; }
.metric-band .wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 1.5rem; padding-top: 2.2rem; padding-bottom: 2.2rem; }
.metric { text-align: center; }
.metric .num { font-family: var(--display); font-size: clamp(1.7rem, 4vw, 2.4rem); font-weight: 650; color: var(--gold); display: block; line-height: 1.1; }
.metric .cap { font-size: 0.85rem; color: #C9C1B4; }

.kicker { color: var(--brand-deep); font-weight: 800; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.12em; }
.title-2 { font-family: var(--display); font-size: clamp(1.8rem, 5vw, 2.8rem); letter-spacing: -0.02em; line-height: 1.12; margin: 0.5rem 0 1rem; font-weight: 640; }
.sub { color: var(--muted); max-width: 36rem; }

.feature-grid { display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr)); margin-top: 2.5rem; }
.feature-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 1.4rem;
  padding: 1.6rem; box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.feature-icon {
  width: 3rem; height: 3rem; border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand) 14%, #fff), color-mix(in srgb, var(--gold) 22%, #fff));
  color: var(--brand-deep); margin-bottom: 1rem;
}
.feature-card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; letter-spacing: -0.01em; }
.feature-card p { color: var(--muted); font-size: 0.93rem; }

.steps { position: relative; margin-top: 2.5rem; display: grid; gap: 0; max-width: 38rem; }
.step { display: grid; grid-template-columns: 3rem 1fr; gap: 1.1rem; position: relative; padding-bottom: 2rem; }
.step:last-child { padding-bottom: 0; }
.step::before {
  content: ""; position: absolute; left: 1.45rem; top: 3rem; bottom: 0.4rem; width: 2px;
  background: linear-gradient(var(--border), transparent);
}
.step:last-child::before { display: none; }
.step-num {
  width: 3rem; height: 3rem; border-radius: 9999px; z-index: 1;
  background: var(--surface); border: 2px solid var(--brand);
  color: var(--brand-deep); font-weight: 800; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center; font-family: var(--display);
}
.step h3 { font-size: 1.1rem; padding-top: 0.6rem; }
.step p { color: var(--muted); font-size: 0.95rem; }

.theme-strip { display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); margin-top: 2.5rem; }
.theme-card {
  border-radius: 1.4rem; overflow: hidden; text-decoration: none;
  border: 1px solid var(--border); background: var(--surface); box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.theme-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.theme-swatch { height: 7.5rem; display: flex; align-items: flex-end; padding: 1rem; }
.theme-swatch .name { font-family: var(--display); font-size: 1.5rem; font-weight: 650; }
.theme-card .meta { padding: 1rem 1.2rem; color: var(--muted); font-size: 0.88rem; }
.theme-card .meta strong { display: block; color: var(--ink); font-size: 0.95rem; margin-bottom: 0.15rem; }

.pricing { display: grid; gap: 1.4rem; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); max-width: 48rem; margin: 2.5rem auto 0; align-items: stretch; }
.price-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 1.6rem;
  padding: 2.2rem 1.8rem; display: flex; flex-direction: column; box-shadow: var(--shadow-sm);
}
.price-card.featured {
  border: 2px solid var(--brand); box-shadow: var(--shadow-md); position: relative;
  background: linear-gradient(180deg, #FFF, #FFF9F3);
}
.price-card .tag {
  position: absolute; top: -0.85rem; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, var(--brand), var(--brand-hot)); color: #FFF;
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 0.28rem 1rem; border-radius: 9999px; white-space: nowrap;
}
.price-card .plan-name { font-weight: 800; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.price-card .amount { font-family: var(--display); font-size: 2.9rem; font-weight: 650; letter-spacing: -0.02em; margin-top: 0.4rem; line-height: 1; }
.price-card .amount .rp { font-size: 1.1rem; vertical-align: super; font-weight: 700; }
.price-card .per { color: var(--muted); font-size: 0.85rem; margin: 0.4rem 0 1.4rem; }
.price-list { list-style: none; padding: 0; margin: 0 0 1.8rem; flex: 1; }
.price-list li { display: flex; gap: 0.6rem; padding: 0.42rem 0; font-size: 0.93rem; align-items: flex-start; }
.price-list li svg { color: var(--brand); flex-shrink: 0; margin-top: 0.22rem; }

.faq { max-width: 44rem; }
.faq details {
  background: var(--surface); border: 1px solid var(--border); border-radius: 1.1rem;
  padding: 1.1rem 1.4rem; margin-bottom: 0.8rem; transition: box-shadow 0.2s ease;
}
.faq details[open] { box-shadow: var(--shadow-sm); }
.faq summary {
  font-weight: 700; cursor: pointer; list-style: none;
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
}
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: "+"; font-size: 1.4rem; color: var(--brand); transition: transform 0.2s ease; line-height: 1; }
.faq details[open] summary::after { transform: rotate(45deg); }
.faq p { color: var(--muted); margin-top: 0.6rem; font-size: 0.95rem; }

.cta-band {
  background: linear-gradient(135deg, var(--ink) 0%, #2C2420 100%);
  border-radius: 2rem; color: #FAF5EC; text-align: center;
  padding: clamp(3rem, 7vw, 4.5rem) 1.5rem; position: relative; overflow: hidden;
}
.cta-band::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(30rem 18rem at 78% -20%, color-mix(in srgb, var(--gold) 26%, transparent), transparent 65%);
}
.cta-band .title-2 { color: #FAF5EC; position: relative; }
.cta-band .sub { color: #C9C1B4; margin: 0 auto 1.8rem; position: relative; }
.cta-band .cta-row { justify-content: center; position: relative; margin-top: 0; }

.footer { padding: 3rem 0 3.5rem; color: var(--muted); font-size: 0.9rem; }
.footer .wrap { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: center; }
.footer a { color: var(--ink-soft); text-decoration: none; font-weight: 600; }
.footer a:hover { color: var(--brand-deep); }
.footer-brand { display: inline-flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.mitra-form { max-width: 26rem; margin-top: 2rem; display: grid; gap: 0.9rem; }
.mitra-form label { display: grid; gap: 0.3rem; font-weight: 700; font-size: 0.88rem; }
.mitra-form input {
  font: inherit; padding: 0.75rem 0.95rem; border-radius: 0.8rem;
  border: 1.5px solid var(--border); background: var(--surface); width: 100%;
}
.mitra-form input:focus { outline: 3px solid var(--gold); border-color: var(--brand); }
.mitra-form .hint { font-weight: 500; font-size: 0.78rem; color: var(--muted); }
.mitra-form .btn { justify-content: center; }

.reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .float-chip { animation: none; }
}

.prose-wrap { max-width: 46rem; margin: 0 auto; padding: clamp(2rem, 6vw, 4rem) 1.3rem 1rem; }
.prose-meta { font-size: 0.82rem; color: var(--muted); font-weight: 600; margin: 0 0 0.6rem; }
.prose-title { font-size: clamp(1.8rem, 5vw, 2.7rem); line-height: 1.15; margin: 0 0 1.3rem; letter-spacing: -0.02em; }
.prose { font-size: 1.05rem; line-height: 1.75; color: var(--ink); }
.prose h2 { font-size: 1.3rem; line-height: 1.3; margin: 2rem 0 0.7rem; letter-spacing: -0.01em; }
.prose p { margin: 0 0 1.05rem; }
.prose ul { margin: 0 0 1.2rem; padding-left: 1.2rem; }
.prose li { margin: 0 0 0.5rem; }
.blog-grid { display: grid; gap: 1.1rem; grid-template-columns: 1fr; }
@media (min-width: 40rem) { .blog-grid { grid-template-columns: 1fr 1fr; } }
.blog-card { display: block; text-decoration: none; color: inherit; background: var(--surface); border: 1px solid var(--border); border-radius: 1rem; padding: 1.3rem 1.4rem; transition: transform 0.2s ease, border-color 0.2s ease; }
.blog-card:hover { transform: translateY(-3px); border-color: var(--brand); }
.blog-card h3 { font-size: 1.12rem; line-height: 1.3; margin: 0 0 0.5rem; }
.blog-card p { font-size: 0.9rem; color: var(--muted); margin: 0 0 0.6rem; line-height: 1.55; }
.blog-card .meta { font-size: 0.78rem; color: var(--brand); font-weight: 700; }
.dir-grid { display: grid; gap: 0.9rem; grid-template-columns: 1fr; }
@media (min-width: 34rem) { .dir-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 52rem) { .dir-grid { grid-template-columns: 1fr 1fr 1fr; } }
.dir-card { display: flex; align-items: center; gap: 0.85rem; text-decoration: none; color: inherit; background: var(--surface); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem 1.15rem; transition: transform 0.2s ease, border-color 0.2s ease; }
.dir-card:hover { transform: translateY(-2px); border-color: var(--brand); }
.dir-card .dir-mono { width: 2.6rem; height: 2.6rem; flex-shrink: 0; border-radius: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; background: linear-gradient(135deg, var(--brand), var(--brand-hot)); color: #fff; }
.dir-card strong { display: block; font-size: 0.98rem; }
.dir-card span { font-size: 0.8rem; color: var(--muted); }
.dir-empty { text-align: center; color: var(--muted); padding: 2rem 0; }
`;

export const LANDING_REVEAL_SCRIPT = `(function(){if(!("IntersectionObserver" in window))return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:0.1});
document.querySelectorAll(".reveal").forEach(function(el){io.observe(el)})})();`;

export function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

const ICON_PATHS: Record<string, string> = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  chat: "M21 11.5a8.38 8.38 0 0 1-9 8.36 8.5 8.5 0 0 1-3.9-.94L3 20l1.08-4.1A8.5 8.5 0 1 1 21 11.5Z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  bolt: "M13 2 3 14h7l-1 8 11-13h-7l1-7Z",
  phone: "M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 17h4",
  palette: "M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-2 2c0 1 .5 1.5.5 2.5S13.5 21 12 21Z",
};

export function FeatureIcon(props: { name: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={ICON_PATHS[props.name] ?? ICON_PATHS.bolt}
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function LandingShell(props: {
  title: string;
  description: string;
  canonical: string;
  jsonLd: string;
  children: Child;
}) {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        <meta name="description" content={props.description} />
        <link rel="canonical" href={props.canonical} />
        <meta property="og:title" content={props.title} />
        <meta property="og:description" content={props.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={props.canonical} />
        <meta property="og:image" content="https://tokoweb.id/assets/logo-square.png" />
        <FaviconLinks />
        <style dangerouslySetInnerHTML={{ __html: LANDING_STYLES }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: props.jsonLd }} />
      </head>
      <body>
        {props.children}
        <script dangerouslySetInnerHTML={{ __html: LANDING_REVEAL_SCRIPT }} />
      </body>
    </html>
  );
}

export function TopBar(props: {
  ctaHref: string;
  ctaLabel: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <header class="topbar">
      <div class="wrap">
        <BrandLogo href="/" height={30} />
        {props.links ? (
          <nav class="topnav">
            {props.links.map((link) => (
              <a href={link.href}>{link.label}</a>
            ))}
          </nav>
        ) : null}
        <a
          class="btn btn-fill"
          href={props.ctaHref}
          style="padding:0.6rem 1.3rem; font-size:0.9rem;"
        >
          {props.ctaLabel}
        </a>
      </div>
    </header>
  );
}

export function PhoneMock(props: {
  name: string;
  tagline: string;
  items: { name: string; price: string }[];
  promo: string;
}) {
  return (
    <div class="phone">
      <div class="phone-screen">
        <div class="pm-hero">
          <span class="pm-badge">
            <span class="dot" />
            Buka sekarang
          </span>
          <span class="pm-name">{props.name}</span>
          <span class="pm-tagline">{props.tagline}</span>
          <span class="pm-wa">💬 Pesan via WhatsApp</span>
        </div>
        <div class="pm-sec">
          <span class="pm-kicker">Menu Andalan</span>
          {props.items.map((item) => (
            <span class="pm-item">
              <b>{item.name}</b>
              <i />
              <em>{item.price}</em>
            </span>
          ))}
          <span class="pm-promo">🔥 {props.promo}</span>
        </div>
      </div>
    </div>
  );
}

export function Hero(props: {
  eyebrow: string;
  headline: Child;
  lede: Child;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  trust: string[];
  mock: { name: string; tagline: string; items: { name: string; price: string }[]; promo: string };
  chipA: string;
  chipB: string;
}) {
  return (
    <section class="hero">
      <div class="hero-bg" />
      <div class="wrap hero-grid">
        <div>
          <span class="eyebrow">{props.eyebrow}</span>
          <h1 class="display">{props.headline}</h1>
          <p class="lede">{props.lede}</p>
          <div class="cta-row">
            <a class="btn btn-fill" href={props.primary.href}>
              {props.primary.label}
            </a>
            <a class="btn btn-line" href={props.secondary.href}>
              {props.secondary.label}
            </a>
          </div>
          <div class="trust-row">
            {props.trust.map((item) => (
              <span class="trust-item">
                <CheckIcon />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div class="phone-stage">
          <span class="float-chip a">
            <span class="dot" />
            {props.chipA}
          </span>
          <PhoneMock
            name={props.mock.name}
            tagline={props.mock.tagline}
            items={props.mock.items}
            promo={props.mock.promo}
          />
          <span class="float-chip b">📊 {props.chipB}</span>
        </div>
      </div>
    </section>
  );
}

export function CtaRow(props: { links: { href: string; label: string; fill?: boolean }[] }) {
  return (
    <div class="cta-row">
      {props.links.map((link) => (
        <a class={link.fill ? "btn btn-fill" : "btn btn-line"} href={link.href}>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function MitraForm(props: { action: string; siteKey?: string }) {
  return (
    <form class="mitra-form" method="post" action={props.action}>
      <label>
        Nama lengkap
        <input name="name" required maxlength={60} />
      </label>
      <label>
        No WhatsApp
        <input name="wa_number" inputmode="tel" placeholder="62812…" required />
        <span class="hint">Format 62xxxxxxxxxx — kami hubungi ke nomor ini.</span>
      </label>
      <label>
        PIN 6 digit
        <input name="pin" inputmode="numeric" type="password" maxlength={6} required />
        <span class="hint">Untuk membuka halaman komisimu nanti. Jangan lupa!</span>
      </label>
      <TurnstileWidget siteKey={props.siteKey} />
      <button class="btn btn-fill" type="submit">
        Daftar Jadi Mitra →
      </button>
    </form>
  );
}

export function MetricBand(props: { metrics: { num: string; cap: string }[] }) {
  return (
    <div class="metric-band">
      <div class="wrap">
        {props.metrics.map((metric) => (
          <div class="metric">
            <span class="num">{metric.num}</span>
            <span class="cap">{metric.cap}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader(props: { kicker: string; title: Child; sub?: Child }) {
  return (
    <>
      <span class="kicker">{props.kicker}</span>
      <h2 class="title-2">{props.title}</h2>
      {props.sub ? <p class="sub">{props.sub}</p> : null}
    </>
  );
}

export function LandingSection(props: { children: Child; alt?: boolean; id?: string }) {
  return (
    <section class={props.alt ? "section section-alt" : "section"} id={props.id}>
      <div class="wrap">{props.children}</div>
    </section>
  );
}

export function FeatureGrid(props: { features: { icon: string; title: string; body: string }[] }) {
  return (
    <div class="feature-grid">
      {props.features.map((feature) => (
        <div class="feature-card reveal">
          <div class="feature-icon">
            <FeatureIcon name={feature.icon} />
          </div>
          <h3>{feature.title}</h3>
          <p>{feature.body}</p>
        </div>
      ))}
    </div>
  );
}

export function StepList(props: { steps: { title: string; body: string }[] }) {
  return (
    <div class="steps">
      {props.steps.map((step, index) => (
        <div class="step reveal">
          <span class="step-num">{index + 1}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThemeStrip(props: {
  themes: {
    slug: string;
    name: string;
    character: string;
    gradient: string;
    textColor: string;
    demoUrl: string;
  }[];
}) {
  return (
    <div class="theme-strip">
      {props.themes.map((theme) => (
        <a class="theme-card reveal" href={theme.demoUrl}>
          <div
            class="theme-swatch"
            style={`background:${theme.gradient}; color:${theme.textColor};`}
          >
            <span class="name">{theme.name}</span>
          </div>
          <div class="meta">
            <strong>Tema {theme.name}</strong>
            {theme.character}
          </div>
        </a>
      ))}
    </div>
  );
}

export function PriceCard(props: {
  plan: string;
  amount: string;
  per: string;
  items: string[];
  cta: { href: string; label: string };
  featured?: boolean;
  tag?: string;
}) {
  return (
    <div class={props.featured ? "price-card featured" : "price-card"}>
      {props.tag ? <span class="tag">{props.tag}</span> : null}
      <span class="plan-name">{props.plan}</span>
      <p class="amount">
        <span class="rp">Rp</span> {props.amount}
      </p>
      <p class="per">{props.per}</p>
      <ul class="price-list">
        {props.items.map((item) => (
          <li>
            <CheckIcon />
            {item}
          </li>
        ))}
      </ul>
      <a
        class={props.featured ? "btn btn-fill" : "btn btn-line"}
        href={props.cta.href}
        style="justify-content:center;"
      >
        {props.cta.label}
      </a>
    </div>
  );
}

export function PricingGrid(props: { children: Child }) {
  return <div class="pricing">{props.children}</div>;
}

export function FaqList(props: { items: { q: string; a: string }[] }) {
  return (
    <div class="faq">
      {props.items.map((item) => (
        <details>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand(props: {
  title: Child;
  sub: Child;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <div class="wrap">
      <div class="cta-band reveal">
        <h2 class="title-2">{props.title}</h2>
        <p class="sub">{props.sub}</p>
        <div class="cta-row">
          <a class="btn btn-fill" href={props.primary.href}>
            {props.primary.label}
          </a>
          {props.secondary ? (
            <a
              class="btn btn-line"
              href={props.secondary.href}
              style="background:transparent; color:#FAF5EC; border-color:#57504A;"
            >
              {props.secondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LandingFooter(props: { links: { href: string; label: string }[] }) {
  return (
    <footer class="footer">
      <div class="wrap">
        <span class="footer-brand">
          <BrandLogo href="/" height={22} />
          <span>— website kilat untuk UMKM Indonesia</span>
        </span>
        <span>
          {props.links.map((link, index) => (
            <>
              {index > 0 ? " · " : ""}
              <a href={link.href}>{link.label}</a>
            </>
          ))}
        </span>
      </div>
    </footer>
  );
}

export function ArticleBody(props: { blocks: BlogBlock[] }) {
  const out: Child[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul>
          {list.map((text) => (
            <li>{text}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const block of props.blocks) {
    if (block.type === "li") {
      list.push(block.text);
      continue;
    }
    flush();
    if (block.type === "h2") out.push(<h2>{block.text}</h2>);
    else out.push(<p>{block.text}</p>);
  }
  flush();
  return <div class="prose">{out}</div>;
}

export function ArticleHeader(props: { title: string; meta: string }) {
  return (
    <>
      <p class="prose-meta">{props.meta}</p>
      <h1 class="prose-title">{props.title}</h1>
    </>
  );
}

export function BlogGrid(props: {
  items: { href: string; title: string; description: string; meta: string }[];
}) {
  return (
    <div class="blog-grid">
      {props.items.map((item) => (
        <a class="blog-card reveal" href={item.href}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <span class="meta">{item.meta} →</span>
        </a>
      ))}
    </div>
  );
}

export function DirectoryGrid(props: {
  items: { href: string; name: string; vertical: string; initial: string }[];
}) {
  if (props.items.length === 0) {
    return <p class="dir-empty">Belum ada toko yang tampil. Jadilah yang pertama! 🎉</p>;
  }
  return (
    <div class="dir-grid">
      {props.items.map((item) => (
        <a class="dir-card reveal" href={item.href}>
          <span class="dir-mono" aria-hidden="true">
            {item.initial}
          </span>
          <span>
            <strong>{item.name}</strong>
            <span>{item.vertical}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
