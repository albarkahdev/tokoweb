import { describe, expect, it } from "vitest";
import { resolveSurface } from "@/domain/hostname";

const BASE = "tokoweb.id";

describe("resolveSurface", () => {
  it("resolves app subdomain to CMS surface", () => {
    expect(resolveSurface("app.tokoweb.id", BASE)).toEqual({ kind: "app" });
  });

  it("resolves demo subdomain to demo surface", () => {
    expect(resolveSurface("demo.tokoweb.id", BASE)).toEqual({ kind: "demo" });
  });

  it("resolves tenant subdomain to public site", () => {
    expect(resolveSurface("warung-bu-sari.tokoweb.id", BASE)).toEqual({
      kind: "tenant-public",
      tenantSlug: "warung-bu-sari",
    });
  });

  it("resolves foreign hostname to custom domain", () => {
    expect(resolveSurface("warungbusari.com", BASE)).toEqual({
      kind: "custom-domain",
      hostname: "warungbusari.com",
    });
  });

  it("treats apex and www as unknown", () => {
    expect(resolveSurface("tokoweb.id", BASE)).toEqual({ kind: "unknown" });
    expect(resolveSurface("www.tokoweb.id", BASE)).toEqual({ kind: "unknown" });
  });

  it("rejects nested subdomains", () => {
    expect(resolveSurface("a.b.tokoweb.id", BASE)).toEqual({ kind: "unknown" });
  });

  it("ignores port and case", () => {
    expect(resolveSurface("APP.Tokoweb.ID:8787", BASE)).toEqual({ kind: "app" });
  });
});
