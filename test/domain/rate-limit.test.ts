import { describe, expect, it } from "vitest";
import { createFixedWindowLimiter } from "@/domain/rate-limit";

describe("createFixedWindowLimiter", () => {
  it("allows up to limit within window", () => {
    const limiter = createFixedWindowLimiter(3, 60_000);
    expect(limiter.allow("k", 0)).toBe(true);
    expect(limiter.allow("k", 1)).toBe(true);
    expect(limiter.allow("k", 2)).toBe(true);
    expect(limiter.allow("k", 3)).toBe(false);
  });

  it("resets after window passes", () => {
    const limiter = createFixedWindowLimiter(1, 60_000);
    expect(limiter.allow("k", 0)).toBe(true);
    expect(limiter.allow("k", 30_000)).toBe(false);
    expect(limiter.allow("k", 60_000)).toBe(true);
  });

  it("tracks keys independently", () => {
    const limiter = createFixedWindowLimiter(1, 60_000);
    expect(limiter.allow("a", 0)).toBe(true);
    expect(limiter.allow("b", 0)).toBe(true);
  });

  it("evicts all keys when map is full", () => {
    const limiter = createFixedWindowLimiter(1, 60_000, 2);
    expect(limiter.allow("a", 0)).toBe(true);
    expect(limiter.allow("b", 0)).toBe(true);
    expect(limiter.allow("c", 1)).toBe(true);
    expect(limiter.allow("a", 2)).toBe(true);
  });
});
