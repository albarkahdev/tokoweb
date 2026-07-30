export type ImageSection = "menu" | "gallery" | "promo" | "logo";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const FILENAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.webp$/;

export function buildImageKey(tenantSlug: string, section: ImageSection, filename: string): string {
  if (!SLUG_PATTERN.test(tenantSlug)) {
    throw new Error(`Invalid tenant slug: ${tenantSlug}`);
  }
  if (!FILENAME_PATTERN.test(filename)) {
    throw new Error(`Invalid image filename: ${filename}`);
  }
  return `t/${tenantSlug}/${section}/${filename}`;
}

export function isValidImageKey(key: string): boolean {
  const parts = key.split("/");
  if (parts.length !== 4) return false;
  const [prefix, slug, section, filename] = parts;
  return (
    prefix === "t" &&
    slug !== undefined &&
    SLUG_PATTERN.test(slug) &&
    (section === "menu" || section === "gallery" || section === "promo" || section === "logo") &&
    filename !== undefined &&
    FILENAME_PATTERN.test(filename)
  );
}
