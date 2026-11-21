import type { UiLang } from "@shawared/contracts";
import { space } from "@shawared/design";
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { t, type StringKey } from "../../lib/i18n";
import { Only } from "../../lib/responsive";
import { useSettings } from "../../lib/settings";
import { STORES, type Store } from "../../lib/stores";
import { useType } from "../../lib/type";
import { ListPage } from "../library/Page";

// shawared.com/app: the apps in the three stores. A phone leaves for its own store before the
// page shows (lib/stores, app/+html.tsx), so this is what a computer sees, and a phone whose
// store we can't tell: the stores' badges, and on wide windows a QR code of this page for the
// reader's phone. The badges are the stores' own, in each language.

/** The badges' height; each keeps its own proportions. */
const HEIGHT = 48;

const BADGES: { store: Store; label: StringKey; ratio: number; image: Record<UiLang, ImageSourcePropType> }[] = [
  {
    store: "appStore",
    label: "appStoreBadge",
    ratio: 119.66408 / 40,
    image: { ar: require("../../../assets/stores/app-store-ar.svg"), en: require("../../../assets/stores/app-store-en.svg") },
  },
  {
    store: "googlePlay",
    label: "googlePlayBadge",
    ratio: 564 / 168,
    image: { ar: require("../../../assets/stores/google-play-ar.webp"), en: require("../../../assets/stores/google-play-en.webp") },
  },
  {
    store: "appGallery",
    label: "appGalleryBadge",
    ratio: 400 / 120,
    image: { ar: require("../../../assets/stores/appgallery-ar.webp"), en: require("../../../assets/stores/appgallery-en.webp") },
  },
];

/** This page's address in each language, drawn by scripts/store-qr.ts. */
const QR: Record<UiLang, ImageSourcePropType> = {
  ar: require("../../../assets/stores/qr-ar.svg"),
  en: require("../../../assets/stores/qr-en.svg"),
};

export function StoresScreen() {
  const { palette, start, lang } = useSettings();
  const type = useType();
  const header = (
    <View style={styles.body}>
      <Text style={[type.lead, { color: palette.fg, textAlign: start }]}>{t(lang, "appLead")}</Text>
      <View style={styles.badges}>
        {/* Plain anchors: under Link asChild, Pressable drops target and rel. */}
        {BADGES.map((b) => (
          <a key={b.store} href={STORES[b.store]} target="_blank" rel="noopener noreferrer" aria-label={t(lang, b.label)} style={anchor}>
            <Image source={b.image[lang]} style={{ width: Math.round(HEIGHT * b.ratio), height: HEIGHT }} />
          </a>
        ))}
      </View>
      <Only on="wide">
        <View style={styles.scan}>
          <Image source={QR[lang]} accessibilityLabel={t(lang, "appQr")} style={[styles.qr, { borderColor: palette.line }]} />
          <Text style={[type.prose, styles.scanText, { color: palette.muted, textAlign: start }]}>{t(lang, "appScan")}</Text>
        </View>
      </Only>
    </View>
  );
  return <ListPage title={t(lang, "appTitle")} back header={header} data={[]} keyOf={() => ""} renderItem={() => <></>} maxWidth={680} />;
}

const anchor = { display: "block", borderRadius: 8 } as const;

const styles = StyleSheet.create({
  body: { gap: space.xl },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: space.l },
  scan: { flexDirection: "row", alignItems: "center", gap: space.xl, paddingTop: space.l },
  qr: { width: 160, height: 160, borderRadius: 12, borderWidth: 1 },
  scanText: { flex: 1, maxWidth: 320 },
});
