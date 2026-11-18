import { space } from "@shawared/design";
import { useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nuqta } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { t } from "../../lib/i18n";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { SiteHeader } from "../navigation/SiteHeader";
import { TopBar } from "../navigation/TopBar";
import { Explanation, usePanel } from "./Explanation";
import { Meta } from "./Meta";
import { PanelScroll } from "./PanelScroll";
import { PhonePlayer, WidePlayer } from "./Player";
import { Sheet } from "./Sheet";
import { useListening } from "./state";
import { Verses } from "./Verses";

const web = Platform.OS === "web";

/**
 * The poem page, one layout for every window (lib/responsive).
 *
 * Phones and narrow windows: the top bar, the verses, a peek of the explanation, the player,
 * and the explanation's sheet over the verses. Wide windows: the site header, the verses
 * beside a panel that keeps the explanation open, and the player along the bottom. The verses
 * and the explanation are drawn once; on the web CSS moves the explanation from the sheet to
 * the panel.
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
        <Only on="wide">
          <SiteHeader />
        </Only>
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
          <View style={[layout.style(frame.poem), { borderEndColor: palette.line }]}>
            <Meta />
            <Verses />
          </View>
          {/* Beside the verses on wide windows; on phones, the sheet sits over the page. */}
          {(web || layout.wide) && explanation}
        </View>
        <Only on="phone">
          <Peek onOpen={() => setSheetOpen(true)} />
          <View
            onLayout={(e) => setPlayerH(e.nativeEvent.layout.height)}
            style={{ paddingBottom: insets.bottom, backgroundColor: palette.bg }}
          >
            <PhonePlayer />
          </View>
          {!web && explanation}
        </Only>
        <Only on="wide">
          <WidePlayer />
        </Only>
      </View>
    </View>
  );
}

/**
 * The explanation: on phones a sheet that slides up over the verses, between the top bar
 * (`top`) and the player (`bottom`); on wide windows a panel beside them. On the web it is one
 * box for both: from WIDE_MIN the page's base stylesheet sets the sheet in place, open
 * (`data-panel`, app/+html.tsx), and these styles make it the panel.
 */
function ExplanationBox({ open, onClose, top, bottom }: { open: boolean; onClose: () => void; top: number; bottom: number }) {
  const { palette } = useSettings();
  const layout = useLayout();
  const body = <Explanation onCollapse={onClose} />;
  if (layout.wide)
    return (
      <PanelScroll style={styles.panelWide} contentContainerStyle={panel.body.wide}>
        {body}
      </PanelScroll>
    );
  return (
    <Sheet
      open={open}
      onClose={onClose}
      style={[
        layout.style(panel.box),
        { top: layout.value<number | "auto">(top, "auto"), bottom: layout.value<number | "auto">(bottom, "auto") },
        { backgroundColor: layout.value(palette.raise, "transparent") },
      ]}
      gripStyle={layout.style(panel.grip)}
      {...(web ? { dataSet: { panel: "" } } : {})}
    >
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
  // The verses, and beside them on wide windows the explanation.
  main: responsive({ flex: 1, flexDirection: "column" as const, minHeight: 0 }, { flex: 1, flexDirection: "row" as const, minHeight: 0 }),
  // On the web the sheet is drawn here too. On phones it takes its place from the column, so
  // it spans from the top bar to the player, and stacks with the column's children (a flex
  // item with a z-index would keep it under the peek that follows).
  mainWeb: web
    ? responsive({ position: "static" as const, zIndex: "auto" as unknown as number }, { position: "relative" as const, zIndex: 0 }).both
    : null,
  poem: responsive({ flex: 1, minWidth: 0, borderEndWidth: 0 }, { flex: 1, minWidth: 0, borderEndWidth: 1 }),
};

const panel = {
  box: responsive(
    { position: "absolute" as const, left: 0, right: 0, width: "auto", zIndex: 4, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
    { position: "relative" as const, left: "auto", right: "auto", width: 360, zIndex: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  ),
  grip: responsive({ display: "flex" as const }, { display: "none" as const }),
  body: responsive(
    { paddingTop: 0, paddingHorizontal: 20, paddingBottom: 22, gap: 0 },
    { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 24, gap: space.xl },
  ),
};

const styles = StyleSheet.create({
  outer: { flex: 1 },
  from: { alignItems: "center", gap: space.xxs },
  peek: { borderTopWidth: 1, paddingTop: space.m, paddingBottom: 10, paddingHorizontal: 18, gap: space.s },
  peekHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  flex: { flex: 1 },
  panelWide: { width: 360, flexGrow: 0 },
});
