import { type Context, Hono } from "hono";
import { getSiteContent } from "@/db/contents";
import { listActivePromos } from "@/db/promos";
import { listTestimonials } from "@/db/testimonials";
import { findThemeById } from "@/db/themes";
import { wibDateOf } from "@/domain/subscription";
import type { AppEnv } from "@/env";
import { type CmsContext, loadCms } from "@/routes/cms/shared";
import { renderKulinerPage } from "@/themes/engine/render";
import type { PublicPagePath } from "@/themes/engine/types";

async function renderPreview(
  c: Context<AppEnv>,
  cms: CmsContext,
  path: PublicPagePath,
): Promise<Response> {
  const [content, theme] = await Promise.all([
    getSiteContent(c.env.DB, cms.tenant.id),
    findThemeById(c.env.DB, cms.tenant.theme_id),
  ]);
  const todayWib = wibDateOf(Date.now());
  const [promos, testimonials] = await Promise.all([
    listActivePromos(c.env.DB, cms.tenant.id, todayWib),
    listTestimonials(c.env.DB, cms.tenant.id, "approved"),
  ]);
  const html = renderKulinerPage({
    site: {
      tenantId: cms.tenant.id,
      slug: cms.tenant.slug,
      name: cms.tenant.name,
      status: "active",
      themeSlug: theme?.slug ?? "hangat",
      tokens: {},
      content,
    },
    promos,
    testimonials,
    baseUrl: `https://${cms.tenant.slug}.${c.env.BASE_DOMAIN}`,
    appBaseUrl: `https://app.${c.env.BASE_DOMAIN}`,
    path,
    todayWib,
    noindex: true,
    basePath: "/pratinjau",
  });
  return c.html(html, 200, { "cache-control": "no-store" });
}

const PREVIEW_PAGES: Record<string, PublicPagePath> = {
  menu: "/menu",
  galeri: "/galeri",
  promo: "/promo",
  testimoni: "/testimoni",
};

export const cmsPratinjau = new Hono<AppEnv>()
  .get("/pratinjau", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    return renderPreview(c, cms, "/");
  })
  .get("/pratinjau/:page", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const path = PREVIEW_PAGES[c.req.param("page")];
    if (!path) return c.redirect("/pratinjau");
    return renderPreview(c, cms, path);
  });
