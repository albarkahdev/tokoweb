import { Hono } from "hono";
import { storageFromEnv } from "@/db/storage-env";
import { isValidImageKey } from "@/domain/image-key";
import type { AppEnv } from "@/env";

const IMG_CACHE_CONTROL = "public, max-age=31536000, immutable";

export const img = new Hono<AppEnv>().get("/img/*", async (c) => {
  const key = c.req.path.slice("/img/".length);
  if (!isValidImageKey(key)) return c.notFound();

  const cacheKey = new Request(c.req.url);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const object = await storageFromEnv(c.env).get(key);
  if (!object) return c.notFound();

  const response = new Response(object.body, {
    headers: {
      "content-type": "image/webp",
      "cache-control": IMG_CACHE_CONTROL,
    },
  });
  c.executionCtx.waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
});
