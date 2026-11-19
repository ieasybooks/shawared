import { space } from "@shawared/design";
import { LegendList } from "@legendapp/list/react-native";
import { Fragment, useMemo, type ReactElement, type ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Nuqta } from "../../components/ui/controls";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { Only, responsive, useLayout } from "../../lib/responsive";
import { useHydrated } from "../../lib/viewport";
import { GirihBand } from "../../components/ui/Girih";
import { Sidebar } from "../navigation/Sidebar";
import { TopBar, WideToolbar } from "../navigation/TopBar";
import { MiniPlayer } from "../player/MiniPlayer";
import { GlobalPlayerBar } from "../player/PlayerBar";

/**
 * A page whose body is a long list, rendered only as far as it is on screen.
 *
 * Phones get the top bar (back, the title, the settings); wide windows get the site header,
 * with back and the title at the top of the page. Pages opened from another (`back`) are
 * outside the tabs, so they carry the mini player themselves. The list is a column at most
 * `maxWidth` wide, centred; wide windows lay it out in `columns`, which phones stack.
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
  /** `index` is the item's place in `data`: lists leave the first item's top rule off. */
  renderItem: (item: T, index: number) => ReactElement;
  keyOf: (item: T) => string;
  empty?: string;
  maxWidth?: number;
  /** Columns on wide windows. */
  columns?: number;
  estimatedItemSize?: number;
}) {
  const { palette, start } = useSettings();
  const type = useType();
  const layout = useLayout();
  const hydrated = useHydrated();
  // Phones show one column. The web, which can't tell, groups the rows for wide windows at
  // every width and stacks each row's cells on phones (CSS).
  const perRow = layout.wide === false ? 1 : columns;
  // The list positions rows across its full width and ignores padding on itself, and its own
  // grid always runs left to right. So each row is the centred column, and a grid is built
  // from rows of cells that follow the reading direction.
  const rows = useMemo(() => {
    if (perRow === 1) return data.map((item) => [item]);
    const out: T[][] = [];
    for (let i = 0; i < data.length; i += perRow) out.push(data.slice(i, i + perRow));
    return out;
  }, [data, perRow]);
  // The column: `maxWidth` wide and centred, with a gutter of at least space.xl either side.
  const column = [styles.column, { maxWidth: maxWidth + 2 * space.xl }];
  const rowOf = (row: T[], at: number) =>
    perRow === 1 ? (
      <View style={column}>{renderItem(row[0]!, at)}</View>
    ) : (
      <View style={[column, layout.style(grid.row)]}>
        {Array.from({ length: perRow }, (_, i) => (
          <View key={i} style={layout.style(grid.cell)}>
            {row[i] !== undefined && renderItem(row[i]!, at * perRow + i)}
          </View>
        ))}
      </View>
    );
  const rowKey = (row: T[]) => row.map(keyOf).join("|");
  const top = (
    <View style={[column, styles.head, layout.style(headTop)]}>
      {title && (
        <Only on="wide">
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" style={[type.pageTitle, styles.title, { color: palette.fg, textAlign: start }]}>
              {title}
            </Text>
          </View>
        </Only>
      )}
      {header}
    </View>
  );
  // In the column, so a line too long for a phone keeps the page's gutter.
  const none = empty ? (
    <View style={[column, styles.empty]}>
      <Text style={[type.control, styles.center, { color: palette.muted }]}>{empty}</Text>
    </View>
  ) : null;
  const foot = <View style={styles.foot} />;
  // Clear, so the girih band at the top of the page shows through.
  const style = { flex: 1, backgroundColor: "transparent" };

  // The virtual list draws rows only once it has measured itself, which a page rendered ahead
  // of time never does. So the server, and the browser while it picks the page up, draw every
  // row of the page's data (a short slice), and the virtual list takes over right after.
  const list = !hydrated ? (
    <ScrollView style={style}>
      {top}
      {rows.length ? rows.map((row, i) => <Fragment key={rowKey(row)}>{rowOf(row, i)}</Fragment>) : none}
      {foot}
    </ScrollView>
  ) : (
    <LegendList
      style={style}
      data={rows}
      keyExtractor={rowKey}
      renderItem={({ item: row, index }) => rowOf(row, index)}
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

/**
 * A page's frame. Phones: the top bar above, and the mini player below on pages outside the
 * tabs (the tabs' own bar carries it on theirs). Wide windows: the sidebar at the start, and the
 * page's column beside it, with the girih band and the toolbar at its top and the player bar
 * along its bottom.
 */
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
  const layout = useLayout();
  return (
    <View style={[styles.frame, layout.style(frameDir), { backgroundColor: palette.bg }]}>
      <Only on="wide">
        <Sidebar />
      </Only>
      <View style={styles.pageColumn}>
        <Only on="wide">
          <GirihBand />
          <WideToolbar back={back} />
        </Only>
        <Only on="phone">
          <TopBar back={back} title={title} lead={lead} />
        </Only>
        {children}
        <Only on="wide">
          <GlobalPlayerBar />
        </Only>
        {back && (
          <Only on="phone">
            <MiniPlayer docked />
          </Only>
        )}
      </View>
    </View>
  );
}

const frameDir = responsive({ flexDirection: "column" as const }, { flexDirection: "row" as const });

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

const headTop = responsive({ paddingTop: space.s }, { paddingTop: space.xs });
const grid = {
  // Phones stack a row's cells; wide windows set them side by side, as wide as each other.
  row: responsive({ flexDirection: "column" as const, gap: 0 }, { flexDirection: "row" as const, gap: space.xl }),
  cell: responsive(
    { flexGrow: 0, flexShrink: 0, flexBasis: "auto" as const, minWidth: 0 },
    { flexGrow: 1, flexShrink: 1, flexBasis: "0%" as const, minWidth: 0 },
  ),
};

const styles = StyleSheet.create({
  frame: { flex: 1 },
  // The page's column: everything but the sidebar.
  pageColumn: { flex: 1, minWidth: 0, minHeight: 0 },
  // Auto margins centre it in the list, whose header sits in a block rather than a flex box.
  column: { width: "100%", marginHorizontal: "auto", paddingHorizontal: space.xl },
  head: { gap: space.l, paddingBottom: space.l },
  titleRow: { flexDirection: "row", alignItems: "center", gap: space.s },
  title: { flex: 1 },
  // Spaced on its box: a text's own padding would undo its ink trim.
  empty: { paddingVertical: space.xxl },
  center: { textAlign: "center" },
  foot: { height: space.xxl },
  facts: { gap: space.m },
  rtl: { writingDirection: "rtl" },
  section: { flexDirection: "row", alignItems: "center", gap: space.l, paddingTop: space.l },
});
