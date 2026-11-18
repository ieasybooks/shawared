import { space } from "@shawared/design";
import { useCallback, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type HostInstance } from "react-native";
import { IconButton, type PressState } from "../../components/ui/controls";
import { Dialog } from "../../components/ui/Dialog";
import { Dir } from "../../components/ui/Dir";
import { Icon } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { useSaved } from "../../lib/saved";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useWindowWidth } from "../../lib/viewport";
import { newPlaylist, playlistName, toggleFav, togglePoem } from "./actions";
import { NAME_MAX, type FavouriteKind, type Saved } from "./model";

/** Whether `id` is among the favourite `kind`. */
export function useFavourite(kind: FavouriteKind, id: string): boolean {
  const select = useCallback((s: Saved) => s[kind].includes(id), [kind, id]);
  return useSaved(select);
}

/** A heart that keeps a poem, a poet or a reciter among the favourites. */
export function FavouriteButton({
  kind,
  id,
  size = 38,
  iconSize = 21,
}: {
  kind: FavouriteKind;
  id: string;
  size?: number;
  iconSize?: number;
}) {
  const { palette, lang } = useSettings();
  const on = useFavourite(kind, id);
  return (
    <IconButton
      icon={on ? "heartFull" : "heart"}
      label={t(lang, on ? "removeFav" : "addFav")}
      pressed={on}
      onPress={() => void toggleFav(kind, id)}
      size={size}
      iconSize={iconSize}
      color={on ? palette.accent : palette.muted}
    />
  );
}

/** The heart as a labelled pill, for a poet's or a reciter's page. */
export function FavouriteChip({ kind, id }: { kind: "poets" | "reciters"; id: string }) {
  const { palette, lang } = useSettings();
  const type = useType();
  const on = useFavourite(kind, id);
  const color = on ? palette.fg : palette.muted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(lang, on ? "removeFav" : "addFav")}
      aria-pressed={on}
      accessibilityState={{ selected: on }}
      onPress={() => void toggleFav(kind, id)}
      style={[styles.chip, { borderColor: on ? palette.accent : palette.line }, on && { borderWidth: 1.5 }]}
    >
      <Icon name={on ? "heartFull" : "heart"} size={14} color={on ? palette.accent : palette.muted} />
      <Text style={[type.label, { color }]}>{t(lang, on ? "favourite" : "addFav")}</Text>
    </Pressable>
  );
}

const MENU_W = 248;
const selectPlaylists = (s: Saved) => s.playlists;

/**
 * Adds the poem to a playlist: a menu of the reader's playlists, those holding it ticked (a tap
 * takes it out again), and a new playlist with it.
 */
export function PlaylistMenu({ poemId, size = 38, iconSize = 21 }: { poemId: string; size?: number; iconSize?: number }) {
  const { palette, lang, rtl } = useSettings();
  const type = useType();
  const width = useWindowWidth();
  const playlists = useSaved(selectPlaylists);
  const anchor = useRef<HostInstance>(null);
  const [at, setAt] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [naming, setNaming] = useState(false);
  const close = () => setAt(null);
  const open = () => anchor.current?.measureInWindow((x, y, w, h) => setAt({ x, y, w, h }));
  const left = at ? Math.max(8, Math.min(width - MENU_W - 8, rtl ? at.x : at.x + at.w - MENU_W)) : 0;
  const inAny = playlists.some((p) => p.poems.includes(poemId));
  return (
    <>
      <View ref={anchor} collapsable={false}>
        <IconButton
          icon="listAdd"
          label={t(lang, "addToPlaylist")}
          onPress={open}
          pressed={at !== null}
          size={size}
          iconSize={iconSize}
          color={inAny ? palette.accent : palette.muted}
        />
      </View>
      <Modal visible={at !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <Pressable accessibilityLabel={t(lang, "close")} style={StyleSheet.absoluteFill} onPress={close} />
        {at && (
          <Dir
            dir={rtl ? "rtl" : "ltr"}
            accessibilityRole="menu"
            accessibilityLabel={t(lang, "addToPlaylist")}
            style={[
              styles.menu,
              {
                top: at.y + at.h + 6,
                left,
                width: MENU_W,
                backgroundColor: palette.raise,
                borderColor: palette.line,
                shadowColor: palette.shadow,
              },
            ]}
          >
            <ScrollView style={styles.scroll}>
              {playlists.map((p) => {
                const on = p.poems.includes(poemId);
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole="menuitem"
                    accessibilityState={{ checked: on }}
                    aria-checked={on}
                    onPress={() => void togglePoem(p.id, poemId)}
                    style={(s: PressState) => [styles.item, (s.hovered || s.pressed) && { backgroundColor: palette.fold }]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[on ? type.controlStrong : type.control, styles.name, { color: on ? palette.fg : palette.muted }]}
                    >
                      {playlistName(p, lang)}
                    </Text>
                    {on && <Icon name="check" size={18} color={palette.accent} />}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              accessibilityRole="menuitem"
              onPress={() => {
                close();
                setNaming(true);
              }}
              style={(s: PressState) => [
                styles.item,
                playlists.length > 0 && { borderTopWidth: 1, borderTopColor: palette.line },
                (s.hovered || s.pressed) && { backgroundColor: palette.fold },
              ]}
            >
              <Text style={[type.controlStrong, styles.name, { color: palette.fg }]}>{t(lang, "newPlaylist")}</Text>
              <Icon name="plus" size={18} color={palette.fg} />
            </Pressable>
          </Dir>
        )}
      </Modal>
      <Dialog
        open={naming}
        title={t(lang, "newPlaylist")}
        input={{ label: t(lang, "playlistName"), initial: "", maxLength: NAME_MAX }}
        confirm={t(lang, "create")}
        onConfirm={(name) => newPlaylist(name, [poemId])}
        onClose={() => setNaming(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: space.s,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
  },
  menu: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 12,
  },
  scroll: { maxHeight: 280 },
  item: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: space.m,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  name: { flex: 1, minWidth: 0 },
});
