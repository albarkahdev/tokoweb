export type LeadRow = {
  id: number;
  referrer_id: number | null;
  name: string;
  business_name: string;
  wa_number: string;
  email: string | null;
  vertical_slug: string;
  status: "new" | "contacted" | "closed" | "lost";
  created_at: string;
};

const LEAD_COLUMNS =
  "id, referrer_id, name, business_name, wa_number, email, vertical_slug, status, created_at";

export async function listLeads(db: D1Database): Promise<LeadRow[]> {
  const rows = await db
    .prepare(`SELECT ${LEAD_COLUMNS} FROM leads ORDER BY created_at DESC`)
    .all<LeadRow>();
  return rows.results;
}

export async function findLeadById(db: D1Database, id: number): Promise<LeadRow | null> {
  return db.prepare(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = ?1`).bind(id).first<LeadRow>();
}

export async function findLeadByWa(db: D1Database, waNumber: string): Promise<LeadRow | null> {
  return db
    .prepare(`SELECT ${LEAD_COLUMNS} FROM leads WHERE wa_number = ?1 LIMIT 1`)
    .bind(waNumber)
    .first<LeadRow>();
}

export async function createLead(
  db: D1Database,
  data: {
    referrerId: number | null;
    name: string;
    businessName: string;
    waNumber: string;
    email: string | null;
    verticalSlug: string;
  },
): Promise<number> {
  const row = await db
    .prepare(
      "INSERT INTO leads (referrer_id, name, business_name, wa_number, email, vertical_slug) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id",
    )
    .bind(
      data.referrerId,
      data.name,
      data.businessName,
      data.waNumber,
      data.email,
      data.verticalSlug,
    )
    .first<{ id: number }>();
  if (!row) throw new Error("Failed to create lead");
  return row.id;
}

export async function setLeadStatus(
  db: D1Database,
  id: number,
  status: LeadRow["status"],
): Promise<void> {
  await db.prepare("UPDATE leads SET status = ?1 WHERE id = ?2").bind(status, id).run();
}
