import type { TrackPayload } from "@/domain/tracker";

export async function insertTrackEvent(
  db: D1Database,
  tenantId: number,
  payload: TrackPayload,
  visitorHash: string,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO track_events (tenant_id, type, path, promo_id, visitor_hash) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
    .bind(tenantId, payload.type, payload.path, payload.promoId, visitorHash)
    .run();
}
