import type { Child } from "hono/jsx";

export function SiteDocument(props: {
  lang?: string;
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  ogImage?: string | null;
  css: string;
  jsonLd: string;
  children: Child;
  scripts: string[];
}) {
  return (
    <html lang={props.lang ?? "id"}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        <meta name="description" content={props.description} />
        {props.noindex ? (
          <meta name="robots" content="noindex" />
        ) : (
          <link rel="canonical" href={props.canonical} />
        )}
        <meta property="og:title" content={props.title} />
        <meta property="og:description" content={props.description} />
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content={props.canonical} />
        {props.ogImage ? <meta property="og:image" content={props.ogImage} /> : null}
        <meta name="twitter:card" content={props.ogImage ? "summary_large_image" : "summary"} />
        <style dangerouslySetInnerHTML={{ __html: props.css }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: props.jsonLd }} />
      </head>
      <body>
        {props.children}
        {props.scripts.map((script) => (
          <script dangerouslySetInnerHTML={{ __html: script }} />
        ))}
      </body>
    </html>
  );
}

export function SiteMain(props: { children: Child }) {
  return <main>{props.children}</main>;
}

export function OpenBadge(props: { hoursJson: string }) {
  return (
    <span id="open-badge" class="open-badge" data-hours={props.hoursJson}>
      ● Jam buka di bawah
    </span>
  );
}

export function SiteHero(props: {
  variant: "photo" | "typo" | "color-block";
  name: string;
  tagline?: string;
  image?: { src: string; alt: string } | null;
  hoursJson: string;
  waHref: string;
  menuAnchor?: string;
}) {
  const showBackdropImage = props.variant === "photo" && props.image;
  const showThumb = props.variant === "typo" && props.image;
  return (
    <section
      class={`hero ${props.variant === "photo" && !props.image ? "typo" : props.variant}`}
      id="hero"
    >
      {showBackdropImage ? (
        <img
          class="hero-img"
          src={props.image?.src}
          alt={props.image?.alt}
          width="1200"
          height="800"
          fetchpriority="high"
        />
      ) : null}
      {showBackdropImage ? <span class="scrim" /> : null}
      <div class="hero-inner">
        <OpenBadge hoursJson={props.hoursJson} />
        <h1>{props.name}</h1>
        {props.tagline ? <p class="tagline">{props.tagline}</p> : null}
        <div class="hero-cta">
          <a class="btn-wa" data-track="click_wa" href={props.waHref}>
            💬 Pesan via WhatsApp
          </a>
          {props.menuAnchor ? (
            <a class="btn-ghost" href={props.menuAnchor}>
              Lihat Menu ↓
            </a>
          ) : null}
        </div>
      </div>
      {showThumb ? (
        <span class="hero-thumb">
          <img src={props.image?.src} alt={props.image?.alt} width="480" height="360" />
        </span>
      ) : null}
    </section>
  );
}

export function SiteSection(props: {
  id: string;
  kicker?: string;
  title?: string;
  menuVariant?: string;
  children: Child;
}) {
  return (
    <section id={props.id} class={props.menuVariant}>
      {props.kicker ? <span class="kicker">{props.kicker}</span> : null}
      {props.title ? <h2 class="sec-title">{props.title}</h2> : null}
      {props.children}
    </section>
  );
}

export function MenuGrid(props: { children: Child }) {
  return <div class="menu-grid">{props.children}</div>;
}

export function MenuItemCard(props: {
  listMode: boolean;
  name: string;
  price: string;
  desc?: string;
  imageSrc?: string | null;
  featured?: boolean;
  askHref: string;
}) {
  const photo = props.imageSrc ? (
    <img
      class="mi-photo"
      src={props.imageSrc}
      alt={props.name}
      loading="lazy"
      width="480"
      height="360"
    />
  ) : null;
  const title = (
    <h3>
      {props.name} {props.featured ? <span class="badge-fav">favorit 🔥</span> : null}
    </h3>
  );
  return (
    <div class={`menu-item reveal${props.imageSrc ? "" : " no-photo"}`}>
      {photo}
      <div class="mi-body">
        {props.listMode ? (
          <div class="mi-head">
            {title}
            <span class="leader" />
            <span class="price">{props.price}</span>
          </div>
        ) : (
          <>
            {title}
            <span class="price">{props.price}</span>
          </>
        )}
        {props.desc ? <p class="desc">{props.desc}</p> : null}
        <a class="ask" data-track="click_wa" href={props.askHref}>
          Tanya via WA →
        </a>
      </div>
    </div>
  );
}

export function MoreMenuLink(props: { href: string; label: string }) {
  return (
    <p class="more-menu">
      <a class="btn-ghost" href={props.href}>
        {props.label}
      </a>
    </p>
  );
}

export function HoursCard(props: { rows: { label: string; value: string; closed: boolean }[] }) {
  return (
    <div class="hours-card reveal">
      <table class="hours-table">
        {props.rows.map((row) => (
          <tr class={row.closed ? "closed-day" : undefined}>
            <td>{row.label}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export function PromoCard(props: {
  id: string;
  title: string;
  desc?: string | null;
  until: string;
}) {
  return (
    <div class="promo-card reveal" data-track="click_promo" data-pid={props.id}>
      <h3>{props.title}</h3>
      {props.desc ? <p class="desc">{props.desc}</p> : null}
      <span class="until">Berlaku s/d {props.until}</span>
    </div>
  );
}

export function GalleryGrid(props: { photos: { src: string; alt: string }[] }) {
  return (
    <div class="gallery-grid">
      {props.photos.map((photo) => (
        <span class="ph reveal">
          <img src={photo.src} alt={photo.alt} loading="lazy" width="400" height="400" />
        </span>
      ))}
    </div>
  );
}

export function TestimonialCard(props: { body: string; who: string }) {
  return (
    <div class="testi reveal">
      <span class="qmark">"</span>
      <p class="body">{props.body}</p>
      <p class="who">— {props.who}</p>
    </div>
  );
}

export function ContactCard(props: {
  address?: string;
  mapsHref?: string;
  phoneHref?: string;
  waHref: string;
}) {
  return (
    <div class="contact-card reveal">
      {props.address ? <p class="addr">{props.address}</p> : null}
      <div class="row-cta">
        {props.mapsHref ? (
          <a class="btn-ghost" data-track="click_maps" href={props.mapsHref} rel="noopener">
            📍 Buka Maps
          </a>
        ) : null}
        {props.phoneHref ? (
          <a class="btn-ghost" data-track="click_phone" href={props.phoneHref}>
            📞 Telepon
          </a>
        ) : null}
        <a class="btn-wa" data-track="click_wa" href={props.waHref}>
          💬 Chat WhatsApp
        </a>
      </div>
    </div>
  );
}

export function SiteFooter(props: { businessName: string }) {
  return (
    <footer class="site">
      <p>
        {props.businessName} · Dibuat dengan{" "}
        <a href="https://tokoweb.id" rel="noopener">
          tokoweb.id
        </a>
      </p>
    </footer>
  );
}

export function WaFloat(props: { waHref: string }) {
  return (
    <div class="wa-float">
      <a class="btn-wa" data-track="click_wa" href={props.waHref}>
        💬 Pesan via WhatsApp
      </a>
    </div>
  );
}

export function CategoryNav(props: { categories: { href: string; label: string }[] }) {
  return (
    <nav class="catnav">
      {props.categories.map((category) => (
        <a href={category.href}>{category.label}</a>
      ))}
    </nav>
  );
}
