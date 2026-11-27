import type { Page } from "@playwright/test";

/** Records the handlers the page gives the Media Session, to press its buttons as a lock screen or a media key would. */
export async function watchMediaSession(page: Page) {
  await page.addInitScript(() => {
    const handlers: Record<string, ((details: object) => void) | null> = {};
    (window as unknown as { __media: typeof handlers }).__media = handlers;
    const set = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
    navigator.mediaSession.setActionHandler = (action, handler) => {
      handlers[action] = handler as (details: object) => void;
      set(action, handler);
    };
  });
}
export const press = (page: Page, action: string, details: object = {}) =>
  page.evaluate(([a, d]) => (window as unknown as { __media: Record<string, (d: object) => void> }).__media[a as string]!(d as object), [
    action,
    details,
  ] as const);
export const hasHandler = (page: Page, action: string) =>
  page.evaluate((a) => typeof (window as unknown as { __media: Record<string, unknown> }).__media[a] === "function", action);
export const sessionTitle = (page: Page) => page.evaluate(() => navigator.mediaSession.metadata?.title ?? null);
