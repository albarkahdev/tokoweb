import { FONTS_CSS } from "@/ui/fonts-css";

export const APP_STYLES = `
${FONTS_CSS}
:root {
  --bg: #F6F2EA;
  --surface: #FFFFFF;
  --surface-soft: #FDFBF7;
  --text: #1C1917;
  --muted: #78716C;
  --primary: #C4501B;
  --primary-hot: #E8632C;
  --primary-contrast: #FFFFFF;
  --gold: #E8A03C;
  --border: #E7E0D2;
  --danger: #B3261E;
  --success: #2E7D32;
  --warning: #9A6700;
  --radius: 1.1rem;
  --display: 'Bricolage Grotesque', system-ui, sans-serif;
  --body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --shadow-card: 0 1px 2px rgba(28, 25, 23, 0.04), 0 10px 30px -22px rgba(28, 25, 23, 0.3);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--body);
  background:
    radial-gradient(38rem 38rem at 110% -6%, rgba(232, 160, 60, 0.09), transparent 60%),
    radial-gradient(30rem 30rem at -12% 30%, rgba(196, 80, 27, 0.05), transparent 55%),
    var(--bg);
  background-attachment: fixed;
  color: var(--text);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
main.app-main { max-width: 42rem; margin: 0 auto; padding: 1.25rem 1rem 6.5rem; }
main.app-main.centered {
  min-height: calc(100dvh - 4rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 3rem;
}
header.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0.7rem 1rem;
}
.header-inner {
  max-width: 42rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
  text-decoration: none;
  letter-spacing: -0.01em;
}
.brand-mark .dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-hot));
  box-shadow: 0 0 0 3px rgba(196, 80, 27, 0.15);
}
.header-title {
  font-family: var(--display);
  font-weight: 650;
  font-size: 1rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
}
.header-side { min-width: 4.5rem; display: flex; justify-content: flex-end; }
.header-side.lead { justify-content: flex-start; }
.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-logout:hover { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 35%, var(--border)); }
nav.app-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--border);
  padding: 0.35rem 0.25rem calc(0.35rem + env(safe-area-inset-bottom));
}
.nav-inner {
  max-width: 42rem;
  margin: 0 auto;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-inner::-webkit-scrollbar { display: none; }
nav.app-nav a {
  flex: 1 0 auto;
  min-width: 3.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.8rem;
  font-size: 0.66rem;
  font-weight: 600;
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
}
nav.app-nav a svg { width: 1.3rem; height: 1.3rem; }
nav.app-nav a[aria-current="page"] {
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 9%, transparent);
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin: 0 0 1rem;
  box-shadow: var(--shadow-card);
}
h1, h2, h3 { font-family: var(--display); letter-spacing: -0.015em; line-height: 1.25; }
.card h1, .card h2, .card h3 { margin-top: 0; }
h1 { font-size: 1.45rem; margin: 0 0 0.75rem; }
h2 { font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
h3 { font-size: 0.98rem; margin: 1.25rem 0 0.6rem; }
.field { display: block; margin-bottom: 1rem; }
.field > span { display: block; font-size: 0.83rem; font-weight: 650; margin-bottom: 0.35rem; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  font: inherit;
  background: var(--surface-soft);
  color: var(--text);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field textarea:focus, .field select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(196, 80, 27, 0.16);
  background: var(--surface);
}
.field .hint { font-size: 0.76rem; color: var(--muted); margin-top: 0.3rem; }
.field.checkbox { display: flex; align-items: center; gap: 0.5rem; }
.field.checkbox input { width: 1.1rem; height: 1.1rem; accent-color: var(--primary); }
.field.checkbox > span { margin: 0; font-weight: 500; font-size: 0.9rem; }
.time-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.time-row .day { flex: 0 0 4.2rem; font-size: 0.83rem; font-weight: 650; }
.time-row input[type="time"] {
  width: auto;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  font: inherit;
  font-size: 0.85rem;
  background: var(--surface-soft);
}
.time-row .toggle { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: var(--muted); }
.time-row .toggle input { accent-color: var(--primary); }
.pair-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.pair-row input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.7rem;
  font: inherit;
  font-size: 0.9rem;
  background: var(--surface-soft);
  min-width: 0;
}
.pair-row input:first-child { flex: 2; }
.pair-row input:last-child { flex: 1; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: linear-gradient(120deg, var(--primary), var(--primary-hot));
  color: var(--primary-contrast);
  font: inherit;
  font-size: 0.92rem;
  font-weight: 650;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  position: relative;
  box-shadow: 0 6px 16px -8px rgba(196, 80, 27, 0.5);
  transition: transform 0.1s, box-shadow 0.15s;
}
.btn:active { transform: translateY(1px); }
.btn.secondary {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
  box-shadow: none;
}
.btn.secondary:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
.btn.danger { background: var(--surface); color: var(--danger); border-color: color-mix(in srgb, var(--danger) 30%, var(--border)); box-shadow: none; }
.btn.block { display: flex; width: 100%; }
.btn:focus-visible { outline: 2px solid var(--text); outline-offset: 2px; }
.btn.loading { color: transparent; pointer-events: none; }
.btn.loading::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 1.05rem;
  height: 1.05rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #FFF;
  border-radius: 50%;
  animation: btn-spin 0.7s linear infinite;
}
.btn.secondary.loading::after, .btn.danger.loading::after {
  border-color: rgba(28, 25, 23, 0.18);
  border-top-color: var(--text);
}
@keyframes btn-spin { to { transform: rotate(360deg); } }
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.6rem;
  border-radius: 9999px;
  font-family: var(--body);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  background: var(--border);
  vertical-align: middle;
}
.badge.success { background: #E3F1E4; color: var(--success); }
.badge.warning { background: #FBF0DA; color: var(--warning); }
.badge.danger { background: #F9E2E0; color: var(--danger); }
.badge.muted { background: #EEE9DF; color: var(--muted); }
.alert {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  border-radius: 0.9rem;
  padding: 0.8rem 1rem;
  margin: 0 0 1rem;
  font-size: 0.88rem;
  font-weight: 500;
  border: 1px solid;
  box-shadow: var(--shadow-card);
}
.alert::before { font-size: 1rem; line-height: 1.4; }
.alert.warning { background: #FDF6E7; border-color: #EBD9AC; color: var(--warning); }
.alert.warning::before { content: "⚠️"; }
.alert.danger { background: #FBEAE8; border-color: #EEC2BE; color: var(--danger); }
.alert.danger::before { content: "✕"; font-weight: 800; }
.alert.success { background: #EAF4EB; border-color: #C4DFC6; color: var(--success); }
.alert.success::before { content: "✓"; font-weight: 800; }
table.list { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
table.list th, table.list td {
  text-align: left;
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
table.list tr:last-child td { border-bottom: none; }
table.list th {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.stat-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin: 0 0 1rem; }
.stat-row .stat {
  flex: 1 1 8rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.9rem 1rem;
  box-shadow: var(--shadow-card);
}
.stat .num {
  font-family: var(--display);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: block;
  line-height: 1.15;
  background: linear-gradient(120deg, var(--primary), var(--primary-hot));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat .label { font-size: 0.76rem; font-weight: 600; color: var(--muted); }
.data-list { margin: 0; }
.data-list .pair {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.45rem 0;
  border-bottom: 1px dashed var(--border);
  font-size: 0.9rem;
}
.data-list .pair:last-child { border-bottom: none; }
.data-list .pair > :first-child { color: var(--muted); font-size: 0.83rem; flex-shrink: 0; }
.data-list .pair > :last-child { font-weight: 650; text-align: right; overflow-wrap: anywhere; }
.empty {
  border: 1.5px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.75rem 1rem;
  text-align: center;
  margin: 0 0 0.5rem;
}
.empty .icon { font-size: 1.8rem; display: block; margin-bottom: 0.4rem; }
.empty .t { font-family: var(--display); font-weight: 650; margin: 0 0 0.2rem; }
.empty .h { font-size: 0.83rem; color: var(--muted); margin: 0; }
.copy-area, pre.code {
  width: 100%;
  font-size: 0.8rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  color: var(--text);
}
pre.code { white-space: pre-wrap; overflow-x: auto; margin: 0 0 1rem; }
.media-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.media-row img { object-fit: cover; border-radius: 0.7rem; border: 1px solid var(--border); }
.media-row .cap { flex: 1; font-size: 0.85rem; }
.insight {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  padding: 0.7rem 0.9rem;
  margin: 0 0 0.6rem;
  font-size: 0.9rem;
}
.insight::before { content: "💡"; }
.muted { color: var(--muted); }
.small { font-size: 0.84rem; }
.mb-0 { margin-bottom: 0; }
.row-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-top: 0.5rem; }
a { color: var(--primary); }
.qr-figure { margin: 0.5rem 0 0; text-align: center; }
.qr-figure img {
  border: 1px solid var(--border); border-radius: 0.9rem; padding: 0.6rem;
  background: #FFFFFF; max-width: 100%; height: auto;
}
.qr-figure figcaption { margin-top: 0.4rem; font-weight: 600; }
.auth-brand { text-align: center; margin: 0 0 1.5rem; }
.auth-brand .brand-mark { font-size: 1.6rem; justify-content: center; }
.auth-brand p { margin: 0.35rem 0 0; color: var(--muted); font-size: 0.88rem; }
`;
