import { useLocalSearchParams } from "expo-router";
import { PersonScreen } from "../../../features/people/PeopleScreens";
import { useInitial } from "../../../lib/initial";
import type { Params } from "../../../server/pages";

const LANG = "en";

export async function generateStaticParams() {
  const { staticParams } = await import("../../../server/pages");
  return staticParams.people("reciters");
}

export async function loader(_: unknown, params: Params) {
  const { pageData, idOf } = await import("../../../server/pages");
  return pageData.person("reciters", idOf(params), LANG);
}

export async function generateMetadata(_: unknown, params: Params) {
  const { pageMeta, idOf } = await import("../../../server/pages");
  return pageMeta.person("reciters", idOf(params), LANG);
}

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PersonScreen key={id} kind="reciters" id={id} initial={useInitial<typeof loader>()} />;
}
