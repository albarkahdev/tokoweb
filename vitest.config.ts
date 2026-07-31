import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrations = await readD1Migrations("migrations");

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: migrations,
          TRACKER_SALT_SECRET: "test-salt-secret",
          AUTH_SECRET: "test-auth-secret",
          TURNSTILE_SECRET: "",
          TURNSTILE_SITE_KEY: "",
          ENVIRONMENT: "test",
          PHONE_NUMBER_ADMIN: "628999",
          BILLING_BANK: "BCA",
          BILLING_ACCOUNT_NO: "1234567890",
          BILLING_ACCOUNT_NAME: "TokoWeb",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    setupFiles: ["./test/apply-migrations.ts"],
  },
});
