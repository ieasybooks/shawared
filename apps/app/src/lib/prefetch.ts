import { useEffect, useMemo, useRef } from "react";
import { loadPerson, loadPoem } from "./content";
import { contentPage } from "./routes";
import { useSettings } from "./settings";

/** How long a pointer rests on a link before its page's file is fetched: passing over one fetches nothing. */
const HOVER_MS = 60;

function prefetchPage(href: string, lang: string) {
  const page = contentPage(href);
  if (!page) return;
  if (page.kind === "poems") void loadPoem(page.id, lang);
  else void loadPerson(page.kind, page.id, lang);
}

/**
 * For a link's Pressable: resting the pointer on it, or pressing it, starts loading the file
 * its page opens with. A press gives the file a head start of the press itself; a hover, of
 * the time it takes to decide to click.
 */
export function usePrefetch(href: string) {
  const { lang } = useSettings();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), [href, lang]);
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
