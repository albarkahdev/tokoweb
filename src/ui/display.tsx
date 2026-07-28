import type { Child } from "hono/jsx";

export function Card(props: { children: Child }) {
  return <div class="card">{props.children}</div>;
}

export function Badge(props: {
  children: Child;
  tone?: "success" | "warning" | "danger" | "muted";
}) {
  return <span class={`badge ${props.tone ?? "muted"}`}>{props.children}</span>;
}

export function Alert(props: { children: Child; tone: "success" | "warning" | "danger" }) {
  return <div class={`alert ${props.tone}`}>{props.children}</div>;
}

export function ListTable(props: { headers: string[]; children: Child }) {
  return (
    <table class="list">
      <thead>
        <tr>
          {props.headers.map((header) => (
            <th>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{props.children}</tbody>
    </table>
  );
}

export function StatTile(props: { value: string; label: string }) {
  return (
    <div class="stat">
      <span class="num">{props.value}</span>
      <span class="label">{props.label}</span>
    </div>
  );
}

export function StatRow(props: { children: Child }) {
  return <div class="stat-row">{props.children}</div>;
}
