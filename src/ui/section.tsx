import type { Child } from "hono/jsx";

export function Section(props: { id?: string; children: Child }) {
  return <section id={props.id}>{props.children}</section>;
}
