import { describe, expect, it } from "vitest";
import { verifyTurnstile } from "@/domain/turnstile";

describe("verifyTurnstile unconfigured behavior", () => {
  it("passes when secret is empty outside production (dev/test/self-host)", async () => {
    expect(await verifyTurnstile("", "tok", undefined, undefined)).toBe(true);
    expect(await verifyTurnstile("", "tok", undefined, "development")).toBe(true);
  });

  it("fails closed when secret is empty in production", async () => {
    expect(await verifyTurnstile("", "tok", undefined, "production")).toBe(false);
    expect(await verifyTurnstile(undefined, "tok", undefined, "production")).toBe(false);
  });
});
