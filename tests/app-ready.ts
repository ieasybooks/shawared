import { expect, type Page } from "@playwright/test";

// Network idleness can precede hydration; prerendered controls are already visible then.
export async function waitForApp(page: Page) {
  await expect(page.locator('#root [data-hydrated="true"]')).toBeVisible({ timeout: 15_000 });
}
