import { Tabs } from "expo-router/tabs";
import { TabBar } from "../../features/navigation/TabBar";
import { TABS } from "../../features/navigation/tabs";
import { useSettings } from "../../lib/settings";

/**
 * Home, Poets, Reciters, Themes and the reader's library, with the mini player above the tabs. Each page draws its
 * own top bar (phones) or site header (wide windows). Pages opened from these (a poem, a
 * poet, a reciter, a meter) sit on the root stack above the tabs, so back retraces the
 * reader's steps.
 */
export default function TabsLayout() {
  const { palette } = useSettings();
  return (
    <Tabs tabBar={() => <TabBar />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.bg } }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}
