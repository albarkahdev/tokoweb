export type Surface =
  | { kind: "app" }
  | { kind: "demo" }
  | { kind: "tenant-public"; tenantSlug: string }
  | { kind: "custom-domain"; hostname: string }
  | { kind: "unknown" };

const RESERVED_SLUGS = new Set(["app", "demo", "www", ""]);

export function resolveSurface(hostname: string, baseDomain: string): Surface {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  const base = baseDomain.toLowerCase();

  if (host === base || host === `www.${base}`) return { kind: "unknown" };
  if (host === `app.${base}`) return { kind: "app" };
  if (host === `demo.${base}`) return { kind: "demo" };

  if (host.endsWith(`.${base}`)) {
    const slug = host.slice(0, -(base.length + 1));
    if (RESERVED_SLUGS.has(slug) || slug.includes(".")) return { kind: "unknown" };
    return { kind: "tenant-public", tenantSlug: slug };
  }

  return { kind: "custom-domain", hostname: host };
}
