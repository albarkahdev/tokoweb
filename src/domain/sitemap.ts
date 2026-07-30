export type SitemapEntry = { loc: string };

export function tenantHomeUrl(baseDomain: string, slug: string): string {
  return `https://${slug}.${baseDomain}/`;
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => `<url><loc>${escapeXml(entry.loc)}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
}

export function buildSiteSitemap(
  baseDomain: string,
  tenantSlugs: string[],
  blogSlugs: string[],
): string {
  const base = `https://${baseDomain}`;
  const entries: SitemapEntry[] = [
    { loc: `${base}/` },
    { loc: `${base}/mitra` },
    { loc: `${base}/toko` },
    { loc: `${base}/blog` },
    ...blogSlugs.map((slug) => ({ loc: `${base}/blog/${slug}` })),
    ...tenantSlugs.map((slug) => ({ loc: tenantHomeUrl(baseDomain, slug) })),
  ];
  return buildSitemapXml(entries);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
