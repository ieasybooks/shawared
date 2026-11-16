import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { Newsreader_400Regular, Newsreader_400Regular_Italic } from "@expo-google-fonts/newsreader";
import { ReadexPro_300Light, ReadexPro_400Regular, ReadexPro_500Medium } from "@expo-google-fonts/readex-pro";
import { ReemKufi_600SemiBold } from "@expo-google-fonts/reem-kufi";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Dir } from "../components/ui/Dir";
import { SettingsProvider, useSettings } from "../lib/settings";

export default function RootLayout() {
  const [loaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    ReadexPro_300Light,
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
  return (
    <Dir dir={rtl ? "rtl" : "ltr"} lang={lang} style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={theme === "night" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }} />
    </Dir>
  );
}
