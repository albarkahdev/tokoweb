import type { Child } from "hono/jsx";

export function CtaLink(props: { href: string; children: Child }) {
  return <a href={props.href}>{props.children}</a>;
}
