import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("health endpoint", () => {
  it("returns ok", async () => {
    const response = await SELF.fetch("https://app.tokoweb.id/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns 501 for unbuilt surfaces", async () => {
    const response = await SELF.fetch("https://demo.tokoweb.id/kuliner");
    expect(response.status).toBe(501);
  });

  it("returns 404 for apex domain", async () => {
    const response = await SELF.fetch("https://tokoweb.id/");
    expect(response.status).toBe(404);
  });
});
