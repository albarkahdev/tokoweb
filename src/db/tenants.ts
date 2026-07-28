import { resolveSurface } from "@/domain/hostname";

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
