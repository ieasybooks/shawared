import { PlaylistScreen } from "../../features/saved/PlaylistScreen";

const LANG = "en";

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.playlist(LANG);
}

export default function Route() {
  return <PlaylistScreen />;
}
