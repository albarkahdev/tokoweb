import { Hono } from "hono";
import { storageFromEnv } from "@/db/storage-env";
import type { AppEnv } from "@/env";
import { APP_SCRIPT } from "@/ui/app-script";
import { APP_STYLES } from "@/ui/app-styles";
import { LOGO_SQUARE_PNG_B64, LOGO_WIDE_PNG_B64 } from "@/ui/brand-assets";
import { FONT_FILES } from "@/ui/fonts-css";
import { UPLOAD_SCRIPT } from "@/ui/upload-script";

const FONT_CACHE_CONTROL = "public, max-age=31536000, immutable";

function pngFromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const LOGO_WIDE_PNG = pngFromBase64(LOGO_WIDE_PNG_B64);
const LOGO_SQUARE_PNG = pngFromBase64(LOGO_SQUARE_PNG_B64);

function pngResponse(bytes: Uint8Array) {
  return new Response(bytes, {
    headers: { "content-type": "image/png", "cache-control": FONT_CACHE_CONTROL },
  });
}

export const assets = new Hono<AppEnv>()
  .get("/assets/logo-wide.png", () => pngResponse(LOGO_WIDE_PNG))
  .get("/assets/logo-square.png", () => pngResponse(LOGO_SQUARE_PNG))
  .get("/favicon.ico", () => pngResponse(LOGO_SQUARE_PNG))
  .get("/assets/app.css", (c) =>
    c.text(APP_STYLES, 200, {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "public, max-age=3600",
    }),
  )
  .get("/assets/app.js", (c) =>
    c.text(APP_SCRIPT, 200, {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "public, max-age=3600",
    }),
  )
  .get("/assets/upload.js", (c) =>
    c.text(UPLOAD_SCRIPT, 200, {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "public, max-age=3600",
    }),
  )
  .get("/assets/fonts/:file", async (c) => {
    const file = c.req.param("file");
    if (!(FONT_FILES as readonly string[]).includes(file)) return c.notFound();

    const cacheKey = new Request(c.req.url);
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;

    const object = await storageFromEnv(c.env).get(`fonts/${file}`);
    if (!object) return c.notFound();

    const response = new Response(object.body, {
      headers: {
        "content-type": "font/woff2",
        "cache-control": FONT_CACHE_CONTROL,
        "access-control-allow-origin": "*",
      },
    });
    c.executionCtx.waitUntil(caches.default.put(cacheKey, response.clone()));
    return response;
  });
