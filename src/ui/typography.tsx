import type { Child } from "hono/jsx";

export function Heading(props: { level: 1 | 2 | 3; children: Child }) {
  if (props.level === 1) return <h1>{props.children}</h1>;
  if (props.level === 2) return <h2>{props.children}</h2>;
  return <h3>{props.children}</h3>;
}

export function Text(props: { children: Child }) {
  return <p>{props.children}</p>;
}
