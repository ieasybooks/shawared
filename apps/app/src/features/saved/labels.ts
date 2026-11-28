import type { UiLang } from "@shawared/contracts";
import { poemsCount, t } from "../../lib/i18n";
import type { Playlist } from "./model";

export const playlistName = (playlist: Pick<Playlist, "name">, lang: UiLang) => playlist.name || t(lang, "untitled");

export const playlistFacts = (count: number, seconds: number, lang: UiLang) =>
  [poemsCount(count, lang), count ? t(lang, "minutes", { m: Math.max(1, Math.round(seconds / 60)) }) : null].filter(Boolean).join(" · ");
