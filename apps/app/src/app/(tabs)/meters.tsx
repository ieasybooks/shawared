import { MetersScreen } from "../../features/meters/MetersScreens";
import { useInitial } from "../../lib/initial";

const LANG = "ar";

export async function loader() {
  const { pageData } = await import("../../server/pages");
  return pageData.meters();
}

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.meters(LANG);
}

export default function Route() {
  return <MetersScreen initial={useInitial<typeof loader>()} />;
}
