import { Hono } from "hono";
import { resolveSurface } from "@/domain/hostname";
import type { AppEnv } from "@/env";
import { health } from "@/routes/health";

const app = new Hono<AppEnv>();

app.route("/", health);

app.all("*", (c) => {
  const surface = resolveSurface(new URL(c.req.url).hostname, c.env.BASE_DOMAIN);

  switch (surface.kind) {
    case "app":
      return c.text("CMS & admin — segera hadir", 501);
    case "demo":
      return c.text("Demo — segera hadir", 501);
    case "tenant-public":
    case "custom-domain":
      return c.text("Situs tenant — segera hadir", 501);
    case "unknown":
      return c.notFound();
  }
});

export default app;
