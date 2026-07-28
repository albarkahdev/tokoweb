export type TestimonialRow = {
  id: number;
  tenant_id: number;
  author_name: string;
  body: string;
  rating: number | null;
  status: "pending" | "approved";
  created_at: string;
};

export async function listTestimonials(
  db: D1Database,
  tenantId: number,
  status: "pending" | "approved",
): Promise<TestimonialRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, tenant_id, author_name, body, rating, status, created_at FROM testimonials WHERE tenant_id = ?1 AND status = ?2 ORDER BY created_at DESC",
    )
    .bind(tenantId, status)
    .all<TestimonialRow>();
  return rows.results;
}

export async function approveTestimonial(
  db: D1Database,
  tenantId: number,
  id: number,
): Promise<void> {
  await db
    .prepare("UPDATE testimonials SET status = 'approved' WHERE id = ?1 AND tenant_id = ?2")
    .bind(id, tenantId)
    .run();
}

export async function deleteTestimonial(
  db: D1Database,
  tenantId: number,
  id: number,
): Promise<void> {
  await db
    .prepare("DELETE FROM testimonials WHERE id = ?1 AND tenant_id = ?2")
    .bind(id, tenantId)
    .run();
}
