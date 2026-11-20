import { TermsScreen } from "../features/about/AboutScreens";

const LANG = "ar";

export async function generateMetadata() {
  const { pageMeta } = await import("../server/pages");
  return pageMeta.terms(LANG);
}

export default function Route() {
  return <TermsScreen />;
}
