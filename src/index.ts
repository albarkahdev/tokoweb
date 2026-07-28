import { Hono } from "hono";
import { runDailyJobs, runNightlyMaintenance } from "@/cron";
import { resolveSurface } from "@/domain/hostname";
import type { AppEnv, Bindings } from "@/env";
import { appHost } from "@/routes/app-host";
import { assets } from "@/routes/assets";
import { demo } from "@/routes/demo";
import { health } from "@/routes/health";
import { img } from "@/routes/img";
import { servePublicSite } from "@/routes/public-site";
import { referralPage } from "@/routes/referral-page";
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
      return demo.fetch(c.req.raw, c.env, c.executionCtx);
    case "tenant-public":
    case "custom-domain":
      return servePublicSite(c);
    case "unknown":
      if (new URL(c.req.url).pathname.startsWith("/r/")) {
        return referralPage.fetch(c.req.raw, c.env, c.executionCtx);
      }
      return c.notFound();
  }
});

const worker = {
  fetch: app.fetch,
  scheduled(controller, env, ctx) {
    if (controller.cron === "5 17 * * *") {
      ctx.waitUntil(runNightlyMaintenance(env, controller.scheduledTime));
      return;
    }
    ctx.waitUntil(runDailyJobs(env, controller.scheduledTime));
  },
} satisfies ExportedHandler<Bindings>;

export default worker;
