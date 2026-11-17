import { useMemo, useRef } from "react";
import { prefetchPage } from "./content";
import { useSettings } from "./settings";

/** How long a pointer rests on a link before its page's file is fetched: passing over one fetches nothing. */
const HOVER_MS = 60;

/**
 * For a link's Pressable: resting the pointer on it, or pressing it, starts loading the file
 * its page opens with. A press gives the file a head start of the press itself; a hover, of
 * the time it takes to decide to click.
 */
export function usePrefetch(href: string) {
  const { lang } = useSettings();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return useMemo(
    () => ({
      onHoverIn: () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => prefetchPage(href, lang), HOVER_MS);
      },
      onHoverOut: () => clearTimeout(timer.current),
      onPressIn: () => prefetchPage(href, lang),
    }),
    [href, lang],
  );
}
