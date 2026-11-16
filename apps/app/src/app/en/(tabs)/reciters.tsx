import { PeopleScreen } from "../../../features/people/PeopleScreens";
import { useInitial } from "../../../lib/initial";

const LANG = "en";

export async function loader() {
  const { pageData } = await import("../../../server/pages");
  return pageData.people("reciters");
}

export async function generateMetadata() {
  const { pageMeta } = await import("../../../server/pages");
  return pageMeta.people("reciters", LANG);
}

export default function Route() {
  return <PeopleScreen kind="reciters" initial={useInitial<typeof loader>()} />;
}
