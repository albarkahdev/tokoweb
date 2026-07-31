import { describe, expect, it } from "vitest";
import { buildSitemapXml, buildSiteSitemap, tenantHomeUrl } from "@/domain/sitemap";

describe("sitemap", () => {
  it("tenantHomeUrl bentuk subdomain", () => {
    expect(tenantHomeUrl("tokoweb.id", "warung-bu-sari")).toBe(
      "https://warung-bu-sari.tokoweb.id/",
    );
  });

  it("buildSitemapXml membungkus loc + escape", () => {
    const xml = buildSitemapXml([{ loc: "https://a.tokoweb.id/?x=1&y=2" }]);
    expect(xml).toContain("<loc>https://a.tokoweb.id/?x=1&amp;y=2</loc>");
    expect(xml).toContain("<urlset");
  });

  it("buildSiteSitemap sertakan apex, blog, toko, tenant", () => {
    const xml = buildSiteSitemap("tokoweb.id", ["warung-a", "kedai-b"], ["artikel-satu"]);
    expect(xml).toContain("<loc>https://tokoweb.id/</loc>");
    expect(xml).toContain("<loc>https://tokoweb.id/toko</loc>");
    expect(xml).toContain("<loc>https://tokoweb.id/blog</loc>");
    expect(xml).toContain("<loc>https://tokoweb.id/blog/artikel-satu</loc>");
    expect(xml).toContain("<loc>https://warung-a.tokoweb.id/</loc>");
    expect(xml).toContain("<loc>https://kedai-b.tokoweb.id/</loc>");
  });
});
