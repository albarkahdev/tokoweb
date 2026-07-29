import { describe, expect, it } from "vitest";
import { generateReferralCode, isValidPin, isValidReferralCode } from "@/domain/referral-code";

describe("generateReferralCode", () => {
  it("produces 6 chars without ambiguous characters", () => {
    let seed = 0.1;
    const code = generateReferralCode(() => {
      seed = (seed * 9301 + 0.49297) % 1;
      return seed;
    });
    expect(code).toHaveLength(6);
    expect(isValidReferralCode(code)).toBe(true);
    expect(code).not.toMatch(/[O0I1]/);
  });

  it("handles random edge values", () => {
    expect(generateReferralCode(() => 0)).toBe("AAAAAA");
    expect(generateReferralCode(() => 0.999999)).toBe("999999");
  });
});

describe("isValidReferralCode", () => {
  it("accepts valid codes and rejects invalid", () => {
    expect(isValidReferralCode("K7M3XR")).toBe(true);
    expect(isValidReferralCode("K7M3X")).toBe(false);
    expect(isValidReferralCode("K7M3X0")).toBe(false);
    expect(isValidReferralCode("k7m3xr")).toBe(false);
  });
});

describe("isValidPin", () => {
  it("accepts exactly 6 digits", () => {
    expect(isValidPin("041739")).toBe(true);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("1234567")).toBe(false);
    expect(isValidPin("12a456")).toBe(false);
  });
});
