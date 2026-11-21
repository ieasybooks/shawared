import { StoresScreen } from "../features/stores/StoresScreen";

const LANG = "ar";

export async function generateMetadata() {
  const { pageMeta } = await import("../server/pages");
  return pageMeta.app(LANG);
}

export default function Route() {
  return <StoresScreen />;
}
