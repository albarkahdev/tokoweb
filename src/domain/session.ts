export type SessionPayload = {
  userId: number;
  role: "admin" | "owner";
  tenantId: number | null;
  expiresAtMs: number;
};

export const SESSION_TTL_MS = 30 * 86_400_000;

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function encodePayload(payload: SessionPayload): string {
  return `${payload.userId}.${payload.role}.${payload.tenantId ?? ""}.${payload.expiresAtMs}`;
}

export async function createSessionToken(payload: SessionPayload, secret: string): Promise<string> {
  const body = encodePayload(payload);
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
  nowMs: number,
): Promise<SessionPayload | null> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return null;
  const body = token.slice(0, lastDot);
  const parts = body.split(".");
  if (parts.length !== 4) return null;
  const [rawUserId, rawRole, rawTenantId, rawExpires] = parts;

  const expected = await createSessionToken(
    {
      userId: Number(rawUserId),
      role: rawRole as SessionPayload["role"],
      tenantId: rawTenantId === "" ? null : Number(rawTenantId),
      expiresAtMs: Number(rawExpires),
    },
    secret,
  );
  if (!timingSafeEqual(token, expected)) return null;

  const userId = Number(rawUserId);
  const expiresAtMs = Number(rawExpires);
  if (!Number.isInteger(userId) || !Number.isFinite(expiresAtMs)) return null;
  if (rawRole !== "admin" && rawRole !== "owner") return null;
  if (expiresAtMs <= nowMs) return null;

  return {
    userId,
    role: rawRole,
    tenantId: rawTenantId === "" ? null : Number(rawTenantId),
    expiresAtMs,
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
