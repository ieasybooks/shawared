import { TermsScreen } from "../../features/about/AboutScreens";

const LANG = "en";

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.terms(LANG);
}

export default function Route() {
  return <TermsScreen />;
}
