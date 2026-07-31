import { Hono } from "hono";
import { getSiteContent, saveSiteContent } from "@/db/contents";
import { storageFromEnv } from "@/db/storage-env";
import {
  addItemPhoto,
  addMenuItem,
  countFeatured,
  findMenuItem,
  formDataToValues,
  isItemActive,
  itemPhotos,
  MAX_FEATURED_ITEMS,
  MAX_ITEM_PHOTOS,
  parseItemEditForm,
  parseMenuItemForm,
  removeItemPhoto,
  removeMenuItem,
  updateMenuItem,
} from "@/domain/cms";
import type { MenuItem, SiteContent } from "@/domain/content";
import { buildImageKey } from "@/domain/image-key";
import { formatRupiah } from "@/domain/money";
import { generateOneTimeToken } from "@/domain/one-time-token";
import { isItemAvailable } from "@/domain/order";
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
  MediaRow,
  Row,
  SubTitle,
  Text,
  TextLink,
} from "@/ui/display";
import { Button, CheckboxField, Field, FileField, Form, HiddenInput } from "@/ui/form";

const MAX_UPLOAD_BYTES = 512_000;

function itemBadges(item: MenuItem) {
  return (
    <>
      {item.featured ? <Badge tone="success">andalan</Badge> : null}
      {item.special ? <Badge tone="warning">spesial ⭐</Badge> : null}
      {isItemAvailable(item) ? null : <Badge tone="danger">habis</Badge>}
      {isItemActive(item) ? null : <Badge tone="danger">nonaktif</Badge>}
    </>
  );
}

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
          Klik "Kelola" untuk foto (maks {MAX_ITEM_PHOTOS}), menu spesial hari ini, dan
          aktif/nonaktif.
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
                        {item.name} {itemBadges(item)}
                      </>
                    }
                    bottom={`${itemPhotos(item).length} foto${item.desc ? ` · ${item.desc}` : ""}`}
                  />
                  <Cell>{formatRupiah(item.price ?? 0)}</Cell>
                  <Cell>
                    <TextLink href={`/menu/item?c=${categoryIndex}&i=${itemIndex}`}>
                      Kelola
                    </TextLink>
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

function ItemPage(props: {
  cms: CmsContext;
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
  categoryName: string;
  notice?: string;
  error?: string;
}) {
  const { item, categoryIndex, itemIndex } = props;
  const photos = itemPhotos(item);
  const active = isItemActive(item);
  const itemQuery = `c=${categoryIndex}&i=${itemIndex}`;
  return (
    <CmsPage
      title={item.name ?? "Item"}
      currentPath="/menu"
      cms={props.cms}
      notice={props.notice}
      error={props.error}
    >
      <Card>
        <CardTitle>
          {item.name} {itemBadges(item)}
        </CardTitle>
        <Text small muted>
          Kategori {props.categoryName} · <TextLink href="/menu">← Kembali ke Menu</TextLink>
        </Text>
        <Form action={`/menu/item/simpan?${itemQuery}`}>
          <Field label="Nama item" name="item_name" value={item.name} required />
          <Field
            label="Harga (Rp)"
            name="price"
            value={String(item.price ?? "")}
            inputmode="numeric"
            required
          />
          <Field label="Deskripsi singkat" name="desc" value={item.desc} />
          <Button block>Simpan</Button>
        </Form>
      </Card>
      <Card>
        <CardTitle>Status</CardTitle>
        <Text small muted>
          Menu spesial tampil menonjol di bagian "Spesial Hari Ini". Menu nonaktif disembunyikan
          dari website tanpa dihapus.
        </Text>
        <ListTable headers={["Pengaturan", ""]}>
          <Row>
            <Cell>
              Andalan (tampil di depan):{" "}
              {item.featured ? (
                <Badge tone="success">andalan 🔥</Badge>
              ) : (
                <Badge tone="muted">tidak</Badge>
              )}
            </Cell>
            <Cell>
              <Form action={`/menu/item/andalan?${itemQuery}`}>
                <Button variant="secondary">
                  {item.featured ? "Hapus dari andalan" : "Jadikan andalan"}
                </Button>
              </Form>
            </Cell>
          </Row>
          <Row>
            <Cell>
              Spesial hari ini:{" "}
              {item.special ? (
                <Badge tone="warning">aktif ⭐</Badge>
              ) : (
                <Badge tone="muted">tidak</Badge>
              )}
            </Cell>
            <Cell>
              <Form action={`/menu/item/spesial?${itemQuery}`}>
                <Button variant="secondary">
                  {item.special ? "Hapus dari spesial" : "Jadikan spesial"}
                </Button>
              </Form>
            </Cell>
          </Row>
          <Row>
            <Cell>
              Ketersediaan (untuk pesanan online):{" "}
              {isItemAvailable(item) ? (
                <Badge tone="success">ready</Badge>
              ) : (
                <Badge tone="danger">habis</Badge>
              )}
            </Cell>
            <Cell>
              <Form action={`/menu/item/stok?${itemQuery}`}>
                <Button variant={isItemAvailable(item) ? "danger" : "primary"}>
                  {isItemAvailable(item) ? "Tandai habis" : "Tandai ready"}
                </Button>
              </Form>
            </Cell>
          </Row>
          <Row>
            <Cell>
              Status:{" "}
              {active ? <Badge tone="success">aktif</Badge> : <Badge tone="danger">nonaktif</Badge>}
            </Cell>
            <Cell>
              <Form
                action={`/menu/item/status?${itemQuery}`}
                confirm={active ? `Sembunyikan ${item.name} dari website?` : undefined}
              >
                <Button variant={active ? "danger" : "primary"}>
                  {active ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </Form>
            </Cell>
          </Row>
        </ListTable>
      </Card>
      <Card>
        <CardTitle>
          Foto ({photos.length}/{MAX_ITEM_PHOTOS})
        </CardTitle>
        {photos.length === 0 ? (
          <EmptyState
            icon="📷"
            title="Belum ada foto"
            hint="Menu berfoto jauh lebih menggugah — pembeli klik menu untuk lihat detailnya."
          />
        ) : null}
        {photos.map((key, photoIndex) => (
          <MediaRow src={`/img/${key}`} alt={`Foto ${photoIndex + 1}`}>
            <Form action={`/menu/item/foto/hapus?${itemQuery}`} confirm="Hapus foto ini?">
              <HiddenInput name="p" value={String(photoIndex)} />
              <Button variant="danger">Hapus</Button>
            </Form>
          </MediaRow>
        ))}
        {photos.length < MAX_ITEM_PHOTOS ? (
          <Form action={`/menu/item/foto?${itemQuery}`} multipart webpUpload>
            <FileField label="Tambah foto" name="photo" required hint="Otomatis dikompres." />
            <Button block>Unggah</Button>
          </Form>
        ) : null}
      </Card>
      <Card>
        <CardTitle>Hapus Item</CardTitle>
        <Form
          action="/menu/hapus"
          confirm={`Hapus ${item.name} beserta fotonya dari menu? Tidak bisa dibatalkan.`}
        >
          <HiddenInput name="c" value={String(categoryIndex)} />
          <HiddenInput name="i" value={String(itemIndex)} />
          <Button variant="danger" block>
            Hapus item ini
          </Button>
        </Form>
      </Card>
    </CmsPage>
  );
}

type ItemRef = {
  cms: CmsContext;
  content: SiteContent;
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
};

async function loadItem(
  c: Parameters<typeof loadCms>[0],
): Promise<ItemRef | { redirect: string } | null> {
  const cms = await loadCms(c);
  if (!cms) return null;
  const content = await getSiteContent(c.env.DB, cms.tenant.id);
  const categoryIndex = Number(c.req.query("c"));
  const itemIndex = Number(c.req.query("i"));
  const item = findMenuItem(content.menu, categoryIndex, itemIndex);
  if (!item) return { redirect: "/menu" };
  return { cms, content, item, categoryIndex, itemIndex };
}

function isRef(value: ItemRef | { redirect: string }): value is ItemRef {
  return "item" in value;
}

export const cmsMenu = new Hono<AppEnv>()
  .get("/menu", async (c) => {
    const cms = await loadCms(c);
    if (!cms) return c.redirect("/masuk");
    const content = await getSiteContent(c.env.DB, cms.tenant.id);
    return c.html(html(<MenuPage cms={cms} content={content} notice={c.req.query("ok")} />));
  })
  .get("/menu/item", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    return c.html(
      html(
        <ItemPage
          cms={loaded.cms}
          item={loaded.item}
          categoryIndex={loaded.categoryIndex}
          itemIndex={loaded.itemIndex}
          categoryName={loaded.content.menu?.[loaded.categoryIndex]?.category ?? "Menu"}
          notice={c.req.query("ok")}
          error={c.req.query("err")}
        />,
      ),
    );
  })
  .post("/menu/item/simpan", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const parsed = parseItemEditForm(formDataToValues(await c.req.formData()));
    if (!parsed.ok) {
      return c.redirect(`/menu/item?${itemQuery}&err=${encodeURIComponent(parsed.error)}`);
    }
    const menu = updateMenuItem(
      loaded.content.menu,
      loaded.categoryIndex,
      loaded.itemIndex,
      parsed.value,
    );
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, { ...loaded.content, menu });
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(`/menu/item?${itemQuery}&ok=Tersimpan.`);
  })
  .post("/menu/item/status", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const nextActive = !isItemActive(loaded.item);
    const menu = updateMenuItem(loaded.content.menu, loaded.categoryIndex, loaded.itemIndex, {
      active: nextActive ? undefined : false,
    });
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, { ...loaded.content, menu });
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(
      `/menu/item?${itemQuery}&ok=${nextActive ? "Menu diaktifkan." : "Menu disembunyikan dari website."}`,
    );
  })
  .post("/menu/item/stok", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const nextAvailable = !isItemAvailable(loaded.item);
    const menu = updateMenuItem(loaded.content.menu, loaded.categoryIndex, loaded.itemIndex, {
      available: nextAvailable ? undefined : false,
    });
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, { ...loaded.content, menu });
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(
      `/menu/item?${itemQuery}&ok=${nextAvailable ? "Menu ditandai ready." : "Menu ditandai habis."}`,
    );
  })
  .post("/menu/item/andalan", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const nextFeatured = !loaded.item.featured;
    const menu = updateMenuItem(loaded.content.menu, loaded.categoryIndex, loaded.itemIndex, {
      featured: nextFeatured ? true : undefined,
    });
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, { ...loaded.content, menu });
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(
      `/menu/item?${itemQuery}&ok=${nextFeatured ? "Jadi menu andalan 🔥" : "Dihapus dari andalan."}`,
    );
  })
  .post("/menu/item/spesial", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const nextSpecial = !loaded.item.special;
    const menu = updateMenuItem(loaded.content.menu, loaded.categoryIndex, loaded.itemIndex, {
      special: nextSpecial ? true : undefined,
    });
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, { ...loaded.content, menu });
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(
      `/menu/item?${itemQuery}&ok=${nextSpecial ? "Jadi menu spesial hari ini ⭐" : "Dihapus dari spesial."}`,
    );
  })
  .post("/menu/item/foto", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const formData = await c.req.formData();
    const photo = formData.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      return c.redirect(`/menu/item?${itemQuery}&err=Pilih foto dulu.`);
    }
    if (photo.type !== "image/webp" || photo.size > MAX_UPLOAD_BYTES) {
      return c.redirect(
        `/menu/item?${itemQuery}&err=${encodeURIComponent("Format tidak didukung atau terlalu besar (maks 500 KB).")}`,
      );
    }
    const key = buildImageKey(
      loaded.cms.tenant.slug,
      "menu",
      `${generateOneTimeToken().slice(0, 12)}.webp`,
    );
    const added = addItemPhoto(loaded.content.menu, loaded.categoryIndex, loaded.itemIndex, key);
    if (!added.ok) {
      return c.redirect(`/menu/item?${itemQuery}&err=${encodeURIComponent(added.error)}`);
    }
    await storageFromEnv(c.env).put(key, await photo.arrayBuffer(), "image/webp");
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, {
      ...loaded.content,
      menu: added.value,
    });
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(`/menu/item?${itemQuery}&ok=Foto terunggah.`);
  })
  .post("/menu/item/foto/hapus", async (c) => {
    const loaded = await loadItem(c);
    if (!loaded) return c.redirect("/masuk");
    if (!isRef(loaded)) return c.redirect(loaded.redirect);
    if (loaded.cms.readOnly) return c.redirect("/menu");
    const itemQuery = `c=${loaded.categoryIndex}&i=${loaded.itemIndex}`;
    const values = formDataToValues(await c.req.formData());
    const { menu, removedKey } = removeItemPhoto(
      loaded.content.menu,
      loaded.categoryIndex,
      loaded.itemIndex,
      Number(values.p),
    );
    await saveSiteContent(c.env.DB, loaded.cms.tenant.id, { ...loaded.content, menu });
    if (removedKey) {
      c.executionCtx.waitUntil(storageFromEnv(c.env).delete(removedKey));
    }
    await purgeTenantPages(c, loaded.cms.tenant);
    return c.redirect(`/menu/item?${itemQuery}&ok=Foto dihapus.`);
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
