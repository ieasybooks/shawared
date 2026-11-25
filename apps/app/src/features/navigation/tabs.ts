import type { IconName } from "../../components/ui/Icon";
import type { StringKey } from "../../lib/i18n";
import { paths } from "../../lib/routes";

/** Desktop sections in reading order. Phones reach meters and rhymes from a poem. */
export const SECTIONS: { name: string; icon: IconName; label: StringKey; path: string }[] = [
  { name: "index", icon: "home", label: "tabHome", path: paths.home },
  { name: "poets", icon: "quill", label: "poets", path: paths.poets },
  { name: "reciters", icon: "mic", label: "reciters", path: paths.reciters },
  { name: "themes", icon: "tag", label: "themes", path: paths.themes },
  { name: "meters", icon: "waves", label: "meters", path: paths.meters },
  { name: "rhymes", icon: "rhymes", label: "rhymes", path: paths.rhymes },
  { name: "library", icon: "library", label: "library", path: paths.library },
];
export const TABS = SECTIONS.filter((section) => section.name !== "meters" && section.name !== "rhymes");

/** The tab a path belongs to (with or without the /en prefix). */
export function tabOf(pathname: string): string {
  const bare = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return SECTIONS.find((t) => t.path !== "/" && (bare === t.path || bare.startsWith(`${t.path}/`)))?.name ?? (bare === "/" ? "index" : "");
}
