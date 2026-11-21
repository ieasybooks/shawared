import { Redirect } from "expo-router";
import { paths } from "../../lib/routes";

/** The apps have no use for the page that leads to them (StoresScreen.web.tsx): a link to it opens home. */
export function StoresScreen() {
  return <Redirect href={paths.home} />;
}
