import { describe, expect, it } from "vitest";
import { createS3Storage } from "@/db/s3-storage";

const storage = createS3Storage({
  endpoint: "https://is3.cloudhost.id",
  bucket: "tokoweb",
  accessKeyId: "test-key",
  secretAccessKey: "test-secret",
});

describe("createS3Storage", () => {
  it("signs url with query credentials and expiry", async () => {
    const url = new URL(await storage.signedUrl("t/warung/menu/a.webp", 3600));
    expect(url.origin).toBe("https://is3.cloudhost.id");
    expect(url.pathname).toBe("/tokoweb/t/warung/menu/a.webp");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("3600");
    expect(url.searchParams.get("X-Amz-Signature")).toBeTruthy();
    expect(url.searchParams.get("X-Amz-Credential")).toContain("test-key");
  });
});
