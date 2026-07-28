import { DAY_KEYS, DAY_LABELS } from "@/domain/cms";
import type { MenuItem } from "@/domain/content";
import { formatRupiah } from "@/domain/money";
import { OPEN_NOW_SCRIPT, REVEAL_SCRIPT, trackerScript } from "@/themes/engine/client-scripts";
import { jsonLd, metaDescription, ogImageUrl, pageTitle } from "@/themes/engine/seo";
import { siteCss } from "@/themes/engine/site-css";
import type { RenderData, ThemeConfig } from "@/themes/engine/types";
import { themeConfigFor } from "@/themes/kuliner/configs";

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

function Hero(props: { data: RenderData; theme: ThemeConfig; waNumber: string }) {
  const info = props.data.site.content.info ?? {};
  const name = info.name ?? props.data.site.name;
  const image = heroImage(props.data);
  const hours = props.data.site.content.hours ?? {};
  return (
    <section class={`hero ${props.theme.layout.hero}`} id="hero">
      {image ? (
        <img
          class="hero-bg"
          src={image.src}
          alt={image.alt}
          width="1200"
          height="800"
          fetchpriority="high"
        />
      ) : null}
      <div class="hero-inner">
        <span id="open-badge" class="open-badge" data-hours={JSON.stringify(hours)}>
          ● Jam buka di bawah
        </span>
        <h1>{name}</h1>
        {info.tagline ? <p class="tagline">{info.tagline}</p> : null}
        <a
          class="btn-wa"
          data-track="click_wa"
          href={waLink(props.waNumber, `Halo ${name}, saya mau pesan.`)}
        >
          Pesan via WhatsApp
        </a>
      </div>
    </section>
  );
}

function MenuItemCard(props: { item: FlatItem; waNumber: string; businessName: string }) {
  const { item } = props;
  return (
    <div class="menu-item reveal">
      {item.image_key ? (
        <img
          src={`/img/${item.image_key}`}
          alt={item.name ?? ""}
          loading="lazy"
          width="480"
          height="360"
        />
      ) : null}
      <div class="mi-body">
        <h3>
          {item.name} {item.featured ? <span class="badge-fav">favorit 🔥</span> : null}
        </h3>
        <p class="price">{formatRupiah(item.price ?? 0)}</p>
        {item.desc ? <p class="desc">{item.desc}</p> : null}
        <a
          class="ask"
          data-track="click_wa"
          href={waLink(props.waNumber, `Halo ${props.businessName}, mau tanya ${item.name}.`)}
        >
          Tanya via WA →
        </a>
      </div>
    </div>
  );
}

function MenuSection(props: { data: RenderData; theme: ThemeConfig; waNumber: string }) {
  const info = props.data.site.content.info ?? {};
  const businessName = info.name ?? props.data.site.name;
  const items = flattenMenu(props.data);
  const featured = items.filter((item) => item.featured).slice(0, MAX_FEATURED);
  const shown = featured.length > 0 ? featured : items.slice(0, MAX_FEATURED);
  const menuClass = `menu-${props.theme.layout.menu === "grid-2" ? "grid-2" : props.theme.layout.menu}`;
  return (
    <section id="menu" class={menuClass}>
      <h2>Menu Andalan</h2>
      <div class="menu-grid">
        {shown.map((item) => (
          <MenuItemCard item={item} waNumber={props.waNumber} businessName={businessName} />
        ))}
      </div>
      {items.length > MAX_FEATURED ? (
        <p style="margin-top:1.5rem;">
          <a class="btn-ghost" href="/menu">
            Lihat Menu Lengkap ({items.length} item)
          </a>
        </p>
      ) : null}
    </section>
  );
}

function FullMenuPage(props: { data: RenderData; waNumber: string }) {
  const info = props.data.site.content.info ?? {};
  const businessName = info.name ?? props.data.site.name;
  const categories = props.data.site.content.menu ?? [];
  return (
    <>
      <nav class="catnav">
        {categories.map((category, index) => (
          <a href={`#cat-${index}`}>{category.category ?? "Menu"}</a>
        ))}
      </nav>
      {categories.map((category, index) => (
        <section id={`cat-${index}`}>
          <h2>{category.category ?? "Menu"}</h2>
          <div class="menu-grid">
            {(category.items ?? []).map((item) => (
              <MenuItemCard
                item={{ ...item, category: category.category ?? "Menu" }}
                waNumber={props.waNumber}
                businessName={businessName}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function HoursSection(props: { data: RenderData }) {
  const hours = props.data.site.content.hours;
  if (!hours) return null;
  return (
    <section id="jam">
      <h2>Jam Buka</h2>
      <table class="hours-table">
        {DAY_KEYS.map((day) => {
          const window = hours[day];
          return (
            <tr>
              <td>{DAY_LABELS[day]}</td>
              <td>{window ? `${window[0]} – ${window[1]}` : "Tutup"}</td>
            </tr>
          );
        })}
      </table>
    </section>
  );
}

function PromoSection(props: { data: RenderData }) {
  if (props.data.promos.length === 0) return null;
  return (
    <section id="promo">
      <h2>Promo</h2>
      {props.data.promos.map((promo) => (
        <div class="promo-card reveal" data-track="click_promo" data-pid={String(promo.id)}>
          <h3>{promo.title}</h3>
          {promo.description ? <p class="desc">{promo.description}</p> : null}
          <p class="small" style="color:var(--muted); font-size:0.85rem;">
            Berlaku s/d {promo.end_date}
          </p>
        </div>
      ))}
    </section>
  );
}

function GallerySection(props: { data: RenderData }) {
  const gallery = (props.data.site.content.gallery ?? []).filter((photo) => photo.image_key);
  if (gallery.length === 0) return null;
  return (
    <section id="galeri">
      <h2>Galeri</h2>
      <div class="gallery-grid">
        {gallery.map((photo) => (
          <img
            src={`/img/${photo.image_key}`}
            alt={photo.alt ?? ""}
            loading="lazy"
            width="400"
            height="400"
            class="reveal"
          />
        ))}
      </div>
    </section>
  );
}

function TestimonialSection(props: { data: RenderData }) {
  if (props.data.testimonials.length === 0) return null;
  return (
    <section id="testimoni">
      <h2>Kata Mereka</h2>
      {props.data.testimonials.map((testimonial) => (
        <div class="testi reveal">
          <p>"{testimonial.body}"</p>
          <p class="who">
            — {testimonial.author_name}
            {testimonial.rating ? ` · ${"★".repeat(testimonial.rating)}` : ""}
          </p>
        </div>
      ))}
    </section>
  );
}

function ContactSection(props: { data: RenderData; waNumber: string }) {
  const info = props.data.site.content.info ?? {};
  return (
    <section id="kontak" class="contact">
      <h2>Lokasi &amp; Kontak</h2>
      {info.address ? <p>{info.address}</p> : null}
      <div class="row-cta">
        {info.maps_url ? (
          <a class="btn-ghost" data-track="click_maps" href={info.maps_url} rel="noopener">
            Buka di Maps
          </a>
        ) : null}
        {info.phone ? (
          <a class="btn-ghost" data-track="click_phone" href={`tel:${info.phone}`}>
            Telepon
          </a>
        ) : null}
        <a
          class="btn-wa"
          data-track="click_wa"
          href={waLink(props.waNumber, `Halo ${info.name ?? props.data.site.name}!`)}
        >
          Chat WhatsApp
        </a>
      </div>
    </section>
  );
}

export function renderKulinerPage(data: RenderData): string {
  const theme = themeConfigFor(data.site.themeSlug);
  const info = data.site.content.info ?? {};
  const waNumber = info.wa_number ?? "";
  const businessName = info.name ?? data.site.name;
  const canonical = `${data.baseUrl}${data.path === "/" ? "" : data.path}`;
  const og = ogImageUrl(data);

  const page = (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle(data)}</title>
        <meta name="description" content={metaDescription(data)} />
        {data.noindex ? (
          <meta name="robots" content="noindex" />
        ) : (
          <link rel="canonical" href={canonical} />
        )}
        <meta property="og:title" content={pageTitle(data)} />
        <meta property="og:description" content={metaDescription(data)} />
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content={canonical} />
        {og ? <meta property="og:image" content={og} /> : null}
        <meta name="twitter:card" content={og ? "summary_large_image" : "summary"} />
        <style dangerouslySetInnerHTML={{ __html: siteCss(theme) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      </head>
      <body>
        <main>
          {data.path === "/" ? (
            <>
              <Hero data={data} theme={theme} waNumber={waNumber} />
              <MenuSection data={data} theme={theme} waNumber={waNumber} />
              <HoursSection data={data} />
              <PromoSection data={data} />
              <GallerySection data={data} />
              <TestimonialSection data={data} />
              <ContactSection data={data} waNumber={waNumber} />
            </>
          ) : (
            <FullMenuPage data={data} waNumber={waNumber} />
          )}
        </main>
        <footer class="site">
          <p>
            {businessName} · Dibuat dengan{" "}
            <a href="https://tokoweb.id" rel="noopener">
              tokoweb.id
            </a>
          </p>
        </footer>
        <div class="wa-float">
          <a
            class="btn-wa"
            data-track="click_wa"
            href={waLink(waNumber, `Halo ${businessName}, saya mau pesan.`)}
          >
            💬 Pesan via WhatsApp
          </a>
        </div>
        <script dangerouslySetInnerHTML={{ __html: trackerScript(data.appBaseUrl) }} />
        <script dangerouslySetInnerHTML={{ __html: OPEN_NOW_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      </body>
    </html>
  );
  return `<!doctype html>${String(page)}`;
}
