import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:8081";

export default defineConfig({
  testDir: "./tests",
  // Cloudflare's headers and 404s: playwright.release.config.ts runs it.
  testIgnore: "hosting.spec.ts",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? undefined : "chrome",
    launchOptions: {
      args: ["--autoplay-policy=no-user-gesture-required"],
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
  webServer: process.env.BASE_URL ? undefined : { command: "bun run dev", url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
