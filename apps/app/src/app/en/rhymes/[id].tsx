import { useLocalSearchParams } from "expo-router";
import { RhymeScreen } from "../../../features/rhymes/RhymesScreens";
import { useInitial } from "../../../lib/initial";
import type { Params } from "../../../server/pages";

const LANG = "en";

export async function generateStaticParams() {
  const { staticParams } = await import("../../../server/pages");
  return staticParams.rhymes();
}

export async function loader(_: unknown, params: Params) {
  const { pageData, idOf } = await import("../../../server/pages");
  return pageData.rhyme(idOf(params));
}

export async function generateMetadata(_: unknown, params: Params) {
  const { pageMeta, idOf } = await import("../../../server/pages");
  return pageMeta.rhyme(idOf(params), LANG);
}

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RhymeScreen key={id} id={id} initial={useInitial<typeof loader>()} />;
}
