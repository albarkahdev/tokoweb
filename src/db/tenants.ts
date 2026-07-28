import { resolveSurface } from "@/domain/hostname";

export type TenantRow = {
  id: number;
  slug: string;
  custom_domain: string | null;
  name: string;
  vertical_id: number;
  theme_id: number;
  status: string;
};

export async function findTenantById(db: D1Database, id: number): Promise<TenantRow | null> {
  return db
    .prepare(
      "SELECT id, slug, custom_domain, name, vertical_id, theme_id, status FROM tenants WHERE id = ?1",
    )
    .bind(id)
    .first<TenantRow>();
}

export function tenantHostnames(tenant: TenantRow, baseDomain: string): string[] {
  const hostnames = [`${tenant.slug}.${baseDomain}`];
  if (tenant.custom_domain) hostnames.push(tenant.custom_domain);
  return hostnames;
}

export async function setTenantStatus(
  db: D1Database,
  tenantId: number,
  status: string,
): Promise<void> {
  await db.prepare("UPDATE tenants SET status = ?1 WHERE id = ?2").bind(status, tenantId).run();
}

export async function setTenantTheme(
  db: D1Database,
  tenantId: number,
  themeId: number,
): Promise<void> {
  await db.prepare("UPDATE tenants SET theme_id = ?1 WHERE id = ?2").bind(themeId, tenantId).run();
}

const CACHE_TTL_MS = 5 * 60_000;
const MAX_CACHE_ENTRIES = 5_000;
const cache = new Map<string, { tenantId: number | null; expiresAt: number }>();

export async function findTrackableTenantId(
  db: D1Database,
  hostname: string,
  baseDomain: string,
  nowMs: number,
): Promise<number | null> {
  const key = hostname.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > nowMs) return cached.tenantId;

  const tenantId = await lookupTenantId(db, key, baseDomain);
  if (cache.size >= MAX_CACHE_ENTRIES) cache.clear();
  cache.set(key, { tenantId, expiresAt: nowMs + CACHE_TTL_MS });
  return tenantId;
}

async function lookupTenantId(
  db: D1Database,
  hostname: string,
  baseDomain: string,
): Promise<number | null> {
  const surface = resolveSurface(hostname, baseDomain);
  if (surface.kind === "tenant-public") {
    const row = await db
      .prepare("SELECT id FROM tenants WHERE slug = ?1 AND status IN ('active', 'grace')")
      .bind(surface.tenantSlug)
      .first<{ id: number }>();
    return row?.id ?? null;
  }
  if (surface.kind === "custom-domain") {
    const row = await db
      .prepare("SELECT id FROM tenants WHERE custom_domain = ?1 AND status IN ('active', 'grace')")
      .bind(surface.hostname)
      .first<{ id: number }>();
    return row?.id ?? null;
  }
  return null;
}
