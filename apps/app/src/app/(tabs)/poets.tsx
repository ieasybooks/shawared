import { PeopleScreen } from "../../features/people/PeopleScreens";
import { useInitial } from "../../lib/initial";

const LANG = "ar";

export async function loader() {
  const { pageData } = await import("../../server/pages");
  return pageData.people("poets");
}

export async function generateMetadata() {
  const { pageMeta } = await import("../../server/pages");
  return pageMeta.people("poets", LANG);
}

export default function Route() {
  return <PeopleScreen kind="poets" initial={useInitial<typeof loader>()} />;
}
