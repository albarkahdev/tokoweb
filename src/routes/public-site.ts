import type { Context } from "hono";
import { buildCacheableHtmlResponse, matchCachedPage, putCachedPage } from "@/db/edge-cache";
import { findPublicSite } from "@/db/public-site";
import { isCacheablePublicRequest } from "@/domain/edge-cache";
import type { AppEnv } from "@/env";
import { renderPublicSiteHtml, renderSuspendedHtml } from "@/themes/render";

export async function servePublicSite(c: Context<AppEnv>): Promise<Response> {
  if (!isCacheablePublicRequest(c.req.method)) return c.notFound();

  const url = new URL(c.req.url);
  const cached = await matchCachedPage(url.hostname, url.pathname);
  if (cached) return cached;

  const site = await findPublicSite(c.env.DB, url.hostname, c.env.BASE_DOMAIN);
  if (!site || site.status === "draft") return c.notFound();

  const html =
    site.status === "suspended" ? renderSuspendedHtml(site.name) : renderPublicSiteHtml(site);

  const response = buildCacheableHtmlResponse(html);
  c.executionCtx.waitUntil(putCachedPage(url.hostname, url.pathname, response.clone()));
  return response;
}
