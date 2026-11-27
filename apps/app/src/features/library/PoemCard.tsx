import type { Catalog, CatalogPoem, UiLang } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link } from "expo-router";
import { usePrefetch } from "../../lib/prefetch";
import { nameOf } from "../../lib/catalog";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { type PressState } from "../../components/ui/controls";
import { Eq } from "../../components/ui/Eq";
import { responsive, useLayout } from "../../lib/responsive";
import { useStore } from "../../lib/store";
import { player, type Clock } from "../player/player";
import { catalogEntry, type NowItem } from "../player/item";
import { Dir } from "../../components/ui/Dir";
import { Icon } from "../../components/ui/Icon";
import { Half } from "../../components/ui/Measure";
import { abyatCount, clock, meterName, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { rememberList } from "../player/queue";
import { listEdges, type ListEdges } from "./ListEdges";

function facts(poem: CatalogPoem, lang: UiLang) {
  const rec = poem.recitations[0];
  return [meterName(poem.meter, lang), abyatCount(poem.abyat, lang), rec ? clock(rec.duration, lang) : null].filter(Boolean).join(" · ");
}

/**
 * Opening a poem from a list remembers the list: when the poem ends, the next one in it plays.
 * `list` is the poems' ids as the list shows them.
 */
export function useOpenPoem(href: string, poemId: string, list: readonly string[] | undefined) {
  const prefetch = usePrefetch(href);
  return {
    ...prefetch,
    onPressIn: () => {
      prefetch.onPressIn();
      if (list) rememberList(poemId, list);
    },
  };
}

const selectItemId = (s: { item: NowItem | null }) => s.item?.poemId ?? null;
const selectPlaying = (s: Clock) => s.playing;

/** Whether this poem is the one in the player, and playing. */
function useListenState(poemId: string) {
  const current = useStore(player.now, selectItemId) === poemId;
  const playing = useStore(player.clock, selectPlaying) && current;
  return { current, playing };
}

/** The Listen button's face: the play mark (or the moving bars) and "Listen" (or "Pause"). */
function ListenFace({ playing }: { playing: boolean }) {
  const { palette, lang } = useSettings();
  const type = useType();
  return (
    <>
      <View style={styles.listenMark}>
        {playing ? <Eq on color={palette.accent} /> : <Icon name="play" size={12} color={palette.accent} />}
      </View>
      <Text style={[type.labelStrong, { color: palette.accent }]}>{t(lang, playing ? "pause" : "listen")}</Text>
    </>
  );
}

/**
 * The Listen button's place in the card's first line, unseen: as wide as the button over it,
 * so the slash after it sits as close as the "read" label does.
 */
function ListenRoom({ poemId }: { poemId: string }) {
  const { playing } = useListenState(poemId);
  return (
    <View aria-hidden importantForAccessibility="no-hide-descendants" style={[styles.listen, styles.room]}>
      <ListenFace playing={playing} />
    </View>
  );
}

/** "Listen" or "Pause" for a poem in a list: plays it in place, from the list it is in. */
function ListenButton({ poem, catalog, list }: { poem: CatalogPoem; catalog: Catalog; list?: readonly string[] }) {
  const { palette, lang } = useSettings();
  const { current, playing } = useListenState(poem.id);
  const press = () => {
    if (current) return player.toggle();
    if (list) rememberList(poem.id, list);
    const item = catalogEntry(catalog, poem.id, lang);
    if (item) player.play(item);
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t(lang, playing ? "pause" : "listen")}: ${poem.title}`}
      onPress={press}
      style={(s: PressState) => [styles.listen, (s.hovered || s.pressed) && { backgroundColor: palette.fold }]}
    >
      <ListenFace playing={playing} />
    </Pressable>
  );
}

/**
 * A poem on the home page, like an episode: listen or read it, then its title, poet and reciter,
 * its meter and length, and its opening bayt. Tap anywhere to open it; "Listen" plays it here.
 */
export function PoemEntry({
  poem,
  catalog,
  list,
  first,
  last,
}: {
  poem: CatalogPoem;
  catalog: Catalog;
  list?: readonly string[];
} & ListEdges) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const layout = useLayout();
  const rec = poem.recitations[0];
  const reciter = rec ? catalog.reciters[rec.reciter] : undefined;
  const to = href(paths.poem(poem.id));
  const open = useOpenPoem(to, poem.id, list);
  // The header supplies the gap after search. Keep the listen button aligned with its place in the link.
  const top = first ? 0 : space.xxl;
  return (
    <View style={[styles.entry, { borderTopWidth: first ? 0 : 1, borderTopColor: palette.line }]}>
      <Link href={to} asChild>
        <Pressable
          accessibilityRole="link"
          {...open}
          style={StyleSheet.flatten([styles.entryLink, { paddingTop: top }, last && listEdges.last])}
        >
          <View style={styles.actions}>
            {rec?.audio ? (
              <>
                <ListenRoom poemId={poem.id} />
                <Text style={[type.labelStrong, { color: palette.line2 }]}>/</Text>
              </>
            ) : null}
            <Text style={[type.labelStrong, { color: palette.accent }]}>{t(lang, "read")}</Text>
          </View>
          <View style={styles.titles}>
            <Text style={[type.cardTitle, styles.rtl, { color: palette.fg, textAlign: start }]}>{poem.title}</Text>
            {lang === "en" && poem.titles.en && <Text style={[type.subtitle, { color: palette.muted }]}>{poem.titles.en}</Text>}
          </View>
          <View style={styles.byline}>
            <Text style={[type.controlStrong, { color: palette.fg }]}>{nameOf(catalog.poets[poem.poet], lang)}</Text>
            {reciter && (
              <>
                <Text style={[type.control, { color: palette.line2 }]}>·</Text>
                <Icon name="mic" size={14} color={palette.muted} />
                <Text style={[type.control, { color: palette.muted }]}>{nameOf(reciter, lang)}</Text>
              </>
            )}
          </View>
          <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{facts(poem, lang)}</Text>
          <Dir
            dir="rtl"
            lang="ar"
            style={[styles.opening, layout.style(sized.opening), { backgroundColor: palette.fold, borderColor: palette.line }]}
          >
            <Half
              text={poem.opening.sadr}
              kashida={poem.kashida[`${poem.opening.n}.1`]}
              measure={poem.measure}
              style={[type.verseSmall, { color: palette.muted }]}
              side="start"
              indent="8%"
            />
            <Half
              text={poem.opening.ajuz}
              kashida={poem.kashida[`${poem.opening.n}.2`]}
              measure={poem.measure}
              style={[type.verseSmall, { color: palette.muted }]}
              side="end"
              indent="8%"
            />
          </Dir>
        </Pressable>
      </Link>
      {rec?.audio && (
        <View style={[styles.listenAt, { top }]}>
          <ListenButton poem={poem} catalog={catalog} {...(list ? { list } : {})} />
        </View>
      )}
    </View>
  );
}

/** A poem in a list: its title, and who and how long. */
export function PoemRow({
  poem,
  catalog,
  show,
  list,
  disclosure,
  first,
  last,
}: {
  poem: CatalogPoem;
  catalog: Catalog;
  show: "poet" | "reciter";
  list?: readonly string[];
  disclosure?: boolean;
} & ListEdges) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const rec = poem.recitations[0];
  const who =
    show === "poet"
      ? nameOf(catalog.poets[poem.poet], lang)
      : rec
        ? t(lang, "recitedBy", { name: nameOf(catalog.reciters[rec.reciter], lang) })
        : "";
  const to = href(paths.poem(poem.id));
  const open = useOpenPoem(to, poem.id, list);
  return (
    <Link href={to} asChild>
      <Pressable
        accessibilityRole="link"
        {...open}
        style={StyleSheet.flatten([styles.row, { borderTopColor: palette.line }, first && listEdges.first, last && listEdges.last])}
      >
        <View style={styles.rowBody}>
          <View style={styles.rowText}>
            <Text style={[type.listTitle, styles.rtl, { color: palette.fg, textAlign: start }]}>{poem.title}</Text>
            <Text style={[type.label, { color: palette.muted, textAlign: start }]}>
              {[who, facts(poem, lang)].filter(Boolean).join(" · ")}
            </Text>
          </View>
          {disclosure && <Icon name="chevron" size={15} color={palette.muted} />}
        </View>
      </Pressable>
    </Link>
  );
}

const sized = {
  // The opening bayt: stacked on phones, its halves side by side on wide windows.
  opening: responsive(
    { flexDirection: "column" as const, alignItems: "stretch" as const, paddingStart: 14, paddingEnd: 14 },
    { flexDirection: "row" as const, alignItems: "center" as const, paddingStart: 28, paddingEnd: 28 },
  ),
};

const styles = StyleSheet.create({
  entry: { position: "relative" },
  entryLink: { paddingBottom: space.xxl, gap: space.l },
  actions: { flexDirection: "row", alignItems: "center", gap: space.m, minHeight: 28 },
  listenAt: { position: "absolute", start: 0 },
  listen: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    height: 28,
    borderRadius: 8,
    paddingHorizontal: space.xs,
  },
  // Unseen, and its inner padding taken back, so the gap to the slash is the actions' own.
  room: { opacity: 0, marginEnd: -space.xs },
  // The play mark and the bars take the same room, so "Pause" sits where "Listen" did.
  listenMark: { width: 12, alignItems: "center" },
  titles: { gap: space.xs },
  rtl: { writingDirection: "rtl" },
  byline: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space.s },
  opening: { borderRadius: 12, borderWidth: 1, paddingVertical: space.m, justifyContent: "space-between", gap: space.xs },
  row: { borderTopWidth: 1, paddingVertical: space.xl, gap: space.s, minHeight: 44, justifyContent: "center" },
  rowBody: { flexDirection: "row", alignItems: "center", gap: space.m },
  rowText: { flex: 1, minWidth: 0, gap: space.s },
});
