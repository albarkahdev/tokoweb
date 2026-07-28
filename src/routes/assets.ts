import { Hono } from "hono";
import { APP_STYLES } from "@/ui/app-styles";
import { UPLOAD_SCRIPT } from "@/ui/upload-script";

export const assets = new Hono()
  .get("/assets/app.css", (c) =>
    c.text(APP_STYLES, 200, {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "public, max-age=3600",
    }),
  )
  .get("/assets/upload.js", (c) =>
    c.text(UPLOAD_SCRIPT, 200, {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "public, max-age=3600",
    }),
  );
