import type { Context } from "hono";
import { buildCacheableHtmlResponse, matchCachedPage, putCachedPage } from "@/db/edge-cache";
import { listActivePromos } from "@/db/promos";
import { findPublicSite, type PublicSite } from "@/db/public-site";
import { listTestimonials } from "@/db/testimonials";
import { isCacheablePublicRequest } from "@/domain/edge-cache";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { PUBLIC_PAGE_PATHS, type PublicPagePath, type RenderData } from "@/themes/engine/types";
import { KULINER_THEMES } from "@/themes/kuliner/configs";
import { renderKulinerPage, renderSuspendedHtml } from "@/themes/render";

const MAX_FEATURED = 7;

function countMenuItems(site: PublicSite): number {
  return (site.content.menu ?? []).flatMap((category) => category.items ?? []).length;
}

function countGalleryPhotos(site: PublicSite): number {
  return (site.content.gallery ?? []).filter((photo) => photo.image_key).length;
}

function isPublicPagePath(path: string): path is PublicPagePath {
  return (PUBLIC_PAGE_PATHS as readonly string[]).includes(path);
}

export async function servePublicSite(c: Context<AppEnv>): Promise<Response> {
  if (!isCacheablePublicRequest(c.req.method)) return c.notFound();

  const url = new URL(c.req.url);
  const path = url.pathname;

  if (path === "/robots.txt") {
    return c.text(`User-agent: *\nAllow: /\nSitemap: https://${url.hostname}/sitemap.xml\n`, 200, {
      "cache-control": "public, max-age=86400",
    });
  }
  if (path === "/sitemap.xml") {
    const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
    const locs = ["/"];
    if (site && site.status === "active") {
      if (countMenuItems(site) > MAX_FEATURED) locs.push("/menu");
      if (countGalleryPhotos(site) > 0) locs.push("/galeri");
    }
    const urls = locs
      .map((loc) => `<url><loc>https://${url.hostname}${loc === "/" ? "/" : loc}</loc></url>`)
      .join("");
    return c.text(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`,
      200,
      { "content-type": "application/xml", "cache-control": "public, max-age=86400" },
    );
  }
  if (!isPublicPagePath(path)) return c.notFound();

  const previewTheme = url.searchParams.get("preview_theme");
  const isPreview = previewTheme !== null && previewTheme in KULINER_THEMES;

  if (!isPreview) {
    const cached = await matchCachedPage(url.hostname, path);
    if (cached) return cached;
  }

  const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
  if (!site || site.status === "draft") return c.notFound();

  if (site.status === "suspended") {
    const response = buildCacheableHtmlResponse(renderSuspendedHtml(site.name));
    c.executionCtx.waitUntil(putCachedPage(url.hostname, path, response.clone()));
    return response;
  }

  if (path === "/menu" && countMenuItems(site) <= MAX_FEATURED) return c.notFound();
  if (path === "/galeri" && countGalleryPhotos(site) === 0) return c.notFound();

  const data = await buildRenderData(c, site, url.hostname, path, isPreview);
  if (path === "/promo" && data.promos.length === 0) return c.notFound();
  if (path === "/testimoni" && data.testimonials.length === 0) return c.notFound();
  if (isPreview) {
    data.site = { ...site, themeSlug: previewTheme };
  }
  const html = renderKulinerPage(data);

  if (isPreview) {
    return c.html(html, 200, { "cache-control": "no-store" });
  }
  const response = buildCacheableHtmlResponse(html);
  c.executionCtx.waitUntil(putCachedPage(url.hostname, path, response.clone()));
  return response;
}

async function buildRenderData(
  c: Context<AppEnv>,
  site: PublicSite,
  hostname: string,
  path: PublicPagePath,
  noindex: boolean,
): Promise<RenderData> {
  const todayWib = wibDateOf(Date.now());
  const [promos, testimonials] = await Promise.all([
    listActivePromos(c.env.DB, site.tenantId, todayWib),
    listTestimonials(c.env.DB, site.tenantId, "approved"),
  ]);
  return {
    site,
    promos,
    testimonials,
    baseUrl: `https://${hostname}`,
    appBaseUrl: `https://app.${c.env.BASE_DOMAIN}`,
    path,
    todayWib,
    noindex,
  };
}
