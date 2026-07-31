export const PUBLIC_CACHE_VERSION = "2";

export function publicCacheKey(hostname: string, pathname: string): string {
  const host = hostname.toLowerCase();
  const path = pathname === "" ? "/" : pathname;
  const sep = path.includes("?") ? "&" : "?";
  return `https://${host}${path}${sep}cv=${PUBLIC_CACHE_VERSION}`;
}

export function isCacheablePublicRequest(method: string): boolean {
  return method === "GET";
}
