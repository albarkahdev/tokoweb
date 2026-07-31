import { describe, expect, it } from "vitest";
import { isCacheablePublicRequest, publicCacheKey } from "@/domain/edge-cache";

describe("publicCacheKey", () => {
  it("builds normalized https url from host and path with cache version", () => {
    expect(publicCacheKey("Warung.Tokoweb.ID", "/menu")).toBe(
      "https://warung.tokoweb.id/menu?cv=3",
    );
  });

  it("defaults empty path to root", () => {
    expect(publicCacheKey("warung.tokoweb.id", "")).toBe("https://warung.tokoweb.id/?cv=3");
  });
});

describe("isCacheablePublicRequest", () => {
  it("allows only GET", () => {
    expect(isCacheablePublicRequest("GET")).toBe(true);
    expect(isCacheablePublicRequest("POST")).toBe(false);
    expect(isCacheablePublicRequest("HEAD")).toBe(false);
  });
});
