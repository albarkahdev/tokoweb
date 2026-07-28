import { generateOneTimeToken, hashOneTimeToken } from "@/domain/one-time-token";
import { sqlUtcDateTime } from "@/domain/stats";

export type TokenPurpose = "set_password" | "intake";

export type AuthTokenRow = {
  id: number;
  purpose: TokenPurpose;
  user_id: number | null;
  tenant_id: number | null;
};

export async function issueToken(
  db: D1Database,
  purpose: TokenPurpose,
  target: { userId?: number; tenantId?: number },
  ttlMs: number,
  nowMs: number,
): Promise<string> {
  const token = generateOneTimeToken();
  const tokenHash = await hashOneTimeToken(token);
  await db
    .prepare(
      "INSERT INTO auth_tokens (token_hash, purpose, user_id, tenant_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
    .bind(
      tokenHash,
      purpose,
      target.userId ?? null,
      target.tenantId ?? null,
      sqlUtcDateTime(nowMs + ttlMs),
    )
    .run();
  return token;
}

export async function peekToken(
  db: D1Database,
  token: string,
  purpose: TokenPurpose,
  nowMs: number,
): Promise<AuthTokenRow | null> {
  const tokenHash = await hashOneTimeToken(token);
  return db
    .prepare(
      "SELECT id, purpose, user_id, tenant_id FROM auth_tokens WHERE token_hash = ?1 AND purpose = ?2 AND used_at IS NULL AND expires_at > ?3",
    )
    .bind(tokenHash, purpose, sqlUtcDateTime(nowMs))
    .first<AuthTokenRow>();
}

export async function consumeToken(
  db: D1Database,
  token: string,
  purpose: TokenPurpose,
  nowMs: number,
): Promise<AuthTokenRow | null> {
  const row = await peekToken(db, token, purpose, nowMs);
  if (!row) return null;
  await db
    .prepare("UPDATE auth_tokens SET used_at = ?1 WHERE id = ?2")
    .bind(sqlUtcDateTime(nowMs), row.id)
    .run();
  return row;
}

export async function invalidateTokensFor(
  db: D1Database,
  purpose: TokenPurpose,
  tenantId: number,
  nowMs: number,
): Promise<void> {
  await db
    .prepare(
      "UPDATE auth_tokens SET used_at = ?1 WHERE purpose = ?2 AND tenant_id = ?3 AND used_at IS NULL",
    )
    .bind(sqlUtcDateTime(nowMs), purpose, tenantId)
    .run();
}
