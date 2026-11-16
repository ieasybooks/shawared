import type { Catalog } from "@shawared/contracts";
import { space } from "@shawared/design";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { useCatalog } from "../../lib/content";
import { t } from "../../lib/i18n";
import { indexCatalog, search } from "../../lib/search";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { useWide } from "../navigation/layout";
import { ListPage, PageFrame, SectionHead } from "./Page";
import { PoemCard } from "./PoemCard";
import { SearchField } from "./SearchField";

/** Every poem, newest first, with search by title, opening bayt, poet and reciter. */
export function HomeScreen({ initial }: { initial?: { catalog: Catalog } | undefined }) {
  const { data, error, retry } = useCatalog(initial?.catalog);
  const { palette, lang, start } = useSettings();
  const type = useType();
  const wide = useWide();
  const [query, setQuery] = useState("");
  const index = useMemo(() => (data ? indexCatalog(data) : []), [data]);
  const poems = useMemo(() => search(index, query), [index, query]);
  const wordmark = <Text style={[type.wordmark, { color: palette.fg }]}>{t(lang, "brand")}</Text>;
  if (!data)
    return (
      <PageFrame lead={wordmark}>
        <StateView error={error} onRetry={retry} />
      </PageFrame>
    );

  const header = (
    <>
      <Text style={[type.lead, styles.tagline, { color: palette.muted, textAlign: start }]}>{t(lang, "tagline")}</Text>
      <View style={styles.search}>
        <SearchField value={query} onChange={setQuery} />
      </View>
      {!query && <SectionHead title={t(lang, "latest")} />}
    </>
  );
  return (
    <ListPage
      lead={wordmark}
      header={header}
      data={poems}
      keyOf={(p) => p.id}
      renderItem={(p) => (
        <View style={styles.cardGap}>
          <PoemCard poem={p} catalog={data} />
        </View>
      )}
      columns={wide ? 2 : 1}
      maxWidth={1080}
      estimatedItemSize={300}
      empty={t(lang, "noResults")}
    />
  );
}

const styles = StyleSheet.create({
  tagline: { maxWidth: 620 },
  search: { maxWidth: 620, width: "100%" },
  cardGap: { paddingBottom: space.xl },
});
