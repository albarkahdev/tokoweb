import type { Child } from "hono/jsx";

export function Card(props: { children: Child; filterText?: string }) {
  return (
    <div class="card" data-filter-text={props.filterText}>
      {props.children}
    </div>
  );
}

export function QrImage(props: { data: string; caption: string }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(props.data)}`;
  return (
    <figure class="qr-figure">
      <img src={src} alt={`QR ${props.data}`} width="240" height="240" loading="lazy" />
      <figcaption class="small muted">{props.caption}</figcaption>
    </figure>
  );
}

export function PageTitle(props: { children: Child }) {
  return <h1>{props.children}</h1>;
}

export function CardTitle(props: { children: Child }) {
  return <h2>{props.children}</h2>;
}

export function SubTitle(props: { children: Child }) {
  return <h3>{props.children}</h3>;
}

export function Text(props: { children: Child; muted?: boolean; small?: boolean; last?: boolean }) {
  const classes = [props.small ? "small" : "", props.muted ? "muted" : "", props.last ? "mb-0" : ""]
    .filter(Boolean)
    .join(" ");
  return <p class={classes || undefined}>{props.children}</p>;
}

export function Strong(props: { children: Child }) {
  return <strong>{props.children}</strong>;
}

export function TextLink(props: { href: string; children: Child; external?: boolean }) {
  return (
    <a
      href={props.href}
      target={props.external ? "_blank" : undefined}
      rel={props.external ? "noopener" : undefined}
    >
      {props.children}
    </a>
  );
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

export function Row(props: { children: Child }) {
  return <tr>{props.children}</tr>;
}

export function Cell(props: { children?: Child; small?: boolean }) {
  return <td class={props.small ? "small" : undefined}>{props.children}</td>;
}

export function CellStack(props: { top: Child; bottom?: Child }) {
  return (
    <td>
      {props.top}
      {props.bottom ? <div class="small muted">{props.bottom}</div> : null}
    </td>
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

export function DataList(props: { rows: { label: string; value: Child }[] }) {
  return (
    <div class="data-list">
      {props.rows.map((row) => (
        <div class="pair">
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function EmptyState(props: { icon: string; title: string; hint?: string }) {
  return (
    <div class="empty">
      <span class="icon">{props.icon}</span>
      <p class="t">{props.title}</p>
      {props.hint ? <p class="h">{props.hint}</p> : null}
    </div>
  );
}

export function Insight(props: { children: Child }) {
  return <div class="insight">{props.children}</div>;
}

export function CopyArea(props: { text: string; rows?: number }) {
  return (
    <textarea class="copy-area" rows={props.rows ?? 8} onclick="this.select()" readonly>
      {props.text}
    </textarea>
  );
}

export function CodeBlock(props: { text: string }) {
  return <pre class="code">{props.text}</pre>;
}

export function MediaRow(props: { src: string; alt: string; children?: Child }) {
  return (
    <div class="media-row">
      <img src={props.src} alt={props.alt} width="72" height="72" loading="lazy" />
      <span class="cap">{props.alt}</span>
      {props.children}
    </div>
  );
}

export function Actions(props: { children: Child }) {
  return <div class="row-actions">{props.children}</div>;
}
