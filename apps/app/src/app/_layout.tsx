import { Amiri_400Regular } from "@expo-google-fonts/amiri/400Regular";
import { Amiri_700Bold } from "@expo-google-fonts/amiri/700Bold";
import { Newsreader_400Regular } from "@expo-google-fonts/newsreader/400Regular";
import { Newsreader_400Regular_Italic } from "@expo-google-fonts/newsreader/400Regular_Italic";
import { ReadexPro_400Regular } from "@expo-google-fonts/readex-pro/400Regular";
import { ReadexPro_500Medium } from "@expo-google-fonts/readex-pro/500Medium";
import { ReemKufi_600SemiBold } from "@expo-google-fonts/reem-kufi/600SemiBold";
import { useFonts } from "expo-font";
import { LocaleProvider, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Dir } from "../components/ui/Dir";
import { loadCatalog } from "../lib/content";
import { refreshDownloads } from "../lib/downloads";
import { SettingsProvider, useSettings } from "../lib/settings";

// An app opened on a poem or a poet (a shared link) keeps the tabs underneath, so back leads
// home. The web has the browser's history, and renders each page on its own.
export const unstable_settings = Platform.OS === "web" ? {} : { initialRouteName: "(tabs)" };

export default function RootLayout() {
  const [loaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    ReadexPro_400Regular,
    ReadexPro_500Medium,
    ReemKufi_600SemiBold,
  });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Screens />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function Screens() {
  const { palette, theme, lang, rtl } = useSettings();
  // The apps keep downloaded recordings in step with the catalog (lib/downloads).
  useEffect(() => {
    if (Platform.OS !== "web") void loadCatalog().then((c) => c && refreshDownloads(c));
  }, []);
  return (
    <Dir dir={rtl ? "rtl" : "ltr"} lang={lang} style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={theme === "night" ? "light" : "dark"} />
      {/* The stack follows the reading direction: on iOS, Arabic pages slide in from the left
          and swipe back from the right edge. */}
      <LocaleProvider direction={rtl ? "rtl" : "ltr"}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }} />
      </LocaleProvider>
    </Dir>
  );
}
