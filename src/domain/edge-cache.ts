export function publicCacheKey(hostname: string, pathname: string): string {
  const host = hostname.toLowerCase();
  const path = pathname === "" ? "/" : pathname;
  return `https://${host}${path}`;
}

export function isCacheablePublicRequest(method: string): boolean {
  return method === "GET";
}
