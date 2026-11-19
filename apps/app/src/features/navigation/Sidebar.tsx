import { space } from "@shawared/design";
import { Link, usePathname } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CoverTile } from "../../components/ui/Girih";
import { Icon } from "../../components/ui/Icon";
import { TextLink } from "../../components/ui/TextLink";
import { useCatalog } from "../../lib/content";
import { countsOf } from "../../lib/counts";
import { digits, t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSaved, useSavedLoaded } from "../../lib/saved";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useHydrated } from "../../lib/viewport";
import { playlistName } from "../saved/actions";
import type { Saved } from "../saved/model";
import { TABS, tabOf } from "./tabs";

/** The sidebar's width on wide windows. */
export const SIDEBAR_W = 352;

/** The cover tile, which goes home. */
function HomeTile({ size, tagline }: { size: number; tagline?: boolean }) {
  const { lang, href } = useSettings();
  return (
    <Link href={href(paths.home)} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={t(lang, "home")} style={styles.tileLink}>
        <CoverTile size={size} {...(tagline ? { tagline: t("ar", "tagline").split(":")[0] } : {})} />
      </Pressable>
    </Link>
  );
}

/**
 * The left side of wide windows (the right in Arabic): the cover tile, the tagline, the five
 * sections, what the reader keeps, and the library's counts. Every page but a poem's has it.
 */
export function Sidebar() {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const current = tabOf(usePathname());
  return (
    <View style={[styles.side, { backgroundColor: palette.fold, borderEndColor: palette.line }]}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.sideBody} showsVerticalScrollIndicator={false}>
        <View style={styles.tileRow}>
          <HomeTile size={196} tagline />
        </View>
        <View style={styles.brand}>
          <Text style={[type.wordmarkSmall, { color: palette.fg, textAlign: start }]}>{t(lang, "brand")}</Text>
          <Text style={[type.proseLarge, { color: palette.muted, textAlign: start }]}>{t(lang, "tagline")}</Text>
        </View>
        <View role="navigation" style={styles.nav}>
          {TABS.map((tab) => {
            const on = tab.name === current;
            return (
              <View key={tab.name} style={[styles.navItem, on && { backgroundColor: palette.bg, borderColor: palette.line }]}>
                <Icon name={tab.icon} size={20} color={on ? palette.accent : palette.muted} />
                <TextLink href={href(tab.path)} current={on}>
                  <Text style={[on ? type.controlStrong : type.control, { color: on ? palette.fg : palette.muted }]}>
                    {t(lang, tab.label)}
                  </Text>
                </TextLink>
              </View>
            );
          })}
        </View>
        <Kept />
        <View style={styles.flex} />
        <Counts />
        <View style={styles.foot}>
          <TextLink href={href(paths.about)}>
            <Text style={[type.label, styles.underline, { color: palette.muted, textDecorationColor: palette.line2 }]}>
              {t(lang, "aboutShawared")}
            </Text>
          </TextLink>
          <TextLink href={href(paths.privacy)}>
            <Text style={[type.label, styles.underline, { color: palette.muted, textDecorationColor: palette.line2 }]}>
              {t(lang, "privacy")}
            </Text>
          </TextLink>
        </View>
      </ScrollView>
    </View>
  );
}

const selectKept = (s: Saved) => s;

/** The reader's favourites and playlists, under the sections, once the page is live (they live on the device). */
function Kept() {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  const loaded = useSavedLoaded();
  const saved = useSaved(selectKept);
  const favs = saved.poems.length + saved.poets.length + saved.reciters.length;
  if (!loaded || (!favs && !saved.playlists.length)) return null;
  const row = (key: string, to: string, icon: "heartFull" | "listAdd", label: string, count: number) => (
    <View key={key} style={styles.keptRow}>
      <TextLink href={to} style={styles.keptLink}>
        <Icon name={icon} size={15} color={icon === "heartFull" ? palette.accent : palette.muted} />
        <Text numberOfLines={1} style={[type.control, styles.auto, { color: palette.muted, textAlign: start }]}>
          {label}
        </Text>
        <Text style={[type.caption, { color: palette.muted }]}>{digits(count, lang)}</Text>
      </TextLink>
    </View>
  );
  return (
    <View style={[styles.kept, { borderStartColor: palette.line }]}>
      {favs > 0 && row("favs", href(paths.library), "heartFull", t(lang, "favourites"), favs)}
      {saved.playlists.slice(0, 6).map((p) => row(p.id, href(paths.playlist(p.id)), "listAdd", playlistName(p, lang), p.poems.length))}
    </View>
  );
}

/** How many poems, poets, reciters and meters there are: filled in once the page is live. */
export function Counts() {
  const { palette, lang, start } = useSettings();
  const type = useType();
  const hydrated = useHydrated();
  const catalog = useCatalog().data;
  const counts = useMemo(() => (catalog ? countsOf(catalog) : null), [catalog]);
  const cells: [string, number | undefined][] = [
    [t(lang, "poems"), counts?.poems],
    [t(lang, "poets"), counts?.poets],
    [t(lang, "reciters"), counts?.reciters],
    [t(lang, "meters"), counts?.meters],
  ];
  return (
    <View style={styles.counts}>
      {cells.map(([label, n]) => (
        <View key={label} style={[styles.count, { backgroundColor: palette.bg, borderColor: palette.line }]}>
          <Text numberOfLines={1} style={[type.caption, { color: palette.muted, textAlign: start }]}>
            {label}
          </Text>
          {/* The number's line is there from the start, unseen until the number arrives, so nothing moves. */}
          <Text
            style={[type.heading, styles.tabular, { color: palette.fg, textAlign: start, opacity: hydrated && n !== undefined ? 1 : 0 }]}
          >
            {digits(hydrated && n !== undefined ? n : 0, lang)}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * The top of a poem page's sidebar on wide windows, whose rest is the poem's explanation: the
 * tile and wordmark, and the five sections in a row.
 */
export function SidebarHead() {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  return (
    <View style={styles.head}>
      <View style={styles.headBrand}>
        <HomeTile size={52} />
        <View style={styles.flex}>
          <Text style={[type.wordmarkSmall, { color: palette.fg, textAlign: start }]}>{t(lang, "brand")}</Text>
          <Text numberOfLines={1} style={[type.label, { color: palette.muted, textAlign: start }]}>
            {t(lang, "tagline").split(/[:.]/)[0]}
          </Text>
        </View>
      </View>
      <View role="navigation" style={[styles.iconNav, { backgroundColor: palette.bg, borderColor: palette.line }]}>
        {TABS.map((tab) => (
          <View key={tab.name} style={styles.iconNavItem}>
            <TextLink href={href(tab.path)} style={styles.iconNavLink}>
              <Icon name={tab.icon} size={20} color={palette.muted} />
              <Text style={[type.caption, { color: palette.muted }]}>{t(lang, tab.label)}</Text>
            </TextLink>
          </View>
        ))}
      </View>
      <View style={[styles.rule, { backgroundColor: palette.line }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  side: { width: SIDEBAR_W, borderEndWidth: 1 },
  sideBody: { flexGrow: 1, paddingTop: 28, paddingBottom: space.xxl, paddingHorizontal: 28, gap: space.xxl },
  tileRow: { alignItems: "center" },
  tileLink: { borderRadius: 14 },
  brand: { gap: space.l },
  nav: { gap: space.xxs },
  navItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    flexDirection: "row",
    alignItems: "center",
    gap: space.l,
  },
  kept: { marginStart: space.xl, borderStartWidth: 1, paddingStart: space.l, gap: space.s, marginTop: -space.l },
  keptRow: { flexDirection: "row" },
  keptLink: { flexDirection: "row", alignItems: "center", gap: space.m, maxWidth: 260 },
  auto: { writingDirection: "auto", flexShrink: 1 },
  counts: { flexDirection: "row", gap: space.s },
  count: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 12, paddingHorizontal: space.m, paddingVertical: space.m, gap: space.s },
  tabular: { fontVariant: ["tabular-nums"] },
  foot: { flexDirection: "row", gap: space.xl, marginTop: -space.m },
  underline: { textDecorationLine: "underline" },
  head: { paddingTop: 24, paddingHorizontal: 24, gap: space.xl },
  headBrand: { flexDirection: "row", alignItems: "center", gap: space.l },
  iconNav: { flexDirection: "row", borderWidth: 1, borderRadius: 12, padding: space.xs },
  iconNavItem: { flex: 1, alignItems: "center", paddingVertical: space.s },
  iconNavLink: { alignItems: "center", gap: space.s },
  rule: { height: 1 },
});
