import { RhymesScreen } from "../../features/rhymes/RhymesScreens";
import { useInitial } from "../../lib/initial";

const LANG = "ar";

export async function loader() {
  const { pageData } = await import("../../server/pages");
  return pageData.rhymes();
}

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.rhymes(LANG);
}

export default function Route() {
  return <RhymesScreen initial={useInitial<typeof loader>()} />;
}
