import { expect, type Page } from "@playwright/test";

/** Find a row even when the virtual list has not mounted it yet. */
export async function scrollToRow(page: Page, text: string) {
  const row = page.getByText(text, { exact: true }).and(page.locator(":not([inert]):not([inert] *)")).filter({ visible: true }).first();
  await page.waitForLoadState("networkidle");

  // The list can unmount a buffered row while it measures the rows ahead of it.
  const inViewport = () =>
    row.evaluateAll(([element]) => {
      if (!element) return false;
      return new Promise<boolean>((resolve) => {
        const observer = new IntersectionObserver(([entry]) => {
          observer.disconnect();
          resolve(element.isConnected && entry!.intersectionRatio > 0);
        });
        observer.observe(element);
      });
    });

  let fromStart = true;
  while (!(await inViewport())) {
    const moved = await page.evaluate(async (reset) => {
      let moved = false;
      for (const el of document.querySelectorAll("div")) {
        if (!el.clientHeight || el.scrollHeight <= el.clientHeight || el.closest("[inert]")) continue;
        const overflow = getComputedStyle(el).overflowY;
        if (overflow !== "auto" && overflow !== "scroll") continue;
        const previous = el.scrollTop;
        el.scrollTop = reset ? 0 : previous + el.clientHeight / 2;
        if (el.scrollTop !== previous) moved = true;
      }
      // Let the virtual list mount the rows exposed by this scroll.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return moved;
    }, fromStart);
    if (!fromStart && !moved) break;
    fromStart = false;
  }

  await expect(row).toBeInViewport();
  return row;
}
