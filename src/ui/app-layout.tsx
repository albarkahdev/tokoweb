import type { Child } from "hono/jsx";

export type NavItem = { href: string; label: string };

export function AppLayout(props: {
  title: string;
  heading?: string;
  nav?: NavItem[];
  currentPath?: string;
  headerAction?: Child;
  children: Child;
}) {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{props.title}</title>
        <link rel="stylesheet" href="/assets/app.css" />
      </head>
      <body>
        <header class="app-header">
          <strong>{props.heading ?? props.title}</strong>
          {props.headerAction}
        </header>
        <main class="app-main">{props.children}</main>
        {props.nav ? (
          <nav class="app-nav">
            {props.nav.map((item) => (
              <a
                href={item.href}
                aria-current={props.currentPath === item.href ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </body>
    </html>
  );
}
