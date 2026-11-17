import { PrivacyScreen } from "../features/about/AboutScreens";

const LANG = "ar";

export async function generateMetadata() {
  const { pageMeta } = await import("../server/pages");
  return pageMeta.privacy(LANG);
}

export default function Route() {
  return <PrivacyScreen />;
}
