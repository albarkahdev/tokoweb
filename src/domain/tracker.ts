export const TRACK_EVENT_TYPES = [
  "page_view",
  "click_wa",
  "click_phone",
  "click_maps",
  "click_promo",
] as const;

export type TrackEventType = (typeof TRACK_EVENT_TYPES)[number];

export type TrackPayload = {
  type: TrackEventType;
  path: string;
  promoId: number | null;
};

export const MAX_TRACK_BODY_BYTES = 1024;
const MAX_PATH_LENGTH = 200;

export function parseTrackPayload(raw: unknown): TrackPayload | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { t, p, pid } = raw as Record<string, unknown>;
  if (typeof t !== "string") return null;
  if (!(TRACK_EVENT_TYPES as readonly string[]).includes(t)) return null;
  if (typeof p !== "string" || !p.startsWith("/") || p.length > MAX_PATH_LENGTH) return null;
  const type = t as TrackEventType;
  if (type === "click_promo") {
    if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0) return null;
    return { type, path: p, promoId: pid };
  }
  if (pid !== null && pid !== undefined) return null;
  return { type, path: p, promoId: null };
}

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|curl|wget|python|java|httpclient|headless|phantom|lighthouse|pingdom|uptime|monitor|scrape/i;

export function isKnownBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return BOT_UA_PATTERN.test(userAgent);
}

export function originHostname(origin: string | null, referer: string | null): string | null {
  const source = origin ?? referer;
  if (!source) return null;
  try {
    return new URL(source).hostname.toLowerCase();
  } catch {
    return null;
  }
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function dailySalt(secret: string, utcDate: string): Promise<string> {
  return sha256Hex(`${secret}:${utcDate}`);
}

export function visitorHash(
  ip: string,
  userAgent: string,
  tenantId: number,
  salt: string,
): Promise<string> {
  return sha256Hex(`${ip}:${userAgent}:${tenantId}:${salt}`);
}

export function utcDateOf(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}
