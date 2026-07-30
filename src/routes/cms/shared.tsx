import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { Child } from "hono/jsx";
import { invalidateTenantCache } from "@/db/edge-cache";
import { getSubscription, type SubscriptionRow } from "@/db/subscriptions";
import { findTenantById, type TenantRow, tenantHostnames } from "@/db/tenants";
import type { AppEnv } from "@/env";
import { PUBLIC_PAGE_PATHS } from "@/themes/engine/types";
import { AppLayout, type NavItem } from "@/ui/app-layout";
import { Alert, TextLink } from "@/ui/display";

export const CMS_NAV: NavItem[] = [
  { href: "/", label: "Beranda", icon: "home" },
  { href: "/info", label: "Info", icon: "info" },
  { href: "/menu", label: "Menu", icon: "menu" },
  { href: "/promo", label: "Promo", icon: "tag" },
  { href: "/galeri", label: "Galeri", icon: "image" },
  { href: "/pesan", label: "Pesan", icon: "chat" },
  { href: "/statistik", label: "Statistik", icon: "chart" },
  { href: "/langganan", label: "Langganan", icon: "cash" },
];

export const ADMIN_CMS_COOKIE = "admin_cms_tenant";

export type CmsContext = {
  tenant: TenantRow;
  subscription: SubscriptionRow | null;
  readOnly: boolean;
  adminMode: boolean;
};

export async function loadCms(c: Context<AppEnv>): Promise<CmsContext | null> {
  const session = c.get("session");
  if (!session) return null;
  let tenantId = session.tenantId;
  let adminMode = false;
  if (session.role === "admin") {
    const picked = Number(getCookie(c, ADMIN_CMS_COOKIE));
    if (!Number.isInteger(picked) || picked <= 0) return null;
    tenantId = picked;
    adminMode = true;
  }
  if (tenantId === null) return null;
  const tenant = await findTenantById(c.env.DB, tenantId);
  if (!tenant) return null;
  const subscription = await getSubscription(c.env.DB, tenant.id);
  return { tenant, subscription, readOnly: !adminMode && tenant.status === "suspended", adminMode };
}

export async function purgeTenantPages(c: Context<AppEnv>, tenant: TenantRow): Promise<void> {
  await invalidateTenantCache(tenantHostnames(tenant, c.env.BASE_DOMAIN), [...PUBLIC_PAGE_PATHS]);
}

export function CmsPage(props: {
  title: string;
  currentPath: string;
  cms: CmsContext;
  notice?: string;
  error?: string;
  children: Child;
}) {
  return (
    <AppLayout
      title={`${props.title} — ${props.cms.tenant.name}`}
      heading={props.cms.tenant.name}
      nav={CMS_NAV}
      currentPath={props.currentPath}
      logout
    >
      {props.cms.adminMode ? (
        <Alert tone="warning">
          Mode Admin — kamu mengedit CMS <strong>{props.cms.tenant.name}</strong>.{" "}
          <TextLink href={`/admin/tenant/${props.cms.tenant.id}/cms/keluar`}>
            Selesai, kembali ke Admin →
          </TextLink>
        </Alert>
      ) : null}
      {props.cms.tenant.status === "grace" ? (
        <Alert tone="warning">
          Tagihan langgananmu sudah jatuh tempo. Segera bayar agar situs tidak dinonaktifkan.
        </Alert>
      ) : null}
      {props.cms.readOnly ? (
        <Alert tone="danger">
          Situs sedang nonaktif karena tagihan belum dibayar. CMS mode baca saja — bayar untuk
          mengaktifkan kembali.
        </Alert>
      ) : null}
      {props.notice ? <Alert tone="success">{props.notice}</Alert> : null}
      {props.error ? <Alert tone="danger">{props.error}</Alert> : null}
      {props.children}
    </AppLayout>
  );
}

export function html(node: unknown): string {
  return `<!doctype html>${String(node)}`;
}
