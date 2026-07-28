import { parseSiteContent, type SiteContent } from "@/domain/content";

export async function getSiteContent(db: D1Database, tenantId: number): Promise<SiteContent> {
  const row = await db
    .prepare("SELECT data FROM contents WHERE tenant_id = ?1")
    .bind(tenantId)
    .first<{ data: string }>();
  return parseSiteContent(row?.data ?? null);
}

export async function saveSiteContent(
  db: D1Database,
  tenantId: number,
  content: SiteContent,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO contents (tenant_id, data, updated_at) VALUES (?1, ?2, datetime('now')) ON CONFLICT (tenant_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
    )
    .bind(tenantId, JSON.stringify(content))
    .run();
}
