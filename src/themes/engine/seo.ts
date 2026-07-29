import type { RenderData } from "@/themes/engine/types";

const PATH_TITLES: Record<string, string> = {
  "/menu": "Menu Lengkap",
  "/galeri": "Galeri",
  "/promo": "Promo",
  "/testimoni": "Testimoni",
};

export function pageTitle(data: RenderData): string {
  const info = data.site.content.info ?? {};
  const name = info.name ?? data.site.name;
  const suffix = PATH_TITLES[data.path] ?? info.tagline ?? "";
  return suffix ? `${name} — ${suffix}` : name;
}

export function metaDescription(data: RenderData): string {
  const info = data.site.content.info ?? {};
  const base = info.about ?? info.tagline ?? `${info.name ?? data.site.name} — pesan via WhatsApp.`;
  return base.length > 158 ? `${base.slice(0, 155)}…` : base;
}

export function ogImageUrl(data: RenderData): string | null {
  const items = (data.site.content.menu ?? []).flatMap((category) => category.items ?? []);
  const featuredImage = items.find((item) => item.featured && item.image_key)?.image_key;
  const galleryImage = data.site.content.gallery?.[0]?.image_key;
  const key = featuredImage ?? galleryImage;
  return key ? `${data.baseUrl}/img/${key}` : null;
}

export function jsonLd(data: RenderData): string {
  const info = data.site.content.info ?? {};
  const hours = data.site.content.hours ?? {};
  const dayMap: Record<string, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  const openingHours = Object.entries(hours)
    .filter((entry): entry is [string, [string, string]] => entry[1] !== null)
    .map(([day, window]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[day],
      opens: window[0],
      closes: window[1],
    }));

  const image = ogImageUrl(data);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: info.name ?? data.site.name,
    description: metaDescription(data),
    address: info.address,
    telephone: info.phone ?? info.wa_number,
    url: data.baseUrl,
    ...(image ? { image } : {}),
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
  });
}
