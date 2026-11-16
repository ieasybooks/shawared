import { Stack } from "expo-router";

/** English pages on the web; the apps keep the language in settings. */
export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
