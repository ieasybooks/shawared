import { useLocalSearchParams } from "expo-router";
import { ThemeScreen } from "../../features/themes/ThemesScreens";
import { useInitial } from "../../lib/initial";
import type { Params } from "../../server/pages";

const LANG = "ar";

export async function generateStaticParams() {
  const { staticParams } = await import("../../server/pages");
  return staticParams.themes();
}

export async function loader(_: unknown, params: Params) {
  const { pageData, idOf } = await import("../../server/pages");
  return pageData.theme(idOf(params));
}

export async function generateMetadata(_: unknown, params: Params) {
  const { pageMeta, idOf } = await import("../../server/pages");
  return pageMeta.theme(idOf(params), LANG);
}

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ThemeScreen key={id} id={id} initial={useInitial<typeof loader>()} />;
}
