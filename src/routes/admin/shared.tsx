import type { Child } from "hono/jsx";
import { AppLayout, type NavItem } from "@/ui/app-layout";
import { Alert } from "@/ui/display";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/tenant", label: "Tenant" },
  { href: "/admin/lead", label: "Lead" },
  { href: "/admin/intake", label: "Intake" },
  { href: "/admin/referrer", label: "Ojol" },
  { href: "/admin/payout", label: "Payout" },
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
      heading="Admin tokoweb"
      nav={ADMIN_NAV}
      currentPath={props.currentPath}
      headerAction={
        <form method="post" action="/keluar">
          <button class="btn secondary" type="submit">
            Keluar
          </button>
        </form>
      }
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
