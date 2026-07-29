import type { Child } from "hono/jsx";
import { AppLayout, type NavItem } from "@/ui/app-layout";
import { Alert } from "@/ui/display";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: "gauge" },
  { href: "/admin/tenant", label: "Tenant", icon: "store" },
  { href: "/admin/lead", label: "Lead", icon: "lead" },
  { href: "/admin/intake", label: "Intake", icon: "inbox" },
  { href: "/admin/referrer", label: "Ojol", icon: "bike" },
  { href: "/admin/payout", label: "Payout", icon: "cash" },
];

export function AdminPage(props: {
  title: string;
  currentPath: string;
  notice?: string;
  error?: string;
  children: Child;
}) {
  return (
    <AppLayout
      title={`${props.title} — Admin tokoweb`}
      heading="Admin"
      nav={ADMIN_NAV}
      currentPath={props.currentPath}
      logout
    >
      {props.notice ? <Alert tone="success">{props.notice}</Alert> : null}
      {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
      {props.children}
    </AppLayout>
  );
}

export function adminHtml(node: unknown): string {
  return `<!doctype html>${String(node)}`;
}
