export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
export const SLUG_MIN = 3;
export const SLUG_MAX = 32;

export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "demo",
  "api",
  "cms",
  "admin",
  "blog",
  "toko",
  "mitra",
  "mail",
  "email",
  "ftp",
  "static",
  "assets",
  "img",
  "image",
  "cdn",
  "help",
  "support",
  "status",
  "r",
  "o",
  "id",
  "test",
  "staging",
  "dev",
]);

export type SlugStatus = "ok" | "too_short" | "too_long" | "invalid" | "reserved" | "taken";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

export function isSlugReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function slugStatus(slug: string, taken: Iterable<string>): SlugStatus {
  if (slug.length < SLUG_MIN) return "too_short";
  if (slug.length > SLUG_MAX) return "too_long";
  if (!SLUG_PATTERN.test(slug)) return "invalid";
  if (isSlugReserved(slug)) return "reserved";
  for (const t of taken) {
    if (t === slug) return "taken";
  }
  return "ok";
}

export function isSlugUsable(slug: string, taken: Iterable<string>): boolean {
  return slugStatus(slug, taken) === "ok";
}

export function suggestSlug(name: string, taken: Iterable<string>): string {
  const takenSet = new Set(taken);
  let base = slugify(name);
  if (base.length < SLUG_MIN) base = `${base}-toko`.replace(/^-+/, "toko-");
  base = base.slice(0, SLUG_MAX);
  const blocked = (candidate: string) => isSlugReserved(candidate) || takenSet.has(candidate);
  if (!blocked(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const suffix = `-${i}`;
    const candidate = `${base.slice(0, SLUG_MAX - suffix.length)}${suffix}`;
    if (!blocked(candidate)) return candidate;
  }
  return base;
}
