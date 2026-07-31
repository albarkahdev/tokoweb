export type BillingSubmissionStatus = "pending" | "matched" | "rejected";

export type BillingSubmissionRow = {
  id: number;
  tenant_id: number;
  period: string;
  amount: number;
  proof_key: string | null;
  note: string | null;
  status: BillingSubmissionStatus;
  created_at: string;
  reviewed_at: string | null;
};

export type PendingBillingSubmission = BillingSubmissionRow & {
  tenant_name: string;
  tenant_slug: string;
};

export async function upsertBillingSubmission(
  db: D1Database,
  input: {
    tenantId: number;
    period: string;
    amount: number;
    proofKey: string | null;
    note: string | null;
    nowIso: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO billing_submissions (tenant_id, period, amount, proof_key, note, status, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6)
       ON CONFLICT (tenant_id, period) DO UPDATE SET
         amount = excluded.amount,
         proof_key = excluded.proof_key,
         note = excluded.note,
         status = 'pending',
         created_at = excluded.created_at,
         reviewed_at = NULL`,
    )
    .bind(input.tenantId, input.period, input.amount, input.proofKey, input.note, input.nowIso)
    .run();
}

export async function getSubmissionForPeriod(
  db: D1Database,
  tenantId: number,
  period: string,
): Promise<BillingSubmissionRow | null> {
  return await db
    .prepare(
      "SELECT id, tenant_id, period, amount, proof_key, note, status, created_at, reviewed_at FROM billing_submissions WHERE tenant_id = ?1 AND period = ?2",
    )
    .bind(tenantId, period)
    .first<BillingSubmissionRow>();
}

export async function findPendingSubmission(
  db: D1Database,
  tenantId: number,
): Promise<BillingSubmissionRow | null> {
  return await db
    .prepare(
      "SELECT id, tenant_id, period, amount, proof_key, note, status, created_at, reviewed_at FROM billing_submissions WHERE tenant_id = ?1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
    )
    .bind(tenantId)
    .first<BillingSubmissionRow>();
}

export async function listPendingSubmissions(db: D1Database): Promise<PendingBillingSubmission[]> {
  const { results } = await db
    .prepare(
      `SELECT b.id, b.tenant_id, b.period, b.amount, b.proof_key, b.note, b.status, b.created_at, b.reviewed_at,
              t.name AS tenant_name, t.slug AS tenant_slug
       FROM billing_submissions b
       JOIN tenants t ON t.id = b.tenant_id
       WHERE b.status = 'pending'
       ORDER BY b.created_at ASC`,
    )
    .all<PendingBillingSubmission>();
  return results ?? [];
}

export async function reviewSubmission(
  db: D1Database,
  tenantId: number,
  period: string,
  status: Exclude<BillingSubmissionStatus, "pending">,
  nowIso: string,
): Promise<void> {
  await db
    .prepare(
      "UPDATE billing_submissions SET status = ?3, reviewed_at = ?4 WHERE tenant_id = ?1 AND period = ?2",
    )
    .bind(tenantId, period, status, nowIso)
    .run();
}
