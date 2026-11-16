import { fonts } from "@shawared/design";
import { Link, router } from "expo-router";
import { useState } from "react";
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, Nuqta } from "../../components/ui/controls";
import { Icon, Logo } from "../../components/ui/Icon";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { SettingsControls } from "../settings/SettingsControls";
import { Explanation, usePanelBayt } from "./Explanation";
import { About, Meta } from "./Meta";
import { PhonePlayer, WidePlayer } from "./Player";
import { Sheet } from "./Sheet";
import { useListening } from "./state";
import { Verses } from "./Verses";
import { WordCard } from "./WordCard";

const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

/** Phones and narrow windows: verses, a peek of the explanation, the player, and two sheets. */
export function CompactLayout() {
  const { bundle, sheetOpen, setSheetOpen, unpin, gloss, closeGloss } = useListening();
  const { palette, lang, rtl } = useSettings();
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState(false);
  const [playerH, setPlayerH] = useState(160);
  const [headH, setHeadH] = useState(82);

  return (
    <View style={[styles.compact, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <View style={styles.column}>
        <View onLayout={(e) => setHeadH(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}>
          <View style={styles.top}>
            <IconButton icon="back" label={t(lang, "back")} onPress={goBack} flip={!rtl} />
            <Link href={`/poets/${bundle.poet.id}`} asChild>
              <Pressable accessibilityRole="link" style={styles.from}>
                <Text style={[styles.fromSmall, { color: palette.muted, fontFamily: fonts.ui }]}>{t(lang, "by")}</Text>
                <Text style={[styles.fromName, { color: palette.fg, fontFamily: fonts.uiMedium }]}>{bundle.poet.name}</Text>
              </Pressable>
            </Link>
            <IconButton icon="more" label={t(lang, "more")} onPress={() => setMenu(!menu)} pressed={menu} />
          </View>
        </View>
        <Meta />
        <Verses />
        <Peek onOpen={() => setSheetOpen(true)} />
        <View onLayout={(e) => setPlayerH(e.nativeEvent.layout.height)}>
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
          <ScrollView contentContainerStyle={styles.sheetBody}>
            <Explanation
              onCollapse={() => {
                setSheetOpen(false);
                unpin();
              }}
            />
            <View style={styles.gap} />
            <About />
          </ScrollView>
        </Sheet>

        <Sheet
          open={gloss !== null}
          onClose={closeGloss}
          style={{ bottom: 0, zIndex: 6, paddingHorizontal: 22, paddingBottom: 26 + insets.bottom }}
        >
          <WordCard compact />
        </Sheet>

        {menu && (
          <View style={[styles.menu, { backgroundColor: palette.raise, borderColor: palette.line, shadowColor: palette.shadow, top: 50 }]}>
            <SettingsControls vertical />
          </View>
        )}
      </View>
    </View>
  );
}

/** The strip above the player: the first line of the explanation. Tap or drag up to open it. */
function Peek({ onOpen }: { onOpen: () => void }) {
  const { source } = useListening();
  const { palette, lang, rtl } = useSettings();
  const n = usePanelBayt();
  const sharh = source?.abyat[n]?.sharh;
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
        <Text style={[styles.peekLabel, { color: palette.muted, fontFamily: fonts.ui }]}>
          {t(lang, "verse", { n })} · {t(lang, "expl")}
        </Text>
        <View style={styles.flex} />
        <Icon name="up" size={16} color={palette.muted} />
      </View>
      {sharh && (
        <Text
          numberOfLines={1}
          style={[
            styles.peekText,
            { color: palette.fg, textAlign: rtl ? "right" : "left", fontFamily: lang === "en" ? fonts.translation : fonts.ui },
          ]}
        >
          {sharh}
        </Text>
      )}
    </Pressable>
  );
}

/** Desktop browsers: verses beside a panel that keeps the explanation open. */
export function WideLayout() {
  const { gloss } = useListening();
  const { palette, lang } = useSettings();
  return (
    <View style={[styles.wide, { backgroundColor: palette.bg }]}>
      <View style={[styles.header, { borderBottomColor: palette.line }]}>
        <Link href="/" asChild>
          <Pressable accessibilityRole="link" style={styles.brand}>
            <Logo size={28} color={palette.fg} dot={palette.accent} />
            <Text style={[styles.wordmark, { color: palette.fg }]}>{t(lang, "brand")}</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable accessibilityRole="link">
            <Text style={[styles.nav, { color: palette.muted, fontFamily: fonts.ui }]}>{t(lang, "poems")}</Text>
          </Pressable>
        </Link>
        <View style={styles.flex} />
        <SettingsControls />
      </View>
      <View style={styles.main}>
        <View style={[styles.poem, { borderEndColor: palette.line }]}>
          <Meta wide />
          <Verses />
        </View>
        <ScrollView style={styles.panel} contentContainerStyle={styles.panelBody}>
          {gloss && (
            <View style={[styles.card, { backgroundColor: palette.raise, borderColor: palette.line, shadowColor: palette.shadow }]}>
              <WordCard compact />
            </View>
          )}
          <Explanation />
          <About />
        </ScrollView>
      </View>
      <WidePlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  compact: { flex: 1, alignItems: "center" },
  column: { flex: 1, width: "100%", maxWidth: 640, overflow: "hidden" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6, paddingHorizontal: 8 },
  from: { alignItems: "center" },
  fromSmall: { fontSize: 11, lineHeight: 16 },
  fromName: { fontSize: 13, lineHeight: 18 },
  menu: {
    position: "absolute",
    end: 12,
    zIndex: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 12,
  },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 22 },
  gap: { height: 14 },
  peek: { borderTopWidth: 1, paddingTop: 8, paddingBottom: 10, paddingHorizontal: 18, gap: 1 },
  peekHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  peekLabel: { fontSize: 11 },
  peekText: { fontSize: 13, lineHeight: 21 },
  flex: { flex: 1 },
  wide: { flex: 1 },
  header: { height: 56, flexDirection: "row", alignItems: "center", gap: 28, paddingHorizontal: 22, borderBottomWidth: 1 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  wordmark: { fontFamily: "ReemKufi_600SemiBold", fontSize: 21, lineHeight: 28 },
  nav: { fontSize: 14 },
  main: { flex: 1, flexDirection: "row", minHeight: 0 },
  poem: { flex: 1, minWidth: 0, borderEndWidth: 1 },
  panel: { width: 360, flexGrow: 0 },
  panelBody: { paddingTop: 14, paddingHorizontal: 22, paddingBottom: 24, gap: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
});
