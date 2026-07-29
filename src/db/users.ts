export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  role: "admin" | "owner";
  tenant_id: number | null;
  session_version: number;
};

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return db
    .prepare(
      "SELECT id, email, password_hash, role, tenant_id, session_version FROM users WHERE email = ?1",
    )
    .bind(email.toLowerCase().trim())
    .first<UserRow>();
}

export async function findUserById(db: D1Database, id: number): Promise<UserRow | null> {
  return db
    .prepare(
      "SELECT id, email, password_hash, role, tenant_id, session_version FROM users WHERE id = ?1",
    )
    .bind(id)
    .first<UserRow>();
}

export async function getSessionVersion(db: D1Database, id: number): Promise<number | null> {
  const row = await db
    .prepare("SELECT session_version FROM users WHERE id = ?1")
    .bind(id)
    .first<{ session_version: number }>();
  return row?.session_version ?? null;
}

export async function bumpSessionVersion(db: D1Database, id: number): Promise<void> {
  await db
    .prepare("UPDATE users SET session_version = session_version + 1 WHERE id = ?1")
    .bind(id)
    .run();
}

export async function createUser(
  db: D1Database,
  email: string,
  passwordHash: string,
  role: "admin" | "owner",
  tenantId: number | null,
): Promise<number> {
  const result = await db
    .prepare(
      "INSERT INTO users (email, password_hash, role, tenant_id) VALUES (?1, ?2, ?3, ?4) RETURNING id",
    )
    .bind(email.toLowerCase().trim(), passwordHash, role, tenantId)
    .first<{ id: number }>();
  if (!result) throw new Error("Failed to create user");
  return result.id;
}

export async function updateUserPassword(
  db: D1Database,
  userId: number,
  passwordHash: string,
): Promise<void> {
  await db
    .prepare("UPDATE users SET password_hash = ?1 WHERE id = ?2")
    .bind(passwordHash, userId)
    .run();
}
