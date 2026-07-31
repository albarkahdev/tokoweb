import type { Child } from "hono/jsx";
import { BrandLogo, FaviconLinks } from "@/ui/brand";

export type NavIcon =
  | "home"
  | "info"
  | "menu"
  | "tag"
  | "image"
  | "chat"
  | "chart"
  | "gauge"
  | "store"
  | "lead"
  | "inbox"
  | "bike"
  | "cash"
  | "help";

export type NavItem = { href: string; label: string; icon: NavIcon };

const ICON_PATHS: Record<NavIcon, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v.5m0 3v5",
  menu: "M4 6h16M4 12h16M4 18h10",
  tag: "M3 3h8l10 10-8 8L3 11V3Zm5 5h.01",
  image: "M4 5h16v14H4V5Zm0 10 5-5 4 4 3-3 4 4M9 9h.01",
  chat: "M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  gauge: "M12 20a8 8 0 1 1 8-8m-8 8a8 8 0 0 1-8-8m8 8 4-9",
  store: "M4 9 5.5 4h13L20 9M4 9v11h16V9M4 9h16m-10 11v-6h4v6",
  lead: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9a6 6 0 0 1 12 0m3-12v6m3-3h-6",
  inbox: "M4 4h16v16H4V4Zm0 10h5a3 3 0 0 0 6 0h5",
  bike: "M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-14-3 3-7h4l4 7m-4-7h3m-3 0-2 3",
  cash: "M3 7h18v10H3V7Zm9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 7v0m12 10v0",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.2-11.2a2.2 2.2 0 1 1 3.2 2q-1 .8-1 1.7M12 17v.5",
};

function NavGlyph(props: { icon: NavIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[props.icon]} />
    </svg>
  );
}

export function BrandMark() {
  return <BrandLogo className="brand-mark" height={26} />;
}

function LogoutButton() {
  return (
    <form method="post" action="/keluar">
      <button class="btn-logout" type="submit">
        Keluar
      </button>
    </form>
  );
}

export function AuthBrand(props: { tagline: string }) {
  return (
    <div class="auth-brand">
      <BrandLogo className="brand-mark" height={40} />
      <p>{props.tagline}</p>
    </div>
  );
}

export function AppLayout(props: {
  title: string;
  heading?: string;
  nav?: NavItem[];
  currentPath?: string;
  logout?: boolean;
  centered?: boolean;
  children: Child;
}) {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{props.title}</title>
        <FaviconLinks />
        <link rel="stylesheet" href="/assets/app.css" />
      </head>
      <body>
        <header class="app-header">
          <div class="header-inner">
            <span class="header-side lead">
              <BrandMark />
            </span>
            <span class="header-title">{props.heading ?? ""}</span>
            <span class="header-side">{props.logout ? <LogoutButton /> : null}</span>
          </div>
        </header>
        <main class={`app-main${props.centered ? " centered" : ""}`}>{props.children}</main>
        {props.nav ? (
          <nav class="app-nav">
            <div class="nav-inner">
              {props.nav.map((item) => (
                <a
                  href={item.href}
                  aria-current={props.currentPath === item.href ? "page" : undefined}
                >
                  <NavGlyph icon={item.icon} />
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        ) : null}
        <script src="/assets/app.js" defer />
      </body>
    </html>
  );
}
