import type { Child } from "hono/jsx";

export const LANDING_STYLES = `
:root {
  --ink: #1D1A16;
  --paper: #FFFBF5;
  --brand: #C4501B;
  --brand-dark: #9C3E13;
  --accent: #E8A03C;
  --muted: #6E675F;
  --surface: #FFFFFF;
  --border: #EBE4D9;
}
* { box-sizing: border-box; margin: 0; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
main { display: block; }
section { padding: clamp(3.5rem, 9vw, 6rem) 1.25rem; max-width: 68rem; margin: 0 auto; }
h1 { font-size: clamp(2.1rem, 8vw, 3.8rem); line-height: 1.1; letter-spacing: -0.02em; }
h2 { font-size: clamp(1.5rem, 5vw, 2.3rem); line-height: 1.2; margin-bottom: 1.25rem; }
h3 { font-size: 1.1rem; }
.lead { font-size: clamp(1.05rem, 3.5vw, 1.3rem); color: var(--muted); max-width: 34rem; }
.hero { text-align: center; padding-top: clamp(4rem, 12vw, 7rem); }
.hero .lead { margin: 1.25rem auto 2rem; }
.hero .eyebrow {
  display: inline-block; background: #FBF0DA; color: var(--brand-dark);
  padding: 0.3rem 1rem; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;
  margin-bottom: 1.25rem;
}
.cta-row { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
.btn-primary {
  display: inline-block; background: var(--brand); color: #fff; text-decoration: none;
  padding: 0.95rem 2rem; border-radius: 9999px; font-weight: 700; font-size: 1.05rem;
}
.btn-primary:hover { background: var(--brand-dark); }
.btn-outline {
  display: inline-block; border: 2px solid var(--brand); color: var(--brand-dark);
  text-decoration: none; padding: 0.85rem 1.9rem; border-radius: 9999px; font-weight: 700;
}
.trust { margin-top: 1.5rem; font-size: 0.9rem; color: var(--muted); }
.grid { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
.feature {
  background: var(--surface); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem;
}
.feature .emoji { font-size: 1.8rem; display: block; margin-bottom: 0.5rem; }
.feature p { color: var(--muted); font-size: 0.95rem; }
.steps { counter-reset: step; }
.step { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-start; }
.step .num {
  counter-increment: step; background: var(--brand); color: #fff; font-weight: 800;
  width: 2.2rem; height: 2.2rem; border-radius: 9999px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.step p { color: var(--muted); font-size: 0.95rem; }
.pricing { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); max-width: 46rem; margin: 0 auto; }
.price-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 1.25rem;
  padding: 2rem 1.5rem; text-align: center;
}
.price-card.featured { border: 2px solid var(--brand); position: relative; }
.price-card .tag {
  position: absolute; top: -0.8rem; left: 50%; transform: translateX(-50%);
  background: var(--brand); color: #fff; font-size: 0.75rem; font-weight: 700;
  padding: 0.2rem 0.9rem; border-radius: 9999px; white-space: nowrap;
}
.price-card .amount { font-size: 2.2rem; font-weight: 800; margin: 0.5rem 0 0; }
.price-card .per { color: var(--muted); font-size: 0.85rem; margin-bottom: 1rem; }
.price-card ul { list-style: none; padding: 0; text-align: left; margin: 1rem 0 1.5rem; }
.price-card li { padding: 0.35rem 0; font-size: 0.92rem; }
.price-card li::before { content: "✓ "; color: var(--brand); font-weight: 700; }
.faq details {
  background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;
  padding: 1rem 1.25rem; margin-bottom: 0.75rem;
}
.faq summary { font-weight: 700; cursor: pointer; }
.faq p { color: var(--muted); margin-top: 0.5rem; font-size: 0.95rem; }
footer { text-align: center; padding: 2.5rem 1.25rem 3rem; color: var(--muted); font-size: 0.9rem; border-top: 1px solid var(--border); }
.section-alt { background: var(--surface); max-width: none; }
.section-alt > div { max-width: 68rem; margin: 0 auto; }
`;

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
        <style dangerouslySetInnerHTML={{ __html: LANDING_STYLES }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: props.jsonLd }} />
      </head>
      <body>{props.children}</body>
    </html>
  );
}

export function Feature(props: { emoji: string; title: string; children: Child }) {
  return (
    <div class="feature">
      <span class="emoji">{props.emoji}</span>
      <h3>{props.title}</h3>
      <p>{props.children}</p>
    </div>
  );
}

export function Step(props: { title: string; children: Child }) {
  return (
    <div class="step">
      <span class="num" />
      <div>
        <h3>{props.title}</h3>
        <p>{props.children}</p>
      </div>
    </div>
  );
}
