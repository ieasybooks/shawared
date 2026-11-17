import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// The browser tests, and the hosting tests, against the export as Cloudflare
// serves it (wrangler dev, apps/app/wrangler.jsonc), with silent stand-ins for
// the recordings served as audio.shawared.com serves them. Build it first with
// `bun run web:build:test`.
export default defineConfig({
  ...base,
  testIgnore: [],
  use: { ...base.use, baseURL: "http://127.0.0.1:8787" },
  webServer: [
    {
      command: "bun run web:preview",
      url: "http://127.0.0.1:8787",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { WRANGLER_SEND_METRICS: "false" },
    },
    { command: "bun scripts/serve-test-audio.ts", url: "http://127.0.0.1:8788/", reuseExistingServer: false, timeout: 30_000 },
  ],
});
