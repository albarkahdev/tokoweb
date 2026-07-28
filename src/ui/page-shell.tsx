import type { Child } from "hono/jsx";

export function PageShell(props: { title: string; description?: string; children: Child }) {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        {props.description ? <meta name="description" content={props.description} /> : null}
      </head>
      <body>{props.children}</body>
    </html>
  );
}
