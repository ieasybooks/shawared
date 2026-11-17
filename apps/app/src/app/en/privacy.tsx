import { PrivacyScreen } from "../../features/about/AboutScreens";

const LANG = "en";

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.privacy(LANG);
}

export default function Route() {
  return <PrivacyScreen />;
}
