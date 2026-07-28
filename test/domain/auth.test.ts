import { describe, expect, it } from "vitest";
import { generateOneTimeToken, hashOneTimeToken } from "@/domain/one-time-token";
import { hashPassword, isAcceptablePassword, verifyPassword } from "@/domain/password";
import { createSessionToken, verifySessionToken } from "@/domain/session";

describe("password hashing", () => {
  it("verifies correct password and rejects wrong one", async () => {
    const stored = await hashPassword("rahasia-kuat-123");
    expect(await verifyPassword("rahasia-kuat-123", stored)).toBe(true);
    expect(await verifyPassword("salah", stored)).toBe(false);
  });

  it("produces unique salts", async () => {
    const a = await hashPassword("sama");
    const b = await hashPassword("sama");
    expect(a).not.toBe(b);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("x", "bukan-hash")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });

  it("enforces password length bounds", () => {
    expect(isAcceptablePassword("1234567")).toBe(false);
    expect(isAcceptablePassword("12345678")).toBe(true);
  });
});

describe("session token", () => {
  const SECRET = "test-secret";
  const NOW = 1_000_000;

  it("round-trips a valid session", async () => {
    const payload = { userId: 7, role: "owner" as const, tenantId: 3, expiresAtMs: NOW + 1000 };
    const token = await createSessionToken(payload, SECRET);
    expect(await verifySessionToken(token, SECRET, NOW)).toEqual(payload);
  });

  it("supports admin session without tenant", async () => {
    const payload = { userId: 1, role: "admin" as const, tenantId: null, expiresAtMs: NOW + 1000 };
    const token = await createSessionToken(payload, SECRET);
    expect(await verifySessionToken(token, SECRET, NOW)).toEqual(payload);
  });

  it("rejects expired token", async () => {
    const token = await createSessionToken(
      { userId: 7, role: "owner", tenantId: 3, expiresAtMs: NOW - 1 },
      SECRET,
    );
    expect(await verifySessionToken(token, SECRET, NOW)).toBeNull();
  });

  it("rejects tampered token and wrong secret", async () => {
    const token = await createSessionToken(
      { userId: 7, role: "owner", tenantId: 3, expiresAtMs: NOW + 1000 },
      SECRET,
    );
    const tampered = token.replace("7.owner", "7.admin");
    expect(await verifySessionToken(tampered, SECRET, NOW)).toBeNull();
    expect(await verifySessionToken(token, "secret-lain", NOW)).toBeNull();
    expect(await verifySessionToken("sampah", SECRET, NOW)).toBeNull();
  });
});

describe("one-time token", () => {
  it("generates 64-hex token with stable hash", async () => {
    const token = generateOneTimeToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashOneTimeToken(token)).toBe(await hashOneTimeToken(token));
    expect(await hashOneTimeToken(token)).not.toBe(token);
  });
});
