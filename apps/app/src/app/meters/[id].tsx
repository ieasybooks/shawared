import { useLocalSearchParams } from "expo-router";
import { MeterScreen } from "../../features/meters/MetersScreens";
import { useInitial } from "../../lib/initial";
import type { Params } from "../../server/pages";

const LANG = "ar";

export async function generateStaticParams() {
  const { staticParams } = await import("../../server/pages");
  return staticParams.meters();
}

export async function loader(_: unknown, params: Params) {
  const { pageData, idOf } = await import("../../server/pages");
  return pageData.meter(idOf(params));
}

export async function generateMetadata(_: unknown, params: Params) {
  const { pageMeta, idOf } = await import("../../server/pages");
  return pageMeta.meter(idOf(params), LANG);
}

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MeterScreen key={id} id={id} initial={useInitial<typeof loader>()} />;
}
