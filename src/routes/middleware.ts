import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { verifySessionToken } from "@/domain/session";
import type { AppEnv } from "@/env";

export const SESSION_COOKIE = "session";

export const attachSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    const payload = await verifySessionToken(token, c.env.AUTH_SECRET, Date.now());
    if (payload) c.set("session", payload);
  }
  await next();
};

export const requireOwner: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = c.get("session");
  if (session?.role !== "owner" || session.tenantId === null) {
    return c.redirect("/masuk");
  }
  await next();
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = c.get("session");
  if (session?.role !== "admin") {
    return c.redirect("/masuk");
  }
  await next();
};

export const rejectCrossOriginWrites: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    const origin = c.req.header("origin");
    if (origin && new URL(origin).host !== new URL(c.req.url).host) {
      return c.text("Forbidden", 403);
    }
  }
  await next();
};
