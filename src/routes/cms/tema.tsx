import { Hono } from "hono";
import { setTenantTheme } from "@/db/tenants";
import { findThemeById, listActiveThemes, type ThemeRow } from "@/db/themes";
import { formDataToValues } from "@/domain/cms";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import { themeConfigFor } from "@/themes/kuliner/configs";
import { Actions, Badge, Card, CardTitle, Text } from "@/ui/display";
import { Button, FilterInput, Form, HiddenInput, LinkButton } from "@/ui/form";

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
      <Card>
        <CardTitle>Cari Tema ({props.themes.length})</CardTitle>
        <FilterInput
          label="Ketik nama atau gaya"
          placeholder="modern, gelap, mewah, playful, animasi, earth…"
        />
      </Card>
      {props.themes.map((theme) => {
        const config = themeConfigFor(theme.slug);
        const tags = config.tags ?? [];
        return (
          <Card filterText={`${theme.name} ${config.character} ${tags.join(" ")}`}>
            <CardTitle>
              {theme.name}{" "}
              {theme.id === props.cms.tenant.theme_id ? (
                <Badge tone="success">dipakai</Badge>
              ) : null}
            </CardTitle>
            <Text small muted>
              {config.character}
            </Text>
            <Text small>
              {tags.map((tag) => (
                <Badge tone="muted">{tag}</Badge>
              ))}
            </Text>
            <Actions>
              <LinkButton
                variant="secondary"
                external
                href={`https://${props.publicHost}/?preview_theme=${theme.slug}`}
              >
                Preview dengan datamu
              </LinkButton>
              {theme.id !== props.cms.tenant.theme_id ? (
                <Form action="/tema">
                  <HiddenInput name="theme_id" value={String(theme.id)} />
                  <Button>Pakai Tema Ini</Button>
                </Form>
              ) : null}
            </Actions>
          </Card>
        );
      })}
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
