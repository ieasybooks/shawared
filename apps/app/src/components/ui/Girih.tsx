import { textBox, tile } from "@shawared/design";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useSettings } from "../../lib/settings";
import { Dir } from "./Dir";
import { BandPattern, TilePattern } from "./girihPattern";

// The redesign's identity: eight-point girih stars (two squares at 45°) in thin saffron lines.
// A band of them fades in at the top of every page, and they fill the night-blue cover tile.

/** The band of girih at the top of a page, fading downward. Place it behind the page's top. */
export function GirihBand({ height = 112, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const { palette } = useSettings();
  return (
    <View pointerEvents="none" style={[styles.band, { height }, style]}>
      <BandPattern lines={palette.accent} dots={palette.muted} />
    </View>
  );
}

/**
 * The cover tile: night blue with girih fading in toward its edges, and a name in the middle:
 * the wordmark (and the tagline under it), or with `name` a poet's, a reciter's or a playlist's.
 */
export function CoverTile({
  size,
  name,
  tagline,
  radius,
}: {
  size: number;
  /** A name in the verse face; without it, the wordmark. */
  name?: string;
  tagline?: string;
  radius?: number;
}) {
  const { lang } = useSettings();
  const r = radius ?? Math.max(8, Math.round(size * 0.07));
  const cell = Math.max(12, Math.round(size / 7));
  const mark = name
    ? textBox("verseBold", Math.max(10, Math.round(size * (name.length > 14 ? 0.12 : 0.15))), "ar", 1.6)
    : textBox("display", Math.round(size * 0.3), "ar");
  const sub = textBox("ui", Math.max(8, Math.round(size * 0.05)), lang === "ar" ? "ar" : "latin");
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: r }]}>
      <TilePattern cell={cell} />
      <Dir dir="rtl" lang="ar" style={[styles.center, { gap: Math.round(size * 0.04) }]}>
        <Text numberOfLines={name ? 3 : 1} style={[mark, styles.text, { color: tile.fg }]}>
          {name ?? "شوارد"}
        </Text>
        {tagline && !name && size >= 120 && (
          <Text numberOfLines={1} style={[sub, styles.text, { color: "rgba(243,240,232,0.6)" }]}>
            {tagline}
          </Text>
        )}
      </Dir>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.ring, { borderRadius: r }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: "absolute", top: 0, left: 0, right: 0 },
  tile: { backgroundColor: tile.bg, overflow: "hidden", flexShrink: 0 },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "8%",
  },
  text: { textAlign: "center" },
  ring: { borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" },
});
