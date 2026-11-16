import { useLocalSearchParams } from "expo-router";
import { ListeningScreen } from "../../features/listening/ListeningScreen";
import { useInitial } from "../../lib/initial";
import { useHydrated } from "../../lib/viewport";
import type { Params } from "../../server/pages";

const LANG = "ar";

export async function generateStaticParams() {
  const { staticParams } = await import("../../server/pages");
  return staticParams.poems();
}

export async function loader(_: unknown, params: Params) {
  const { pageData, idOf } = await import("../../server/pages");
  return pageData.poem(idOf(params), LANG);
}

export async function generateMetadata(_: unknown, params: Params) {
  const { pageMeta, idOf } = await import("../../server/pages");
  return pageMeta.poem(idOf(params), LANG);
}

export default function Route() {
  const { id, b } = useLocalSearchParams<{ id: string; b?: string }>();
  // Pages are rendered ahead of time without the address's query: a link to one bayt
  // takes effect once the page is live.
  const hydrated = useHydrated();
  return <ListeningScreen key={id} id={id} bayt={hydrated && b ? Number(b) : undefined} initial={useInitial<typeof loader>()} />;
}
