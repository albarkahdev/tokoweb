export type ReferrerRow = {
  id: number;
  code: string;
  name: string;
  wa_number: string;
  bank_account: string | null;
  status: "active" | "inactive";
  pin_hash: string | null;
};

export async function listReferrers(db: D1Database): Promise<ReferrerRow[]> {
  const rows = await db
    .prepare(
      "SELECT id, code, name, wa_number, bank_account, status, pin_hash FROM referrers ORDER BY created_at DESC",
    )
    .all<ReferrerRow>();
  return rows.results;
}

export async function findReferrerByCode(
  db: D1Database,
  code: string,
): Promise<ReferrerRow | null> {
  return db
    .prepare(
      "SELECT id, code, name, wa_number, bank_account, status, pin_hash FROM referrers WHERE code = ?1",
    )
    .bind(code)
    .first<ReferrerRow>();
}

export async function findReferrerById(db: D1Database, id: number): Promise<ReferrerRow | null> {
  return db
    .prepare(
      "SELECT id, code, name, wa_number, bank_account, status, pin_hash FROM referrers WHERE id = ?1",
    )
    .bind(id)
    .first<ReferrerRow>();
}

export async function createReferrer(
  db: D1Database,
  data: {
    code: string;
    name: string;
    waNumber: string;
    bankAccount: string | null;
    pinHash: string;
  },
): Promise<number> {
  const row = await db
    .prepare(
      "INSERT INTO referrers (code, name, wa_number, bank_account, status, pin_hash) VALUES (?1, ?2, ?3, ?4, 'active', ?5) RETURNING id",
    )
    .bind(data.code, data.name, data.waNumber, data.bankAccount, data.pinHash)
    .first<{ id: number }>();
  if (!row) throw new Error("Failed to create referrer");
  return row.id;
}

export async function setReferrerStatus(
  db: D1Database,
  id: number,
  status: "active" | "inactive",
): Promise<void> {
  await db.prepare("UPDATE referrers SET status = ?1 WHERE id = ?2").bind(status, id).run();
}
