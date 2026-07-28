import { describe, expect, it } from "vitest";
import {
  dailySalt,
  isKnownBot,
  originHostname,
  parseTrackPayload,
  utcDateOf,
  visitorHash,
} from "@/domain/tracker";

describe("parseTrackPayload", () => {
  it("accepts click event without promo id", () => {
    expect(parseTrackPayload({ t: "click_wa", p: "/", pid: null })).toEqual({
      type: "click_wa",
      path: "/",
      promoId: null,
    });
  });

  it("accepts click_promo with positive integer pid", () => {
    expect(parseTrackPayload({ t: "click_promo", p: "/promo", pid: 7 })).toEqual({
      type: "click_promo",
      path: "/promo",
      promoId: 7,
    });
  });

  it("rejects click_promo without pid", () => {
    expect(parseTrackPayload({ t: "click_promo", p: "/", pid: null })).toBeNull();
    expect(parseTrackPayload({ t: "click_promo", p: "/", pid: 1.5 })).toBeNull();
    expect(parseTrackPayload({ t: "click_promo", p: "/", pid: -1 })).toBeNull();
  });

  it("rejects pid on non-promo events", () => {
    expect(parseTrackPayload({ t: "page_view", p: "/", pid: 3 })).toBeNull();
  });

  it("rejects unknown type", () => {
    expect(parseTrackPayload({ t: "click_tiktok", p: "/", pid: null })).toBeNull();
  });

  it("rejects invalid path", () => {
    expect(parseTrackPayload({ t: "page_view", p: "no-slash", pid: null })).toBeNull();
    expect(parseTrackPayload({ t: "page_view", p: `/${"x".repeat(300)}`, pid: null })).toBeNull();
  });

  it("rejects non-object payloads", () => {
    expect(parseTrackPayload(null)).toBeNull();
    expect(parseTrackPayload("page_view")).toBeNull();
  });
});

describe("isKnownBot", () => {
  it("flags known bots and missing user agents", () => {
    expect(isKnownBot("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isKnownBot("curl/8.4.0")).toBe(true);
    expect(isKnownBot(null)).toBe(true);
    expect(isKnownBot("x")).toBe(true);
  });

  it("passes real browsers", () => {
    expect(
      isKnownBot("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Mobile Safari"),
    ).toBe(false);
  });
});

describe("originHostname", () => {
  it("prefers origin over referer", () => {
    expect(originHostname("https://warung.tokoweb.id", "https://other.com/x")).toBe(
      "warung.tokoweb.id",
    );
  });

  it("falls back to referer", () => {
    expect(originHostname(null, "https://warung.tokoweb.id/menu")).toBe("warung.tokoweb.id");
  });

  it("returns null when both missing or malformed", () => {
    expect(originHostname(null, null)).toBeNull();
    expect(originHostname("not-a-url", null)).toBeNull();
  });
});

describe("visitorHash", () => {
  it("is deterministic for same inputs", async () => {
    const salt = await dailySalt("secret", "2026-07-28");
    expect(await visitorHash("1.2.3.4", "UA", 1, salt)).toBe(
      await visitorHash("1.2.3.4", "UA", 1, salt),
    );
  });

  it("changes across day, tenant, and visitor", async () => {
    const saltToday = await dailySalt("secret", "2026-07-28");
    const saltTomorrow = await dailySalt("secret", "2026-07-29");
    const base = await visitorHash("1.2.3.4", "UA", 1, saltToday);
    expect(await visitorHash("1.2.3.4", "UA", 1, saltTomorrow)).not.toBe(base);
    expect(await visitorHash("1.2.3.4", "UA", 2, saltToday)).not.toBe(base);
    expect(await visitorHash("5.6.7.8", "UA", 1, saltToday)).not.toBe(base);
  });
});

describe("utcDateOf", () => {
  it("formats epoch ms as UTC date", () => {
    expect(utcDateOf(Date.UTC(2026, 6, 28, 23, 59))).toBe("2026-07-28");
  });
});
