import type { Catalog, CatalogPerson, CatalogPoem, PersonKind } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Link, router } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Chip, IconButton } from "../../components/ui/controls";
import { Dialog } from "../../components/ui/Dialog";
import { CoverTile } from "../../components/ui/Girih";
import { Icon } from "../../components/ui/Icon";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { canDownload, downloadsStore, remove, type Downloads } from "../../lib/downloads";
import { digits, poemsCount, sizeOf, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSaved, useSavedLoaded } from "../../lib/saved";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";
import { useType } from "../../lib/type";
import { ListPage, PageFrame, SectionHead } from "../library/Page";
import { PoemRow } from "../library/PoemCard";
import { listEdges, type ListEdges } from "../library/ListEdges";
import { PersonRow } from "../people/PeopleScreens";
import { newPlaylist, playList, playlistName } from "./actions";
import { useDownload } from "./DownloadButton";
import { NAME_MAX, type Playlist, type Saved } from "./model";

type Item =
  | { k: "head"; key: string; title: string; count?: string; action?: ReactNode }
  | { k: "text"; key: string; text: string }
  | { k: "new" }
  | { k: "playlist"; playlist: Playlist }
  | { k: "poem"; key: string; poem: CatalogPoem; list: string[] }
  | { k: "person"; kind: PersonKind; person: CatalogPerson }
  | { k: "download"; poem: CatalogPoem; list: string[] };

const keyOf = (i: Item) =>
  i.k === "head" || i.k === "text" || i.k === "poem"
    ? i.key
    : i.k === "new"
      ? "new"
      : i.k === "playlist"
        ? `pl:${i.playlist.id}`
        : i.k === "person"
          ? `${i.kind}:${i.person.id}`
          : `dl:${i.poem.id}`;

const selectAll = (s: Saved) => s;
const selectDone = (s: Downloads) => s.done;

/** The reader's library: their playlists, favourite poems, poets and reciters, and (the apps) downloads. */
export function LibraryScreen() {
  const { lang, href } = useSettings();
  const catalog = useCatalog();
  const loaded = useSavedLoaded();
  const saved = useSaved(selectAll);
  const done = useStore(downloadsStore, selectDone);
  const [naming, setNaming] = useState(false);
  const title = t(lang, "library");
  const items = useMemo(
    () => (catalog.data && loaded ? itemsOf(catalog.data, saved, done, lang) : []),
    [catalog.data, loaded, saved, done, lang],
  );
  if (!catalog.data)
    return (
      <PageFrame title={title}>
        <StateView error={catalog.error} onRetry={catalog.retry} />
      </PageFrame>
    );
  return (
    <>
      <ListPage
        title={title}
        data={items}
        keyOf={keyOf}
        renderItem={(item, i) => (
          <Row
            item={item}
            catalog={catalog.data!}
            onNew={() => setNaming(true)}
            first={i === 0 || items[i - 1]?.k === "head"}
            last={i === items.length - 1 || items[i + 1]?.k === "head" || items[i + 1]?.k === "text"}
          />
        )}
        estimatedItemSize={72}
      />
      <Dialog
        open={naming}
        title={t(lang, "newPlaylist")}
        input={{ label: t(lang, "playlistName"), initial: "", maxLength: NAME_MAX }}
        confirm={t(lang, "create")}
        onConfirm={(name) => router.push(href(paths.playlist(newPlaylist(name))))}
        onClose={() => setNaming(false)}
      />
    </>
  );
}

function itemsOf(catalog: Catalog, saved: Saved, done: Record<string, number>, lang: "ar" | "en"): Item[] {
  const poems = new Map(catalog.poems.map((p) => [p.id, p] as const));
  const items: Item[] = [];
  const empty = !saved.playlists.length && !saved.poems.length && !saved.poets.length && !saved.reciters.length;
  if (empty) items.push({ k: "text", key: "empty", text: t(lang, "libraryEmpty") });

  items.push({
    k: "head",
    key: "h:playlists",
    title: t(lang, "playlists"),
    ...(saved.playlists.length ? { count: digits(saved.playlists.length, lang) } : {}),
  });
  for (const playlist of saved.playlists) items.push({ k: "playlist", playlist });
  items.push({ k: "new" });

  const favs = saved.poems.filter((id) => poems.has(id));
  if (favs.length) {
    items.push({
      k: "head",
      key: "h:poems",
      title: t(lang, "favPoems"),
      count: poemsCount(favs.length, lang),
      action: <PlayAll ids={favs} />,
    });
    for (const id of favs) items.push({ k: "poem", key: `fav:${id}`, poem: poems.get(id)!, list: favs });
  }
  for (const kind of ["poets", "reciters"] as const) {
    const people = saved[kind].map((id) => catalog[kind][id]).filter((p): p is CatalogPerson => !!p);
    if (!people.length) continue;
    items.push({
      k: "head",
      key: `h:${kind}`,
      title: t(lang, kind === "poets" ? "favPoets" : "favReciters"),
      count: digits(people.length, lang),
    });
    for (const person of people) items.push({ k: "person", kind, person });
  }

  if (canDownload) {
    const downloaded = catalog.poems.filter((p) => p.recitations[0]?.audio && done[p.recitations[0].audio] !== undefined);
    if (downloaded.length) {
      const bytes = downloaded.reduce((sum, p) => sum + (done[p.recitations[0]!.audio!] ?? 0), 0);
      const list = downloaded.map((p) => p.id);
      items.push({
        k: "head",
        key: "h:downloads",
        title: t(lang, "downloads"),
        count: `${poemsCount(downloaded.length, lang)} · ${sizeOf(bytes, lang)}`,
      });
      for (const poem of downloaded) items.push({ k: "download", poem, list });
    }
  }
  items.push({ k: "text", key: "where", text: t(lang, Platform.OS === "web" ? "savedWeb" : "savedApp") });
  return items;
}

function Row({ item, catalog, onNew, ...edges }: { item: Item; catalog: Catalog; onNew: () => void } & ListEdges) {
  const { palette, start } = useSettings();
  const type = useType();
  switch (item.k) {
    case "head":
      return (
        <View style={styles.head}>
          <View style={styles.flex}>
            <SectionHead title={item.title} {...(item.count ? { count: item.count } : {})} />
          </View>
          {item.action}
        </View>
      );
    case "text":
      return (
        <View style={[styles.text, edges.first && listEdges.first, edges.last && listEdges.last]}>
          <Text style={[type.body, { color: palette.muted, textAlign: start }]}>{item.text}</Text>
        </View>
      );
    case "new":
      return <NewPlaylistRow onPress={onNew} {...edges} />;
    case "playlist":
      return <PlaylistRow playlist={item.playlist} catalog={catalog} {...edges} />;
    case "poem":
      return <PoemRow poem={item.poem} catalog={catalog} show="poet" list={item.list} {...edges} />;
    case "person":
      return <PersonRow kind={item.kind} person={item.person} {...edges} />;
    case "download":
      return <DownloadRow poem={item.poem} catalog={catalog} list={item.list} {...edges} />;
  }
}

/** Plays a list from its first poem. */
export function PlayAll({ ids }: { ids: readonly string[] }) {
  const { lang } = useSettings();
  return (
    <Chip icon="play" onPress={() => playList(ids, lang)}>
      {t(lang, "playAll")}
    </Chip>
  );
}

function NewPlaylistRow({ onPress, first, last }: { onPress: () => void } & ListEdges) {
  const { palette, lang } = useSettings();
  const type = useType();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, styles.inline, { borderTopColor: palette.line }, first && listEdges.first, last && listEdges.last]}
    >
      <View style={[styles.badge, styles.dashed, { borderColor: palette.line2 }]}>
        <Icon name="plus" size={20} color={palette.fg} />
      </View>
      <Text style={[type.controlStrong, { color: palette.fg }]}>{t(lang, "newPlaylist")}</Text>
    </Pressable>
  );
}

/** A playlist: its name, and how many poems and minutes. */
function PlaylistRow({ playlist, catalog, first, last }: { playlist: Playlist; catalog: Catalog } & ListEdges) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const poems = playlist.poems.map((id) => catalog.poems.find((p) => p.id === id)).filter((p): p is CatalogPoem => !!p);
  const seconds = poems.reduce((sum, p) => sum + (p.recitations[0]?.duration ?? 0), 0);
  const facts = [poemsCount(poems.length, lang), poems.length ? t(lang, "minutes", { m: Math.max(1, Math.round(seconds / 60)) }) : null]
    .filter(Boolean)
    .join(" · ");
  const ids = poems.map((p) => p.id);
  return (
    <View style={[styles.inline, styles.playlist, { borderTopColor: palette.line }, first && listEdges.first]}>
      <Link href={href(paths.playlist(playlist.id))} asChild>
        <Pressable
          accessibilityRole="link"
          style={StyleSheet.flatten([styles.inline, styles.flex, styles.playlistLink, first && listEdges.first, last && listEdges.last])}
        >
          <CoverTile size={56} name={playlistName(playlist, lang)} radius={12} />
          <View style={styles.flex}>
            {/* The reader's own name for it, in whatever language: the interface's type, not a verse's. */}
            <Text numberOfLines={1} style={[type.heading, styles.auto, { color: palette.fg, textAlign: start }]}>
              {playlistName(playlist, lang)}
            </Text>
            <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{facts}</Text>
          </View>
        </Pressable>
      </Link>
      {ids.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t(lang, "playAll")}: ${playlistName(playlist, lang)}`}
          onPress={() => playList(ids, lang)}
          style={[styles.playAll, { backgroundColor: palette.fg }]}
        >
          <Icon name="play" size={16} color={palette.bg} />
        </Pressable>
      )}
    </View>
  );
}

/** A downloaded poem, with a button that removes its download. */
function DownloadRow({ poem, catalog, list, ...edges }: { poem: CatalogPoem; catalog: Catalog; list: string[] } & ListEdges) {
  const { lang } = useSettings();
  const key = poem.recitations[0]?.audio;
  const { done } = useDownload(key);
  const [asking, setAsking] = useState(false);
  return (
    <View style={styles.inline}>
      <View style={styles.flex}>
        <PoemRow poem={poem} catalog={catalog} show="poet" list={list} {...edges} />
      </View>
      {done && key && (
        <>
          <IconButton icon="trash" label={t(lang, "removeDownload")} onPress={() => setAsking(true)} size={38} iconSize={19} />
          <Dialog
            open={asking}
            title={t(lang, "removeDownload")}
            message={t(lang, "removeDownloadAsk", { title: poem.title })}
            confirm={t(lang, "delete")}
            onConfirm={() => remove(key)}
            onClose={() => setAsking(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  head: { flexDirection: "row", alignItems: "center", gap: space.m, paddingBottom: space.l },
  text: { paddingVertical: space.l },
  row: { borderTopWidth: 1, paddingVertical: space.l, gap: space.s },
  inline: { flexDirection: "row", alignItems: "center", gap: space.l },
  badge: { width: 56, height: 56, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dashed: { borderStyle: "dashed", borderWidth: 1.5 },
  playlist: { borderTopWidth: 1 },
  playlistLink: { paddingVertical: 12, gap: space.l },
  playAll: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  auto: { writingDirection: "auto" },
});
