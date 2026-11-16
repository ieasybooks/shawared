import { HomeScreen } from "../../features/library/HomeScreen";
import { useInitial } from "../../lib/initial";

const LANG = "ar";

export async function loader() {
  const { pageData } = await import("../../server/pages");
  return pageData.home();
}

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.home(LANG);
}

export default function Route() {
  return <HomeScreen initial={useInitial<typeof loader>()} />;
}
