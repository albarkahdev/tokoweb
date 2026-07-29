import { DAY_KEYS, DAY_LABELS } from "@/domain/cms";
import type { MenuItem } from "@/domain/content";
import { formatRupiah } from "@/domain/money";
import {
  LIGHTBOX_SCRIPT,
  OPEN_NOW_SCRIPT,
  REVEAL_SCRIPT,
  trackerScript,
} from "@/themes/engine/client-scripts";
import { jsonLd, metaDescription, ogImageUrl, pageTitle } from "@/themes/engine/seo";
import { siteCss } from "@/themes/engine/site-css";
import type { RenderData, ThemeConfig } from "@/themes/engine/types";
import { themeConfigFor } from "@/themes/kuliner/configs";
import {
  CategoryNav,
  ContactCard,
  GalleryGrid,
  HoursCard,
  MenuGrid,
  MenuItemCard,
  MoreMenuLink,
  PromoCard,
  PromoTicker,
  SiteDocument,
  SiteFooter,
  SiteHero,
  SiteMain,
  SiteSection,
  TestimonialCard,
  TestimonialGrid,
  WaFloat,
} from "@/ui/site";

const MAX_FEATURED = 7;

type FlatItem = MenuItem & { category: string };

function flattenMenu(data: RenderData): FlatItem[] {
  return (data.site.content.menu ?? []).flatMap((category) =>
    (category.items ?? []).map((item) => ({ ...item, category: category.category ?? "Menu" })),
  );
}

function waLink(waNumber: string, text: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
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
  return (
    <MenuItemCard
      listMode={listMode}
      name={item.name ?? ""}
      price={formatRupiah(item.price ?? 0)}
      desc={item.desc}
      imageSrc={item.image_key ? `/img/${item.image_key}` : null}
      featured={item.featured}
      askHref={waLink(waNumber, `Halo ${businessName}, mau tanya ${item.name}.`)}
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

function HomeSections(props: { data: RenderData; theme: ThemeConfig; waNumber: string }) {
  const { data, theme, waNumber } = props;
  const info = data.site.content.info ?? {};
  const businessName = info.name ?? data.site.name;
  const items = flattenMenu(data);
  const featured = items.filter((item) => item.featured).slice(0, MAX_FEATURED);
  const shown = featured.length > 0 ? featured : items.slice(0, MAX_FEATURED);
  const listMode = theme.layout.menu === "list";
  const menuClass = `menu-${theme.layout.menu === "grid-2" ? "grid-2" : theme.layout.menu}`;
  const gallery = (data.site.content.gallery ?? [])
    .filter((photo) => photo.image_key)
    .map((photo) => ({ src: `/img/${photo.image_key}`, alt: photo.alt ?? "" }));

  return (
    <>
      {data.promos.length > 0 ? (
        <PromoTicker titles={data.promos.map((promo) => promo.title)} />
      ) : null}
      <SiteHero
        variant={theme.layout.hero}
        name={businessName}
        tagline={info.tagline}
        image={heroImage(data)}
        hoursJson={JSON.stringify(data.site.content.hours ?? {})}
        waHref={waLink(waNumber, `Halo ${businessName}, saya mau pesan.`)}
        menuAnchor="#menu"
      />
      <SiteSection id="menu" kicker="Paling laris" title="Menu Andalan" menuVariant={menuClass}>
        <MenuGrid>{shown.map((item) => itemCard(item, businessName, waNumber, listMode))}</MenuGrid>
        {items.length > MAX_FEATURED ? (
          <MoreMenuLink href="/menu" label={`Lihat Menu Lengkap (${items.length} item) →`} />
        ) : null}
      </SiteSection>
      {data.site.content.hours ? (
        <SiteSection id="jam" kicker="Kapan mampir" title="Jam Buka">
          <HoursCard rows={hoursRows(data)} />
        </SiteSection>
      ) : null}
      {data.promos.length > 0 ? (
        <SiteSection id="promo" kicker="Jangan lewatkan" title="Promo">
          {data.promos.map((promo) => (
            <PromoCard
              id={String(promo.id)}
              title={promo.title}
              desc={promo.description}
              until={promo.end_date}
            />
          ))}
        </SiteSection>
      ) : null}
      {gallery.length > 0 ? (
        <SiteSection id="galeri" kicker="Suasana kami" title="Galeri">
          <GalleryGrid photos={gallery} />
        </SiteSection>
      ) : null}
      {data.testimonials.length > 0 ? (
        <SiteSection id="testimoni" kicker="Kata pelanggan" title="Kata Mereka">
          <TestimonialGrid>
            {data.testimonials.map((testimonial) => (
              <TestimonialCard
                body={testimonial.body}
                who={`${testimonial.author_name}${testimonial.rating ? ` · ${"★".repeat(testimonial.rating)}` : ""}`}
              />
            ))}
          </TestimonialGrid>
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
  const categories = data.site.content.menu ?? [];
  const listMode = theme.layout.menu === "list";
  const menuClass = `menu-${theme.layout.menu === "grid-2" ? "grid-2" : theme.layout.menu}`;

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

export function renderKulinerPage(data: RenderData): string {
  const theme = themeConfigFor(data.site.themeSlug);
  const info = data.site.content.info ?? {};
  const waNumber = info.wa_number ?? "";
  const businessName = info.name ?? data.site.name;
  const canonical = `${data.baseUrl}${data.path === "/" ? "" : data.path}`;

  const page = (
    <SiteDocument
      title={pageTitle(data)}
      description={metaDescription(data)}
      canonical={canonical}
      noindex={data.noindex}
      ogImage={ogImageUrl(data)}
      css={siteCss(theme)}
      jsonLd={jsonLd(data)}
      scripts={[trackerScript(data.appBaseUrl), OPEN_NOW_SCRIPT, REVEAL_SCRIPT, LIGHTBOX_SCRIPT]}
    >
      <SiteMain>
        {data.path === "/" ? (
          <HomeSections data={data} theme={theme} waNumber={waNumber} />
        ) : (
          <FullMenuSections data={data} theme={theme} waNumber={waNumber} />
        )}
      </SiteMain>
      <SiteFooter businessName={businessName} />
      <WaFloat waHref={waLink(waNumber, `Halo ${businessName}, saya mau pesan.`)} />
    </SiteDocument>
  );
  return `<!doctype html>${String(page)}`;
}
