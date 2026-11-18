import { LibraryScreen } from "../../features/saved/LibraryScreen";

const LANG = "ar";

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.library(LANG);
}

export default function Route() {
  return <LibraryScreen />;
}
