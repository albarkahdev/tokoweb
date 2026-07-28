import { Hono } from "hono";
import { findTrackableTenantId } from "@/db/tenants";
import { insertTrackEvent } from "@/db/track-events";
import { createFixedWindowLimiter } from "@/domain/rate-limit";
import {
  dailySalt,
  isKnownBot,
  MAX_TRACK_BODY_BYTES,
  originHostname,
  parseTrackPayload,
  utcDateOf,
  visitorHash,
} from "@/domain/tracker";
import type { AppEnv, Bindings } from "@/env";

const limiter = createFixedWindowLimiter(60, 60_000);

type TrackRequestMeta = {
  bodyText: string;
  originHost: string;
  ip: string;
  userAgent: string;
  nowMs: number;
};

async function recordTrackEvent(env: Bindings, meta: TrackRequestMeta): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(meta.bodyText);
  } catch {
    return;
  }
  const payload = parseTrackPayload(parsed);
  if (!payload) return;

  const tenantId = await findTrackableTenantId(
    env.DB,
    meta.originHost,
    env.BASE_DOMAIN,
    meta.nowMs,
  );
  if (tenantId === null) return;

  const salt = await dailySalt(env.TRACKER_SALT_SECRET, utcDateOf(meta.nowMs));
  const hash = await visitorHash(meta.ip, meta.userAgent, tenantId, salt);
  if (!limiter.allow(`${tenantId}:${hash}`, meta.nowMs)) return;

  await insertTrackEvent(env.DB, tenantId, payload, hash);
}

export const tracker = new Hono<AppEnv>().post("/t", async (c) => {
  const declaredLength = Number(c.req.header("content-length") ?? "0");
  const userAgent = c.req.header("user-agent") ?? null;
  const originHost = originHostname(
    c.req.header("origin") ?? null,
    c.req.header("referer") ?? null,
  );

  const accepted =
    declaredLength <= MAX_TRACK_BODY_BYTES && !isKnownBot(userAgent) && originHost !== null;

  if (accepted) {
    const bodyText = await c.req.text();
    if (bodyText.length > 0 && bodyText.length <= MAX_TRACK_BODY_BYTES) {
      const meta: TrackRequestMeta = {
        bodyText,
        originHost,
        ip: c.req.header("cf-connecting-ip") ?? "0.0.0.0",
        userAgent: userAgent ?? "",
        nowMs: Date.now(),
      };
      c.executionCtx.waitUntil(recordTrackEvent(c.env, meta));
    }
  }

  return c.body(null, 204);
});
