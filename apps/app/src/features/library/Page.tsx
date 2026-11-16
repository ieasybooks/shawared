import { space } from "@shawared/design";
import { LegendList } from "@legendapp/list/react-native";
import { Fragment, useMemo, type ReactElement, type ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { IconButton, Nuqta } from "../../components/ui/controls";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useHydrated, useWindowWidth } from "../../lib/viewport";
import { useWide } from "../navigation/layout";
import { SiteHeader } from "../navigation/SiteHeader";
import { TopBar, useGoBack } from "../navigation/TopBar";
import { MiniPlayer } from "../player/MiniPlayer";

/**
 * A page whose body is a long list, rendered only as far as it is on screen.
 *
 * Phones get the top bar (back, the title, the settings); wide windows get the site header,
 * with back and the title at the top of the page. Pages opened from another (`back`) are
 * outside the tabs, so they carry the mini player themselves.
 */
export function ListPage<T>({
  title,
  back,
  lead,
  header,
  data,
  renderItem,
  keyOf,
  empty,
  maxWidth = 760,
  columns = 1,
  estimatedItemSize = 80,
}: {
  /** The page's name. */
  title?: string;
  /** Opened from another page: a back button. */
  back?: boolean;
  /** In the phone's top bar instead of a title (the wordmark at home). */
  lead?: ReactNode;
  /** What comes before the list, under the title. */
  header?: ReactNode;
  data: readonly T[];
  renderItem: (item: T) => ReactElement;
  keyOf: (item: T) => string;
  empty?: string;
  maxWidth?: number;
  columns?: number;
  estimatedItemSize?: number;
}) {
  const { palette, lang, start } = useSettings();
  const type = useType();
  const width = useWindowWidth();
  const wide = useWide();
  const hydrated = useHydrated();
  const goBack = useGoBack();
  const gutter = Math.max(space.xl, (width - maxWidth) / 2);
  // The list positions rows across its full width and ignores padding on itself, and its own
  // grid always runs left to right. So rows carry the gutter, and a grid is built from rows of
  // cells that follow the reading direction.
  const rows = useMemo(() => {
    if (columns === 1) return data.map((item) => [item]);
    const out: T[][] = [];
    for (let i = 0; i < data.length; i += columns) out.push(data.slice(i, i + columns));
    return out;
  }, [data, columns]);
  const pad = { paddingHorizontal: gutter };
  const rowOf = (row: T[]) =>
    columns === 1 ? (
      <View style={pad}>{renderItem(row[0]!)}</View>
    ) : (
      <View style={[pad, styles.row]}>
        {Array.from({ length: columns }, (_, i) => (
          <View key={i} style={styles.cell}>
            {row[i] !== undefined && renderItem(row[i]!)}
          </View>
        ))}
      </View>
    );
  const rowKey = (row: T[]) => row.map(keyOf).join("|");
  const top = (
    <View style={[pad, styles.head, { paddingTop: wide ? space.xxl : space.s }]}>
      {wide && (back || title) && (
        <View style={[styles.titleRow, back && styles.pullStart]}>
          {back && <IconButton icon="back" label={t(lang, "back")} onPress={goBack} />}
          {title && (
            <Text accessibilityRole="header" style={[type.pageTitle, styles.title, { color: palette.fg, textAlign: start }]}>
              {title}
            </Text>
          )}
        </View>
      )}
      {header}
    </View>
  );
  const none = empty ? <Text style={[type.control, styles.empty, { color: palette.muted }]}>{empty}</Text> : null;
  const foot = <View style={styles.foot} />;
  const style = { flex: 1, backgroundColor: palette.bg };

  // The virtual list draws rows only once it has measured itself, which a page rendered ahead
  // of time never does. So the server, and the browser while it picks the page up, draw every
  // row of the page's data (a short slice), and the virtual list takes over right after.
  const list = !hydrated ? (
    <ScrollView style={style}>
      {top}
      {rows.length ? rows.map((row) => <Fragment key={rowKey(row)}>{rowOf(row)}</Fragment>) : none}
      {foot}
    </ScrollView>
  ) : (
    <LegendList
      style={style}
      data={rows}
      keyExtractor={rowKey}
      renderItem={({ item: row }) => rowOf(row)}
      estimatedItemSize={estimatedItemSize}
      recycleItems={false}
      ListHeaderComponent={top}
      ListEmptyComponent={none}
      ListFooterComponent={foot}
      {...(Platform.OS === "web" ? {} : { keyboardShouldPersistTaps: "handled" as const })}
    />
  );
  return (
    <PageFrame title={title} back={back} lead={lead}>
      {list}
    </PageFrame>
  );
}

/** A page's frame: the top bar or site header above, and the mini player below on pages outside the tabs. */
export function PageFrame({
  title,
  back,
  lead,
  children,
}: {
  title?: string | undefined;
  back?: boolean | undefined;
  lead?: ReactNode;
  children: ReactNode;
}) {
  const { palette } = useSettings();
  const wide = useWide();
  return (
    <View style={[styles.frame, { backgroundColor: palette.bg }]}>
      {wide ? <SiteHeader /> : <TopBar back={back} title={title} lead={lead} />}
      {children}
      {back && <MiniPlayer docked />}
    </View>
  );
}

/**
 * The opening lines of a person's or a meter's page, under its title: the name in Arabic
 * (in full, or under an English title), then short facts.
 */
export function DetailFacts({ arabic, children }: { arabic?: string | null | undefined; children?: ReactNode }) {
  const { palette, start } = useSettings();
  const type = useType();
  if (!arabic && !children) return null;
  return (
    <View style={styles.facts}>
      {arabic && <Text style={[type.nameAr, styles.rtl, { color: palette.muted, textAlign: start }]}>{arabic}</Text>}
      {children}
    </View>
  );
}

/** A heading inside a page: the nuqta, a name, and a count. */
export function SectionHead({ title, count }: { title: string; count?: string }) {
  const { palette } = useSettings();
  const type = useType();
  return (
    <View style={styles.section}>
      <Nuqta size={8} />
      <Text style={[type.heading, { color: palette.fg }]}>{title}</Text>
      {count && <Text style={[type.label, { color: palette.muted }]}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  head: { gap: space.l, paddingBottom: space.l },
  titleRow: { flexDirection: "row", alignItems: "center", gap: space.s },
  // The back arrow's glyph, not its round button, lines up with the text below.
  pullStart: { marginStart: -space.m },
  title: { flex: 1 },
  row: { flexDirection: "row", gap: space.xl },
  cell: { flex: 1, minWidth: 0 },
  empty: { textAlign: "center", paddingVertical: space.xxl },
  foot: { height: space.xxl },
  facts: { gap: space.m },
  rtl: { writingDirection: "rtl" },
  section: { flexDirection: "row", alignItems: "center", gap: space.l, paddingTop: space.l },
});
