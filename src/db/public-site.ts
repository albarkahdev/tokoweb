import { parseSiteContent, type SiteContent } from "@/domain/content";
import { resolveSurface } from "@/domain/hostname";

export type PublicSite = {
  tenantId: number;
  slug: string;
  name: string;
  status: string;
  themeSlug: string;
  tokens: Record<string, unknown>;
  content: SiteContent;
};

type SiteRow = {
  id: number;
  slug: string;
  name: string;
  status: string;
  theme_slug: string;
  tokens: string;
  data: string | null;
};

const SITE_SELECT = `
  SELECT t.id, t.slug, t.name, t.status, th.slug AS theme_slug, th.tokens, c.data
  FROM tenants t
  JOIN themes th ON th.id = t.theme_id
  LEFT JOIN contents c ON c.tenant_id = t.id`;

export async function findPublicSite(
  db: D1Database,
  hostname: string,
  baseDomain: string,
): Promise<PublicSite | null> {
  const surface = resolveSurface(hostname, baseDomain);

  let row: SiteRow | null = null;
  if (surface.kind === "tenant-public") {
    row = await db
      .prepare(`${SITE_SELECT} WHERE t.slug = ?1 AND t.status != 'archived'`)
      .bind(surface.tenantSlug)
      .first<SiteRow>();
  } else if (surface.kind === "custom-domain") {
    row = await db
      .prepare(`${SITE_SELECT} WHERE t.custom_domain = ?1 AND t.status != 'archived'`)
      .bind(surface.hostname)
      .first<SiteRow>();
  }
  if (!row) return null;

  return {
    tenantId: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    themeSlug: row.theme_slug,
    tokens: parseTokens(row.tokens),
    content: parseSiteContent(row.data),
  };
}

function parseTokens(json: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}
