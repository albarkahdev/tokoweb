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

export function SiteNav(props: {
  brand: string;
  homeHref: string;
  links: { href: string; label: string }[];
  waHref: string;
  withTicker?: boolean;
}) {
  return (
    <nav class={`site-nav${props.withTicker ? " with-ticker" : ""}`}>
      <a class="nav-brand" href={props.homeHref}>
        {props.brand}
      </a>
      <span class="nav-links">
        {props.links.map((link) => (
          <a href={link.href}>{link.label}</a>
        ))}
      </span>
      <a class="nav-wa" data-track="click_wa" href={props.waHref}>
        💬 Pesan
      </a>
    </nav>
  );
}

export function PromoTicker(props: { line: string; href?: string }) {
  const inner = (
    <span class="tk" style={`--tk-dur: ${Math.max(14, props.line.length * 0.35)}s`}>
      <span>{props.line}</span>
      <span aria-hidden="true">{props.line}</span>
    </span>
  );
  if (props.href) {
    return (
      <a class="promo-ticker" href={props.href} aria-label="Lihat semua promo">
        {inner}
      </a>
    );
  }
  return <span class="promo-ticker">{inner}</span>;
}

export function AnnouncementBar(props: { text: string; dismissKey: string }) {
  return (
    <div class="announce-bar" id="announce-bar" data-key={props.dismissKey}>
      <span class="announce-text">📢 {props.text}</span>
      <button
        type="button"
        class="announce-close"
        id="announce-close"
        aria-label="Tutup pengumuman"
      >
        ×
      </button>
    </div>
  );
}

export function OpenBadge(props: { hoursJson: string; forcedClosed?: { reason?: string } | null }) {
  if (props.forcedClosed) {
    return (
      <span id="open-badge" class="open-badge closed" data-forced="1">
        ● Tutup sementara
        {props.forcedClosed.reason ? ` — ${props.forcedClosed.reason}` : ""}
      </span>
    );
  }
  return (
    <span id="open-badge" class="open-badge" data-hours={props.hoursJson}>
      ● Jam buka di bawah
    </span>
  );
}

export function SiteHero(props: {
  variant: "photo" | "typo" | "color-block" | "split" | "poster" | "frame";
  name: string;
  tagline?: string;
  image?: { src: string; alt: string } | null;
  hoursJson: string;
  forcedClosed?: { reason?: string } | null;
  waHref: string;
  menuAnchor?: string;
}) {
  const variant = props.variant === "photo" && !props.image ? "typo" : props.variant;
  const showBackdropImage = variant === "photo" && props.image;
  const showThumb = variant === "typo" && props.image;
  const showSide = variant === "split";
  return (
    <section class={`hero ${variant}`} id="hero">
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
      {variant === "poster" ? (
        <span class="poster-echo" aria-hidden="true">
          {`${props.name} · ${props.name} · ${props.name}`}
        </span>
      ) : null}
      <div class="hero-inner">
        <OpenBadge hoursJson={props.hoursJson} forcedClosed={props.forcedClosed} />
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
      {showSide ? (
        <span class={`hero-side${props.image ? "" : " pattern"}`}>
          {props.image ? (
            <img
              src={props.image.src}
              alt={props.image.alt}
              width="800"
              height="1000"
              fetchpriority="high"
            />
          ) : null}
        </span>
      ) : null}
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
      {props.kicker ? <span class="kicker reveal">{props.kicker}</span> : null}
      {props.title ? <h2 class="sec-title reveal">{props.title}</h2> : null}
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
  photos?: string[];
  featured?: boolean;
  special?: boolean;
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
      {props.special ? <span class="badge-fav badge-special">spesial ⭐</span> : null}
    </h3>
  );
  const popData = JSON.stringify({
    n: props.name,
    p: props.price,
    d: props.desc ?? "",
    f: props.photos ?? (props.imageSrc ? [props.imageSrc] : []),
    w: props.askHref,
  });
  return (
    <div class={`menu-item reveal has-pop${props.imageSrc ? "" : " no-photo"}`} data-mi={popData}>
      <button type="button" class="mi-open" aria-label={`Lihat detail ${props.name}`} />
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
  const popData = JSON.stringify({ t: props.title, d: props.desc ?? "", u: props.until });
  return (
    <div class="promo-card reveal" data-track="click_promo" data-pid={props.id} data-pr={popData}>
      <button type="button" class="pr-open" aria-label={`Lihat detail promo ${props.title}`} />
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

export function TestimonialGrid(props: { children: Child }) {
  return <div class="testi-grid">{props.children}</div>;
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

function ContactRow(props: { icon: string; label: string; value: Child }) {
  return (
    <div class="c-row">
      <span class="c-ico" aria-hidden="true">
        {props.icon}
      </span>
      <span class="c-body">
        <span class="c-label">{props.label}</span>
        <span class="c-value">{props.value}</span>
      </span>
    </div>
  );
}

export function ContactCard(props: {
  address?: string;
  mapsHref?: string;
  phoneHref?: string;
  phoneLabel?: string;
  instagram?: string;
  todayHours?: string;
  waHref: string;
  businessName: string;
}) {
  return (
    <div class="contact-card reveal">
      <div class="c-info">
        {props.address ? (
          <ContactRow
            icon="📍"
            label="Alamat"
            value={
              props.mapsHref ? (
                <a data-track="click_maps" href={props.mapsHref} rel="noopener">
                  {props.address}
                </a>
              ) : (
                props.address
              )
            }
          />
        ) : null}
        {props.todayHours ? (
          <ContactRow icon="🕐" label="Jam buka hari ini" value={props.todayHours} />
        ) : null}
        {props.phoneLabel ? (
          <ContactRow
            icon="📞"
            label="Telepon"
            value={
              props.phoneHref ? (
                <a data-track="click_phone" href={props.phoneHref}>
                  {props.phoneLabel}
                </a>
              ) : (
                props.phoneLabel
              )
            }
          />
        ) : null}
        {props.instagram ? (
          <ContactRow
            icon="📸"
            label="Instagram"
            value={
              <a href={`https://instagram.com/${props.instagram}`} rel="noopener">
                @{props.instagram}
              </a>
            }
          />
        ) : null}
      </div>
      <div class="c-cta">
        <p class="c-pitch">Paling cepat lewat WhatsApp — {props.businessName} balas langsung.</p>
        <a class="btn-wa" data-track="click_wa" href={props.waHref}>
          💬 Chat WhatsApp
        </a>
        {props.mapsHref ? (
          <a class="btn-ghost" data-track="click_maps" href={props.mapsHref} rel="noopener">
            📍 Buka di Maps
          </a>
        ) : null}
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

export function SubpageNav(props: {
  backHref: string;
  backLabel: string;
  pageLabel?: string;
  shareTitle?: string;
}) {
  return (
    <nav class="catnav subnav">
      <a class="back" href={props.backHref}>
        ← {props.backLabel}
      </a>
      {props.pageLabel ? <span class="here">{props.pageLabel}</span> : null}
      {props.shareTitle ? (
        <button class="share-btn" type="button" data-share-title={props.shareTitle}>
          Bagikan ↗
        </button>
      ) : null}
    </nav>
  );
}

export function SectionMoreLink(props: { href: string; label: string }) {
  return (
    <p class="more-menu">
      <a class="btn-ghost" href={props.href}>
        {props.label}
      </a>
    </p>
  );
}
