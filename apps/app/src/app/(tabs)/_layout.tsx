import { Tabs } from "expo-router/tabs";
import { TabBar } from "../../features/navigation/TabBar";
import { useSettings } from "../../lib/settings";

/**
 * Home, Poets, Reciters and Meters, with the mini player above the tabs. Each page draws its
 * own top bar (phones) or site header (wide windows). Pages opened from these (a poem, a
 * poet, a reciter, a meter) sit on the root stack above the tabs, so back retraces the
 * reader's steps.
 */
export default function TabsLayout() {
  const { palette } = useSettings();
  return (
    <Tabs tabBar={() => <TabBar />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="poets" />
      <Tabs.Screen name="reciters" />
      <Tabs.Screen name="meters" />
    </Tabs>
  );
}
