import { publicCacheKey } from "@/domain/edge-cache";

const HTML_CACHE_CONTROL = "public, max-age=60, s-maxage=86400";

export async function matchCachedPage(
  hostname: string,
  pathname: string,
): Promise<Response | null> {
  const cached = await caches.default.match(publicCacheKey(hostname, pathname));
  return cached ?? null;
}

export function buildCacheableHtmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": HTML_CACHE_CONTROL,
    },
  });
}

export async function putCachedPage(
  hostname: string,
  pathname: string,
  response: Response,
): Promise<void> {
  await caches.default.put(publicCacheKey(hostname, pathname), response);
}

export async function invalidateTenantCache(
  hostnames: string[],
  paths: string[] = ["/"],
): Promise<void> {
  await Promise.all(
    hostnames.flatMap((hostname) =>
      paths.map((path) => caches.default.delete(publicCacheKey(hostname, path))),
    ),
  );
}
