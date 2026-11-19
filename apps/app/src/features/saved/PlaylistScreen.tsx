import type { Catalog, CatalogPoem } from "@shawared/contracts";
import { space } from "@shawared/design";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chip, IconButton } from "../../components/ui/controls";
import { Dialog } from "../../components/ui/Dialog";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { poemsCount, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSaved, useSavedLoaded } from "../../lib/saved";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useHydrated } from "../../lib/viewport";
import { ListPage, PageFrame } from "../library/Page";
import { CoverTile } from "../../components/ui/Girih";
import { PoemRow } from "../library/PoemCard";
import { move, playlistName, removePlaylist, removePoem, rename } from "./actions";
import { PlayAll } from "./LibraryScreen";
import { NAME_MAX, type Saved } from "./model";

/**
 * A playlist the reader made: its poems in order, played on from the one opened. Reorder moves
 * poems up and down and takes them out; the playlist can be renamed and deleted.
 *
 * It lives on the device, so its id comes in the address's query, read once the page is live.
 */
export function PlaylistScreen() {
  const { lang, palette, start, href } = useSettings();
  const type = useType();
  const hydrated = useHydrated();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = hydrated && typeof params.id === "string" ? params.id : undefined;
  const select = useCallback((s: Saved) => s.playlists.find((p) => p.id === id), [id]);
  const playlist = useSaved(select);
  const loaded = useSavedLoaded();
  const catalog = useCatalog();
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const poems = useMemo(() => {
    if (!catalog.data || !playlist) return [];
    const known = new Map(catalog.data.poems.map((p) => [p.id, p] as const));
    return playlist.poems.map((pid) => known.get(pid)).filter((p): p is CatalogPoem => !!p);
  }, [catalog.data, playlist]);
  const ids = useMemo(() => poems.map((p) => p.id), [poems]);
  // The list draws a row again only when its item changes, so reordering makes new items.
  const rows = useMemo(() => poems.map((poem, index) => ({ poem, index, editing })), [poems, editing]);

  if (!catalog.data || !loaded || !id || !playlist)
    return (
      <PageFrame back title={playlist ? playlistName(playlist, lang) : t(lang, "playlists")}>
        {catalog.data && loaded && hydrated ? (
          <StateView message={t(lang, "playlistMissing")} />
        ) : (
          <StateView error={catalog.error} onRetry={catalog.retry} />
        )}
      </PageFrame>
    );

  const name = playlistName(playlist, lang);
  const seconds = poems.reduce((sum, p) => sum + (p.recitations[0]?.duration ?? 0), 0);
  const facts = [poemsCount(poems.length, lang), poems.length ? t(lang, "minutes", { m: Math.max(1, Math.round(seconds / 60)) }) : null]
    .filter(Boolean)
    .join(" · ");
  const header = (
    <View style={styles.header}>
      <View style={styles.top}>
        <CoverTile size={112} name={name} radius={14} />
        <View style={styles.flex}>
          <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{facts}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {poems.length > 0 && !editing && <PlayAll ids={ids} />}
        {poems.length > 1 || editing ? (
          <Chip icon={editing ? "check" : "edit"} onPress={() => setEditing(!editing)} active={editing}>
            {t(lang, editing ? "done" : "edit")}
          </Chip>
        ) : null}
        {!editing && <Chip onPress={() => setDialog("rename")}>{t(lang, "rename")}</Chip>}
        {!editing && (
          <Chip icon="trash" onPress={() => setDialog("delete")}>
            {t(lang, "deletePlaylist")}
          </Chip>
        )}
      </View>
    </View>
  );
  return (
    <>
      <ListPage
        back
        title={name}
        header={header}
        data={rows}
        keyOf={(r) => `${r.poem.id}${r.editing ? ":edit" : ""}`}
        renderItem={(r) =>
          r.editing ? (
            <EditRow poem={r.poem} catalog={catalog.data!} index={r.index} count={ids.length} playlistId={playlist.id} />
          ) : (
            <PoemRow poem={r.poem} catalog={catalog.data!} show="poet" list={ids} />
          )
        }
        estimatedItemSize={86}
        empty={t(lang, "playlistEmpty")}
      />
      <Dialog
        open={dialog === "rename"}
        title={t(lang, "rename")}
        input={{ label: t(lang, "playlistName"), initial: playlist.name, maxLength: NAME_MAX }}
        confirm={t(lang, "save")}
        onConfirm={(text) => void rename(playlist.id, text)}
        onClose={() => setDialog(null)}
      />
      <Dialog
        open={dialog === "delete"}
        title={t(lang, "deletePlaylist")}
        message={t(lang, "deletePlaylistAsk", { name })}
        confirm={t(lang, "delete")}
        onConfirm={() => {
          void removePlaylist(playlist.id);
          if (router.canGoBack()) router.back();
          else router.replace(href(paths.library));
        }}
        onClose={() => setDialog(null)}
      />
    </>
  );
}

/** A poem while the playlist is reordered: its title, then up, down and out. */
function EditRow({
  poem,
  catalog,
  index,
  count,
  playlistId,
}: {
  poem: CatalogPoem;
  catalog: Catalog;
  index: number;
  count: number;
  playlistId: string;
}) {
  const { palette, lang, start } = useSettings();
  const type = useType();
  const poet = catalog.poets[poem.poet];
  return (
    <View style={[styles.edit, { borderTopColor: palette.line }]}>
      <View style={styles.flex}>
        <Text numberOfLines={1} style={[type.listTitle, styles.rtl, { color: palette.fg, textAlign: start }]}>
          {poem.title}
        </Text>
        <Text numberOfLines={1} style={[type.label, { color: palette.muted, textAlign: start }]}>
          {poet ? (lang === "ar" ? poet.name : (poet.names[lang] ?? poet.name)) : ""}
        </Text>
      </View>
      <IconButton
        icon="up"
        label={t(lang, "moveUp")}
        onPress={() => void move(playlistId, index, index - 1)}
        size={38}
        iconSize={19}
        color={index > 0 ? palette.fg : palette.line}
      />
      <IconButton
        icon="down"
        label={t(lang, "moveDown")}
        onPress={() => void move(playlistId, index, index + 1)}
        size={38}
        iconSize={19}
        color={index < count - 1 ? palette.fg : palette.line}
      />
      <IconButton
        icon="close"
        label={t(lang, "removeFromPlaylist")}
        onPress={() => void removePoem(playlistId, poem.id)}
        size={38}
        iconSize={18}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xl },
  top: { flexDirection: "row", alignItems: "center", gap: space.xl },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.s, alignItems: "center" },
  edit: { flexDirection: "row", alignItems: "center", gap: space.xs, borderTopWidth: 1, paddingVertical: 10 },
  flex: { flex: 1, minWidth: 0, gap: space.s },
  rtl: { writingDirection: "rtl" },
});
