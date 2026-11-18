import type { IconName } from "../../components/ui/Icon";
import type { StringKey } from "../../lib/i18n";
import { paths } from "../../lib/routes";

/** The five tabs, in reading order. */
export const TABS: { name: string; icon: IconName; label: StringKey; path: string }[] = [
  { name: "index", icon: "home", label: "tabHome", path: paths.home },
  { name: "poets", icon: "quill", label: "poets", path: paths.poets },
  { name: "reciters", icon: "mic", label: "reciters", path: paths.reciters },
  { name: "meters", icon: "waves", label: "meters", path: paths.meters },
  { name: "library", icon: "library", label: "library", path: paths.library },
];

/** The tab a path belongs to (with or without the /en prefix). */
export function tabOf(pathname: string): string {
  const bare = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return TABS.find((t) => t.path !== "/" && (bare === t.path || bare.startsWith(`${t.path}/`)))?.name ?? (bare === "/" ? "index" : "");
}
