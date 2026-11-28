import type { IconName } from "../../components/ui/Icon";
import type { StringKey } from "../../lib/i18n";
import { pathInLang, paths } from "../../lib/routes";

/** Desktop sections in reading order. Phones reach meters and rhymes from a poem. */
export const SECTIONS: { name: string; icon: IconName; label: StringKey; path: string; tab: boolean }[] = [
  { name: "index", icon: "home", label: "tabHome", path: paths.home, tab: true },
  { name: "poets", icon: "quill", label: "poets", path: paths.poets, tab: true },
  { name: "reciters", icon: "mic", label: "reciters", path: paths.reciters, tab: true },
  { name: "themes", icon: "tag", label: "themes", path: paths.themes, tab: true },
  { name: "meters", icon: "waves", label: "meters", path: paths.meters, tab: false },
  { name: "rhymes", icon: "rhymes", label: "rhymes", path: paths.rhymes, tab: false },
  { name: "library", icon: "library", label: "library", path: paths.library, tab: true },
];
export const TABS = SECTIONS.filter((section) => section.tab);

/** The tab a path belongs to (with or without the /en prefix). */
export function tabOf(pathname: string): string {
  const bare = pathInLang(pathname, "ar") || "/";
  return SECTIONS.find((t) => t.path !== "/" && (bare === t.path || bare.startsWith(`${t.path}/`)))?.name ?? (bare === "/" ? "index" : "");
}
