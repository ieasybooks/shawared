import { space } from "@shawared/design";
import { useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Nuqta } from "../../components/ui/controls";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { paths } from "../../lib/routes";
import { SiteHeader } from "../navigation/SiteHeader";
import { TopBar } from "../navigation/TopBar";
import { Explanation, usePanel } from "./Explanation";
import { Meta } from "./Meta";
import { PanelScroll } from "./PanelScroll";
import { PhonePlayer, WidePlayer } from "./Player";
import { Sheet } from "./Sheet";
import { useListening } from "./state";
import { Verses } from "./Verses";

/** Phones and narrow windows: verses, a peek of the explanation, the player, and the explanation's sheet. */
export function CompactLayout() {
  const { bundle, sheetOpen, setSheetOpen, unpin } = useListening();
  const { palette, lang, href } = useSettings();
  const type = useType();
  const insets = useSafeAreaInsets();
  const [playerH, setPlayerH] = useState(160);
  const [headH, setHeadH] = useState(82);

  return (
    <View style={[styles.compact, { backgroundColor: palette.bg }]}>
      <View style={styles.column}>
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
        <Meta />
        <Verses />
        <Peek onOpen={() => setSheetOpen(true)} />
        <View
          onLayout={(e) => setPlayerH(e.nativeEvent.layout.height)}
          style={{ paddingBottom: insets.bottom, backgroundColor: palette.bg }}
        >
          <PhonePlayer />
        </View>

        <Sheet
          open={sheetOpen}
          onClose={() => {
            setSheetOpen(false);
            unpin();
          }}
          style={{ top: headH, bottom: playerH, zIndex: 4 }}
        >
          <PanelScroll contentContainerStyle={styles.sheetBody}>
            <Explanation
              onCollapse={() => {
                setSheetOpen(false);
                unpin();
              }}
            />
          </PanelScroll>
        </Sheet>
      </View>
    </View>
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

/** Desktop browsers: verses beside a panel that keeps the explanation open. */
export function WideLayout() {
  const { palette } = useSettings();
  return (
    <View style={[styles.wide, { backgroundColor: palette.bg }]}>
      <SiteHeader />
      <View style={styles.main}>
        <View style={[styles.poem, { borderEndColor: palette.line }]}>
          <Meta wide />
          <Verses />
        </View>
        <PanelScroll style={styles.panel} contentContainerStyle={styles.panelBody}>
          <Explanation />
        </PanelScroll>
      </View>
      <WidePlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  compact: { flex: 1, alignItems: "center" },
  column: { flex: 1, width: "100%", maxWidth: 640, overflow: "hidden" },
  from: { alignItems: "center", gap: space.xxs },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 22 },
  peek: { borderTopWidth: 1, paddingTop: space.m, paddingBottom: 10, paddingHorizontal: 18, gap: space.s },
  peekHead: { flexDirection: "row", alignItems: "center", gap: space.m },
  flex: { flex: 1 },
  wide: { flex: 1 },
  main: { flex: 1, flexDirection: "row", minHeight: 0 },
  poem: { flex: 1, minWidth: 0, borderEndWidth: 1 },
  panel: { width: 360, flexGrow: 0 },
  panelBody: { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 24, gap: space.xl },
});
