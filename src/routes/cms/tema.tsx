import { Hono } from "hono";
import { setTenantTheme } from "@/db/tenants";
import { findThemeById, listActiveThemes, type ThemeRow } from "@/db/themes";
import { formDataToValues } from "@/domain/cms";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { Badge, Card } from "@/ui/display";
import { Button, LinkButton } from "@/ui/form";

function TemaPage(props: {
  cms: CmsContext;
  themes: ThemeRow[];
  publicHost: string;
  notice?: string;
  error?: string;
}) {
  return (
    <CmsPage
      title="Ganti Tema"
      currentPath="/tema"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      {props.themes.map((theme) => (
        <Card>
          <h2>
            {theme.name}{" "}
            {theme.id === props.cms.tenant.theme_id ? <Badge tone="success">dipakai</Badge> : null}
          </h2>
          <div class="row-actions">
            <LinkButton
              variant="secondary"
              href={`https://${props.publicHost}/?preview_theme=${theme.slug}`}
            >
              Preview dengan datamu
            </LinkButton>
            {theme.id !== props.cms.tenant.theme_id ? (
              <form method="post" action="/tema">
                <input type="hidden" name="theme_id" value={String(theme.id)} />
                <Button>Pakai Tema Ini</Button>
              </form>
            ) : null}
          </div>
        </Card>
      ))}
    </CmsPage>
  );
}

export const cmsTema = new Hono<AppEnv>()
  .get("/tema", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const themes = await listActiveThemes(c.env.DB, cms.tenant.vertical_id);
    return c.html(
      html(
        <TemaPage
          cms={cms}
          themes={themes}
          publicHost={`${cms.tenant.slug}.${c.env.BASE_DOMAIN}`}
          notice={c.req.query("ok")}
        />,
      ),
    );
  })
  .post("/tema", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/tema");
    const values = formDataToValues(await c.req.formData());
    const theme = await findThemeById(c.env.DB, Number(values.theme_id));
    if (!theme) {
      const themes = await listActiveThemes(c.env.DB, cms.tenant.vertical_id);
      return c.html(
        html(
          <TemaPage
            cms={cms}
            themes={themes}
            publicHost={`${cms.tenant.slug}.${c.env.BASE_DOMAIN}`}
            error="Tema tidak ditemukan."
          />,
        ),
        400,
      );
    }
    await setTenantTheme(c.env.DB, cms.tenant.id, theme.id);
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/tema?ok=Tema diganti. Websitemu sudah tampil baru.");
  });
