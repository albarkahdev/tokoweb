import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "@/index";

async function get(path: string): Promise<Response> {
  const ctx = createExecutionContext();
  const res = await app.fetch(new Request(`https://tokoweb.id${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

describe("logo apply", () => {
  it("landing shows wide logo + favicon, no text wordmark", async () => {
    const res = await get("/");
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('src="/assets/logo-wide.png"');
    expect(html).toContain('rel="icon"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).not.toContain("toko<em>web</em>");
  });

  it("logo asset routes serve png", async () => {
    for (const p of ["/assets/logo-wide.png", "/assets/logo-square.png", "/favicon.ico"]) {
      const res = await get(p);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("image/png");
    }
  });
});
