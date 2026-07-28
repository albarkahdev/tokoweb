export const APP_STYLES = `
:root {
  --bg: #F7F5F2;
  --surface: #FFFFFF;
  --text: #23201C;
  --muted: #6E675F;
  --primary: #C4501B;
  --primary-contrast: #FFFFFF;
  --border: #E5E0D8;
  --danger: #B3261E;
  --success: #2E7D32;
  --warning: #9A6700;
  --radius: 0.75rem;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
main.app-main { max-width: 40rem; margin: 0 auto; padding: 1rem 1rem 5rem; }
header.app-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
header.app-header strong { font-size: 1rem; }
nav.app-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  overflow-x: auto;
  z-index: 10;
}
nav.app-nav a {
  flex: 1 0 auto;
  text-align: center;
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  color: var(--muted);
  text-decoration: none;
  white-space: nowrap;
}
nav.app-nav a[aria-current="page"] { color: var(--primary); font-weight: 600; }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  margin: 0 0 1rem;
}
.card h1, .card h2, .card h3 { margin-top: 0; }
h1 { font-size: 1.35rem; } h2 { font-size: 1.15rem; } h3 { font-size: 1rem; }
.field { display: block; margin-bottom: 0.9rem; }
.field > span { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.3rem; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font: inherit;
  background: var(--surface);
  color: var(--text);
}
.field input:focus, .field textarea:focus, .field select:focus {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.field .hint { font-size: 0.78rem; color: var(--muted); margin-top: 0.25rem; }
.btn {
  display: inline-block;
  padding: 0.65rem 1.1rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: var(--primary);
  color: var(--primary-contrast);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}
.btn.secondary { background: var(--surface); color: var(--text); border-color: var(--border); }
.btn.danger { background: var(--danger); }
.btn.block { display: block; width: 100%; }
.btn:focus-visible { outline: 2px solid var(--text); outline-offset: 2px; }
.badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--border);
}
.badge.success { background: #E2F1E3; color: var(--success); }
.badge.warning { background: #FBF0DA; color: var(--warning); }
.badge.danger { background: #F9E2E0; color: var(--danger); }
.badge.muted { background: var(--border); color: var(--muted); }
.alert {
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin: 0 0 1rem;
  font-size: 0.9rem;
  border: 1px solid;
}
.alert.warning { background: #FBF0DA; border-color: #E8D3A0; color: var(--warning); }
.alert.danger { background: #F9E2E0; border-color: #ECB7B3; color: var(--danger); }
.alert.success { background: #E2F1E3; border-color: #B9DCBB; color: var(--success); }
table.list { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
table.list th, table.list td {
  text-align: left;
  padding: 0.5rem 0.4rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
table.list th { font-size: 0.78rem; color: var(--muted); }
.stat-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.stat-row .stat {
  flex: 1 1 8rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem;
}
.stat .num { font-size: 1.5rem; font-weight: 700; display: block; }
.stat .label { font-size: 0.78rem; color: var(--muted); }
.muted { color: var(--muted); }
.small { font-size: 0.85rem; }
.mb-0 { margin-bottom: 0; }
.row-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
`;
