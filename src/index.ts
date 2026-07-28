import { Hono } from "hono";
import { runDailyJobs } from "@/cron";
import { resolveSurface } from "@/domain/hostname";
import type { AppEnv, Bindings } from "@/env";
import { appHost } from "@/routes/app-host";
import { assets } from "@/routes/assets";
import { health } from "@/routes/health";
import { img } from "@/routes/img";
import { servePublicSite } from "@/routes/public-site";
import { tracker } from "@/routes/tracker";

const app = new Hono<AppEnv>();

app.route("/", health);
app.route("/", tracker);
app.route("/", assets);
app.route("/", img);

app.all("*", (c) => {
  const surface = resolveSurface(new URL(c.req.url).hostname, c.env.BASE_DOMAIN);

  switch (surface.kind) {
    case "app":
      return appHost.fetch(c.req.raw, c.env, c.executionCtx);
    case "demo":
      return c.text("Demo — segera hadir", 501);
    case "tenant-public":
    case "custom-domain":
      return servePublicSite(c);
    case "unknown":
      return c.notFound();
  }
});

const worker = {
  fetch: app.fetch,
  scheduled(controller, env, ctx) {
    ctx.waitUntil(runDailyJobs(env, controller.scheduledTime));
  },
} satisfies ExportedHandler<Bindings>;

export default worker;
