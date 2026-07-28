export type IntakeRow = {
  id: number;
  tenant_id: number;
  raw: string;
  processed: number;
  created_at: string;
};

export async function createIntake(db: D1Database, tenantId: number, raw: string): Promise<void> {
  await db
    .prepare("INSERT INTO intake_forms (tenant_id, raw) VALUES (?1, ?2)")
    .bind(tenantId, raw)
    .run();
}

export async function listIntakes(db: D1Database): Promise<IntakeRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, tenant_id, raw, processed, created_at FROM intake_forms ORDER BY processed, created_at DESC",
    )
    .all<IntakeRow>();
  return rows.results;
}

export async function findIntakeById(db: D1Database, id: number): Promise<IntakeRow | null> {
  return db
    .prepare("SELECT id, tenant_id, raw, processed, created_at FROM intake_forms WHERE id = ?1")
    .bind(id)
    .first<IntakeRow>();
}

export async function markIntakeProcessed(db: D1Database, id: number): Promise<void> {
  await db.prepare("UPDATE intake_forms SET processed = 1 WHERE id = ?1").bind(id).run();
}
