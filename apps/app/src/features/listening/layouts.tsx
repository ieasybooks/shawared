import { space } from "@shawared/design";
import { useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nuqta } from "../../components/ui/controls";
import { GirihBand } from "../../components/ui/Girih";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { t } from "../../lib/i18n";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { SIDEBAR_W, SidebarHead } from "../navigation/Sidebar";
import { TopBar, WideToolbar } from "../navigation/TopBar";
import { Explanation, usePanel } from "./Explanation";
import { Meta } from "./Meta";
import { PanelScroll } from "./PanelScroll";
import { PhonePlayer, WidePlayer } from "./Player";
import { Sheet } from "./Sheet";
import { useListening } from "./state";
import { Verses } from "./Verses";
import { WordPeek } from "./WordPeek";

const web = Platform.OS === "web";

/**
 * The poem page, one layout for every window (lib/responsive).
 *
 * Phones and narrow windows: the top bar, the verses, a peek of the explanation, the player,
 * and the explanation's sheet over the verses. Wide windows: the sidebar at the start, which on
 * a poem's page holds its explanation under the tile and the sections, and beside it the page's
 * column, with the verses and the player bar along its bottom. The verses and the explanation
 * are drawn once; on the web CSS moves the explanation from the sheet to the sidebar.
 */
export function ListeningLayout() {
  const { bundle, sheetOpen, setSheetOpen, unpin } = useListening();
  const { palette, lang, href } = useSettings();
  const type = useType();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const [playerH, setPlayerH] = useState(160);
  const [headH, setHeadH] = useState(82);
  const close = () => {
    setSheetOpen(false);
    unpin();
  };
  const explanation = <ExplanationBox open={sheetOpen} onClose={close} top={headH} bottom={playerH} />;

  return (
    <View style={[styles.outer, layout.style(frame.outer), { backgroundColor: palette.bg }]}>
      <View style={layout.style(frame.column)}>
        <Only on="phone">
          <View onLayout={(e) => setHeadH(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}>
            <TopBar
              back
              center={
                <TextLink href={href(paths.poet(bundle.poet.id))} style={styles.from}>
                  <Text style={[type.caption, { color: palette.muted }]}>{t(lang, "by")}</Text>
                  <Text style={[type.bodyStrong, { color: palette.fg }]}>{bundle.poet.name}</Text>
                </TextLink>
              }
            />
          </View>
        </Only>
        <View style={[layout.style(frame.main), frame.mainWeb]}>
          <View style={layout.style(frame.poem)}>
            <Only on="wide">
              <GirihBand />
              <WideToolbar back />
            </Only>
            <Meta />
            <Verses />
            <Only on="wide">
              <WidePlayer />
            </Only>
          </View>
          {/* The sidebar on wide windows; on phones, the sheet sits over the page. */}
          {(web || layout.wide) && explanation}
        </View>
        <Only on="phone">
          <Peek onOpen={() => setSheetOpen(true)} />
          <View
            onLayout={(e) => setPlayerH(e.nativeEvent.layout.height)}
            style={{ paddingBottom: insets.bottom, backgroundColor: palette.raise }}
          >
            <PhonePlayer />
          </View>
          {!web && explanation}
        </Only>
      </View>
      {web && <WordPeek />}
    </View>
  );
}

/**
 * The explanation: on phones a sheet that slides up over the verses, between the top bar
 * (`top`) and the player (`bottom`); on wide windows the sidebar, under the tile and the
 * sections. On the web it is one box for both: from WIDE_MIN the page's base stylesheet sets the
 * sheet in place, open (`data-panel`, app/+html.tsx), and these styles make it the sidebar.
 */
function ExplanationBox({ open, onClose, top, bottom }: { open: boolean; onClose: () => void; top: number; bottom: number }) {
  const { palette } = useSettings();
  const layout = useLayout();
  const body = <Explanation onCollapse={onClose} />;
  if (layout.wide)
    return (
      <View style={[styles.side, { backgroundColor: palette.fold, borderEndColor: palette.line }]}>
        <SidebarHead />
        <PanelScroll style={styles.flex} contentContainerStyle={panel.body.wide}>
          {body}
        </PanelScroll>
      </View>
    );
  return (
    <Sheet
      open={open}
      onClose={onClose}
      style={[
        layout.style(panel.box),
        { top: layout.value<number | "auto">(top, "auto"), bottom: layout.value<number | "auto">(bottom, "auto") },
        { backgroundColor: layout.value(palette.raise, palette.fold), borderEndColor: palette.line },
      ]}
      gripStyle={layout.style(panel.grip)}
      {...(web ? { dataSet: { panel: "" } } : {})}
    >
      <Only on="wide">
        <SidebarHead />
      </Only>
      <PanelScroll contentContainerStyle={layout.style(panel.body)}>{body}</PanelScroll>
    </Sheet>
  );
}

/** The strip above the player: the first line of the explanation (or the introduction). Tap or drag up to open it. */
function Peek({ onOpen }: { onOpen: () => void }) {
  const { source, intro } = useListening();
  const { palette, lang, start } = useSettings();
  const type = useType();
  const view = usePanel();
  const line = view === "intro" ? intro : source?.abyat[view]?.sharh;
  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy < -6,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -24) onOpen();
      },
    }),
  );
  return (
    <Pressable
      {...pan.panHandlers}
      accessibilityRole="button"
      accessibilityLabel={t(lang, "expand")}
      onPress={onOpen}
      style={[styles.peek, { borderTopColor: palette.line, backgroundColor: palette.fold }]}
    >
      <View style={styles.peekHead}>
        <Nuqta />
        <Text style={[type.caption, { color: palette.muted }]}>
          {view === "intro" ? t(lang, "about") : `${t(lang, "verse", { n: view })} · ${t(lang, "expl")}`}
        </Text>
        <View style={styles.flex} />
        <Icon name="up" size={16} color={palette.muted} />
      </View>
      {line && (
        <Text numberOfLines={1} style={[type.proseLine, { color: palette.fg, textAlign: start }]}>
          {line}
        </Text>
      )}
    </Pressable>
  );
}

const frame = {
  // Phones: one column, at most 640 wide, centred. Wide windows: the whole window.
  outer: responsive({ alignItems: "center" as const }, { alignItems: "stretch" as const }),
  column: responsive(
    { flex: 1, width: "100%", maxWidth: 640, overflow: "hidden" as const },
    { flex: 1, width: "100%", maxWidth: "100%", overflow: "visible" as const },
  ),
  // The page's column, and on wide windows the sidebar at its start (drawn after it: reversed).
  main: responsive(
    { flex: 1, flexDirection: "column" as const, minHeight: 0 },
    { flex: 1, flexDirection: "row-reverse" as const, minHeight: 0 },
  ),
  // On the web the sheet is drawn here too. On phones it takes its place from the column, so
  // it spans from the top bar to the player, and stacks with the column's children (a flex
  // item with a z-index would keep it under the peek that follows).
  mainWeb: web
    ? responsive({ position: "static" as const, zIndex: "auto" as unknown as number }, { position: "relative" as const, zIndex: 0 }).both
    : null,
  poem: responsive({ flex: 1, minWidth: 0, minHeight: 0 }, { flex: 1, minWidth: 0, minHeight: 0 }),
};

const panel = {
  box: responsive(
    {
      position: "absolute" as const,
      left: 0,
      right: 0,
      width: "auto",
      zIndex: 4,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderEndWidth: 0,
    },
    {
      position: "relative" as const,
      left: "auto",
      right: "auto",
      width: SIDEBAR_W,
      zIndex: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderEndWidth: 1,
    },
  ),
  grip: responsive({ display: "flex" as const }, { display: "none" as const }),
  body: responsive(
    { paddingTop: 0, paddingStart: space.xl, paddingEnd: space.xl, paddingBottom: 22, gap: 0 },
    { paddingTop: space.xl, paddingStart: 24, paddingEnd: 24, paddingBottom: 32, gap: space.xl },
  ),
};

const styles = StyleSheet.create({
  outer: { flex: 1 },
  flex: { flex: 1 },
  from: { alignItems: "center", gap: space.xxs },
  side: { width: SIDEBAR_W, borderEndWidth: 1 },
  peek: { borderTopWidth: 1, paddingTop: space.m, paddingBottom: 10, paddingHorizontal: space.xl, gap: space.s },
  peekHead: { flexDirection: "row", alignItems: "center", gap: space.m },
});
