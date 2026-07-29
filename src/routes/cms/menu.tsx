import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import {
  addMenuItem,
  countFeatured,
  formDataToValues,
  MAX_FEATURED_ITEMS,
  parseMenuItemForm,
  removeMenuItem,
} from "@/domain/cms";
import type { SiteContent } from "@/domain/content";
import { formatRupiah } from "@/domain/money";
import type { AppEnv } from "@/env";
import { type CmsContext, CmsPage, html, loadCms, purgeTenantPages } from "@/routes/cms/shared";
import {
  Badge,
  Card,
  CardTitle,
  Cell,
  CellStack,
  EmptyState,
  ListTable,
  Row,
  SubTitle,
  Text,
} from "@/ui/display";
import { Button, CheckboxField, Field, Form, HiddenInput } from "@/ui/form";

function MenuPage(props: {
  cms: CmsContext;
  content: SiteContent;
  notice?: string;
  error?: string;
}) {
  const menu = props.content.menu ?? [];
  const featured = countFeatured(menu);
  return (
    <CmsPage
      title="Menu"
      currentPath="/menu"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>
          Menu{" "}
          <Badge tone={featured > 0 ? "success" : "muted"}>
            {featured}/{MAX_FEATURED_ITEMS} andalan
          </Badge>
        </CardTitle>
        <Text small muted>
          Item "andalan" tampil di halaman depan (maksimal {MAX_FEATURED_ITEMS}).
        </Text>
        {menu.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="Belum ada menu"
            hint="Tambahkan menu pertamamu lewat form di bawah."
          />
        ) : null}
        {menu.map((category, categoryIndex) => (
          <>
            <SubTitle>{category.category}</SubTitle>
            <ListTable headers={["Item", "Harga", ""]}>
              {(category.items ?? []).map((item, itemIndex) => (
                <Row>
                  <CellStack
                    top={
                      <>
                        {item.name} {item.featured ? <Badge tone="success">andalan</Badge> : null}
                      </>
                    }
                    bottom={item.desc}
                  />
                  <Cell>{formatRupiah(item.price ?? 0)}</Cell>
                  <Cell>
                    <Form action="/menu/hapus" confirm={`Hapus ${item.name}?`}>
                      <HiddenInput name="c" value={String(categoryIndex)} />
                      <HiddenInput name="i" value={String(itemIndex)} />
                      <Button variant="danger">Hapus</Button>
                    </Form>
                  </Cell>
                </Row>
              ))}
            </ListTable>
          </>
        ))}
      </Card>
      <Card>
        <CardTitle>Tambah Item</CardTitle>
        <Form action="/menu">
          <Field label="Kategori" name="category" placeholder="Makanan / Minuman" required />
          <Field label="Nama item" name="item_name" required />
          <Field label="Harga (Rp)" name="price" inputmode="numeric" required />
          <Field label="Deskripsi singkat" name="desc" />
          <CheckboxField label="Jadikan andalan (tampil di halaman depan)" name="featured" />
          <Button block>Tambah</Button>
        </Form>
      </Card>
    </CmsPage>
  );
}

export const cmsMenu = new Hono<AppEnv>()
  .get("/menu", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    return c.html(html(<MenuPage cms={cms} content={content} notice={c.req.query("ok")} />));
  })
  .post("/menu", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    if (cms.readOnly) {
      return c.html(
        html(<MenuPage cms={cms} content={content} error="CMS sedang mode baca." />),
        403,
      );
    }
    const parsed = parseMenuItemForm(formDataToValues(await c.req.formData()));
    if (!parsed.ok) {
      return c.html(html(<MenuPage cms={cms} content={content} error={parsed.error} />), 400);
    }
    if (parsed.value.item.featured && countFeatured(content.menu) >= MAX_FEATURED_ITEMS) {
      return c.html(
        html(
          <MenuPage
            cms={cms}
            content={content}
            error={`Item andalan sudah ${MAX_FEATURED_ITEMS}. Hapus tanda andalan item lain dulu.`}
          />,
        ),
        400,
      );
    }
    const menu = addMenuItem(content.menu, parsed.value.category, parsed.value.item);
    await saveSiteContent(c.env.DB, cms.tenant.id, { ...content, menu });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/menu?ok=Item ditambahkan.");
  })
  .post("/menu/hapus", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    if (cms.readOnly) return c.redirect("/menu");
    const values = formDataToValues(await c.req.formData());
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    const menu = removeMenuItem(content.menu, Number(values.c), Number(values.i));
    await saveSiteContent(c.env.DB, cms.tenant.id, { ...content, menu });
    await purgeTenantPages(c, cms.tenant);
    return c.redirect("/menu?ok=Item dihapus.");
  });
