import { ThemesScreen } from "../../../features/themes/ThemesScreens";
import { useInitial } from "../../../lib/initial";

const LANG = "en";

export async function loader() {
  const { pageData } = await import("../../../server/pages");
  return pageData.themes();
}

export async function generateMetadata() {
  const { pageMeta } = await import("../../../server/pages");
  return pageMeta.themes(LANG);
}

export default function Route() {
  return <ThemesScreen initial={useInitial<typeof loader>()} />;
}
