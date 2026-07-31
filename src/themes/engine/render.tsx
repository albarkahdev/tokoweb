import { DAY_KEYS, DAY_LABELS, isItemActive, itemPhotos, trustBadges } from "@/domain/cms";
import type { MenuItem } from "@/domain/content";
import { formatRupiah } from "@/domain/money";
import {
  ANNOUNCE_SCRIPT,
  LIGHTBOX_SCRIPT,
  MENU_POPUP_SCRIPT,
  OPEN_NOW_SCRIPT,
  PROMO_POPUP_SCRIPT,
  REVEAL_SCRIPT,
  SHARE_SCRIPT,
  trackerScript,
} from "@/themes/engine/client-scripts";
import { jsonLd, metaDescription, ogImageUrl, pageTitle } from "@/themes/engine/seo";
import { siteCss } from "@/themes/engine/site-css";
import type { RenderData, ThemeConfig } from "@/themes/engine/types";
import { themeConfigFor } from "@/themes/kuliner/configs";
import {
  AnnouncementBar,
  CategoryNav,
  ContactCard,
  GalleryGrid,
  HoursCard,
  MenuGrid,
  MenuItemCard,
  MoreMenuLink,
  PromoCard,
  PromoTicker,
  SectionMoreLink,
  SiteDocument,
  SiteFooter,
  SiteHero,
  SiteMain,
  SiteNav,
  SiteSection,
  SubpageNav,
  TestimonialCard,
  TestimonialGrid,
  TrustStrip,
  WaFloat,
} from "@/ui/site";

const MAX_FEATURED = 7;
const HOME_PROMOS = 2;
const HOME_GALLERY = 6;
const HOME_TESTIMONIALS = 4;

type FlatItem = MenuItem & { category: string };

function flattenMenu(data: RenderData): FlatItem[] {
  return (data.site.content.menu ?? []).flatMap((category) =>
    (category.items ?? [])
      .filter(isItemActive)
      .map((item) => ({ ...item, category: category.category ?? "Menu" })),
  );
}

function waLink(waNumber: string, text: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

function pageHref(data: RenderData, path: string): string {
  const base = data.basePath ?? "";
  const full = path === "/" ? (data.homePath ?? (base || "/")) : `${base}${path}`;
  return `${full}${data.pageQuery ?? ""}`;
}

function galleryPhotos(data: RenderData): { src: string; alt: string }[] {
  return (data.site.content.gallery ?? [])
    .filter((photo) => photo.image_key)
    .map((photo) => ({ src: `/img/${photo.image_key}`, alt: photo.alt ?? "" }));
}

function heroImage(data: RenderData): { src: string; alt: string } | null {
  const items = flattenMenu(data);
  const featured = items.find((item) => item.featured && item.image_key);
  if (featured?.image_key) {
    return { src: `/img/${featured.image_key}`, alt: featured.name ?? "" };
  }
  const gallery = data.site.content.gallery?.find((photo) => photo.image_key);
  if (gallery?.image_key) return { src: `/img/${gallery.image_key}`, alt: gallery.alt ?? "" };
  return null;
}

function itemCard(item: FlatItem, businessName: string, waNumber: string, listMode: boolean) {
  const photos = itemPhotos(item).map((key) => `/img/${key}`);
  return (
    <MenuItemCard
      listMode={listMode}
      name={item.name ?? ""}
      price={formatRupiah(item.price ?? 0)}
      desc={item.desc}
      imageSrc={photos[0] ?? null}
      photos={photos}
      featured={item.featured}
      special={item.special}
      askHref={waLink(waNumber, `Halo ${businessName}, mau pesan ${item.name}.`)}
    />
  );
}

function hoursRows(data: RenderData) {
  const hours = data.site.content.hours ?? {};
  return DAY_KEYS.map((day) => {
    const window = hours[day];
    return {
      label: DAY_LABELS[day],
      value: window ? `${window[0]} – ${window[1]}` : "Tutup",
      closed: !window,
    };
  });
}

function todayHoursSummary(data: RenderData): string | undefined {
  const hours = data.site.content.hours;
  if (!hours) return undefined;
  const dayIndex = new Date(`${data.todayWib}T00:00:00Z`).getUTCDay();
  const key = DAY_KEYS[(dayIndex + 6) % 7];
  if (!key) return undefined;
  const window = hours[key];
  return window ? `${window[0]} – ${window[1]} WIB` : "Hari ini tutup";
}

const PAGE_LABELS: Record<string, string> = {
  "/menu": "Menu",
  "/galeri": "Galeri",
  "/promo": "Promo",
  "/testimoni": "Testimoni",
};

function navLinks(data: RenderData) {
  const home = pageHref(data, "/");
  const links: { href: string; label: string }[] = [{ href: `${home}#menu`, label: "Menu" }];
  if (data.promos.length > 0) links.push({ href: `${home}#promo`, label: "Promo" });
  if (galleryPhotos(data).length > 0) links.push({ href: `${home}#galeri`, label: "Galeri" });
  if (data.testimonials.length > 0) links.push({ href: `${home}#testimoni`, label: "Testimoni" });
  links.push({ href: `${home}#kontak`, label: "Kontak" });
  return links;
}

function HomeSections(props: { data: RenderData; theme: ThemeConfig; waNumber: string }) {
  const { data, theme, waNumber } = props;
  const info = data.site.content.info ?? {};
  const businessName = info.name ?? data.site.name;
  const items = flattenMenu(data);
  const featured = items.filter((item) => item.featured).slice(0, MAX_FEATURED);
  const shown = featured.length > 0 ? featured : items.slice(0, MAX_FEATURED);
  const listMode = theme.layout.menu === "list";
  const menuClass = `menu-${theme.layout.menu}`;
  const gallery = galleryPhotos(data);
  const specials = items.filter((item) => item.special);
  const trustList = trustBadges(data.site.content.trust);
  const orderHref = data.site.content.order_settings?.enabled
    ? `${data.basePath ?? ""}/pesan`
    : null;

  return (
    <>
      <SiteHero
        variant={theme.layout.hero}
        name={businessName}
        tagline={info.tagline}
        image={heroImage(data)}
        hoursJson={JSON.stringify(data.site.content.hours ?? {})}
        forcedClosed={info.temp_closed?.active ? { reason: info.temp_closed.reason } : null}
        waHref={waLink(waNumber, `Halo ${businessName}, saya mau pesan.`)}
        orderHref={orderHref}
        menuAnchor="#menu"
      />
      {trustList.length > 0 ? <TrustStrip badges={trustList} /> : null}
      {specials.length > 0 ? (
        <SiteSection
          id="spesial"
          kicker="Cuma hari ini"
          title="Spesial Hari Ini ⭐"
          menuVariant={`${menuClass} special-sec`}
        >
          <MenuGrid>
            {specials.map((item) => itemCard(item, businessName, waNumber, listMode))}
          </MenuGrid>
        </SiteSection>
      ) : null}
      {shown.length > 0 ? (
        <SiteSection id="menu" kicker="Paling laris" title="Menu Andalan" menuVariant={menuClass}>
          <MenuGrid>
            {shown.map((item) => itemCard(item, businessName, waNumber, listMode))}
          </MenuGrid>
          {items.length > MAX_FEATURED ? (
            <MoreMenuLink
              href={pageHref(data, "/menu")}
              label={`Lihat Menu Lengkap (${items.length} item) →`}
            />
          ) : null}
        </SiteSection>
      ) : null}
      {data.site.content.hours ? (
        <SiteSection id="jam" kicker="Kapan mampir" title="Jam Buka">
          <HoursCard rows={hoursRows(data)} />
        </SiteSection>
      ) : null}
      {data.promos.length > 0 ? (
        <SiteSection id="promo" kicker="Jangan lewatkan" title="Promo">
          {data.promos.slice(0, HOME_PROMOS).map((promo) => (
            <PromoCard
              id={String(promo.id)}
              title={promo.title}
              desc={promo.description}
              until={promo.end_date}
            />
          ))}
          {data.promos.length > HOME_PROMOS ? (
            <SectionMoreLink
              href={pageHref(data, "/promo")}
              label={`Semua Promo (${data.promos.length}) →`}
            />
          ) : null}
        </SiteSection>
      ) : null}
      {gallery.length > 0 ? (
        <SiteSection id="galeri" kicker="Suasana kami" title="Galeri">
          <GalleryGrid photos={gallery.slice(0, HOME_GALLERY)} />
          {gallery.length > HOME_GALLERY ? (
            <SectionMoreLink
              href={pageHref(data, "/galeri")}
              label={`Lihat Semua Foto (${gallery.length}) →`}
            />
          ) : null}
        </SiteSection>
      ) : null}
      {data.testimonials.length > 0 ? (
        <SiteSection id="testimoni" kicker="Kata pelanggan" title="Kata Mereka">
          <TestimonialGrid>
            {data.testimonials.slice(0, HOME_TESTIMONIALS).map((testimonial) => (
              <TestimonialCard
                body={testimonial.body}
                who={`${testimonial.author_name}${testimonial.rating ? ` · ${"★".repeat(testimonial.rating)}` : ""}`}
              />
            ))}
          </TestimonialGrid>
          {data.testimonials.length > HOME_TESTIMONIALS ? (
            <SectionMoreLink
              href={pageHref(data, "/testimoni")}
              label={`Semua Testimoni (${data.testimonials.length}) →`}
            />
          ) : null}
        </SiteSection>
      ) : null}
      <SiteSection id="kontak" kicker="Mampir atau pesan" title="Lokasi & Kontak">
        <ContactCard
          address={info.address}
          mapsHref={info.maps_url}
          phoneHref={info.phone ? `tel:${info.phone}` : undefined}
          phoneLabel={info.phone}
          instagram={info.instagram}
          todayHours={todayHoursSummary(data)}
          waHref={waLink(waNumber, `Halo ${businessName}!`)}
          businessName={businessName}
        />
      </SiteSection>
    </>
  );
}

function FullMenuSections(props: { data: RenderData; theme: ThemeConfig; waNumber: string }) {
  const { data, theme, waNumber } = props;
  const info = data.site.content.info ?? {};
  const businessName = info.name ?? data.site.name;
  const categories = (data.site.content.menu ?? [])
    .map((category) => ({
      category: category.category,
      items: (category.items ?? []).filter(isItemActive),
    }))
    .filter((category) => category.items.length > 0);
  const listMode = theme.layout.menu === "list";
  const menuClass = `menu-${theme.layout.menu}`;

  return (
    <>
      <CategoryNav
        categories={categories.map((category, index) => ({
          href: `#cat-${index}`,
          label: category.category ?? "Menu",
        }))}
      />
      {categories.map((category, index) => (
        <SiteSection
          id={`cat-${index}`}
          title={category.category ?? "Menu"}
          menuVariant={menuClass}
        >
          <MenuGrid>
            {(category.items ?? []).map((item) =>
              itemCard(
                { ...item, category: category.category ?? "Menu" },
                businessName,
                waNumber,
                listMode,
              ),
            )}
          </MenuGrid>
        </SiteSection>
      ))}
    </>
  );
}

function GallerySections(props: { data: RenderData }) {
  return (
    <SiteSection id="galeri" kicker="Suasana kami" title="Galeri">
      <GalleryGrid photos={galleryPhotos(props.data)} />
    </SiteSection>
  );
}

function PromoSections(props: { data: RenderData }) {
  return (
    <SiteSection id="promo" kicker="Jangan lewatkan" title="Semua Promo">
      {props.data.promos.map((promo) => (
        <PromoCard
          id={String(promo.id)}
          title={promo.title}
          desc={promo.description}
          until={promo.end_date}
        />
      ))}
    </SiteSection>
  );
}

function TestimonialSections(props: { data: RenderData }) {
  return (
    <SiteSection id="testimoni" kicker="Kata pelanggan" title="Semua Testimoni">
      <TestimonialGrid>
        {props.data.testimonials.map((testimonial) => (
          <TestimonialCard
            body={testimonial.body}
            who={`${testimonial.author_name}${testimonial.rating ? ` · ${"★".repeat(testimonial.rating)}` : ""}`}
          />
        ))}
      </TestimonialGrid>
    </SiteSection>
  );
}

function pageSections(data: RenderData, theme: ThemeConfig, waNumber: string) {
  switch (data.path) {
    case "/":
      return <HomeSections data={data} theme={theme} waNumber={waNumber} />;
    case "/menu":
      return <FullMenuSections data={data} theme={theme} waNumber={waNumber} />;
    case "/galeri":
      return <GallerySections data={data} />;
    case "/promo":
      return <PromoSections data={data} />;
    case "/testimoni":
      return <TestimonialSections data={data} />;
  }
}

export function renderKulinerPage(data: RenderData): string {
  const theme = themeConfigFor(data.site.themeSlug);
  const info = data.site.content.info ?? {};
  const waNumber = info.wa_number ?? "";
  const businessName = info.name ?? data.site.name;
  const canonical = `${data.baseUrl}${data.path === "/" ? "" : data.path}`;
  const isHome = data.path === "/";
  const announcement =
    info.announcement?.active && info.announcement.text?.trim()
      ? info.announcement.text.trim()
      : null;
  const hasPromos = data.promos.length > 0;
  const tickerLine = hasPromos
    ? data.promos.map((promo) => `🔥 ${promo.title}`).join("   ✦   ")
    : `✨ ${
        info.ticker_text ??
        `Selamat datang di ${businessName}${info.tagline ? ` — ${info.tagline}` : ""} · Pesan gampang via WhatsApp 💬`
      }`;

  const page = (
    <SiteDocument
      title={pageTitle(data)}
      description={metaDescription(data)}
      canonical={canonical}
      noindex={data.noindex}
      ogImage={ogImageUrl(data)}
      css={siteCss(theme)}
      jsonLd={jsonLd(data)}
      scripts={[
        trackerScript(data.appBaseUrl),
        OPEN_NOW_SCRIPT,
        ANNOUNCE_SCRIPT,
        REVEAL_SCRIPT,
        LIGHTBOX_SCRIPT,
        MENU_POPUP_SCRIPT,
        PROMO_POPUP_SCRIPT,
        SHARE_SCRIPT,
      ]}
    >
      {announcement ? <AnnouncementBar text={announcement} dismissKey={data.site.slug} /> : null}
      {isHome ? <PromoTicker line={tickerLine} href={hasPromos ? "#promo" : undefined} /> : null}
      <SiteNav
        brand={businessName}
        homeHref={pageHref(data, "/")}
        links={navLinks(data)}
        waHref={waLink(waNumber, `Halo ${businessName}, saya mau pesan.`)}
        orderHref={
          data.site.content.order_settings?.enabled ? `${data.basePath ?? ""}/pesan` : null
        }
        withTicker={isHome}
        logoSrc={info.logo_key ? `/img/${info.logo_key}` : null}
      />
      {isHome ? null : (
        <SubpageNav
          backHref={pageHref(data, "/")}
          backLabel="Beranda"
          pageLabel={PAGE_LABELS[data.path]}
          shareTitle={pageTitle(data)}
        />
      )}
      <SiteMain>{pageSections(data, theme, waNumber)}</SiteMain>
      <SiteFooter businessName={businessName} />
      <WaFloat waHref={waLink(waNumber, `Halo ${businessName}, saya mau pesan.`)} />
    </SiteDocument>
  );
  return `<!doctype html>${String(page)}`;
}
