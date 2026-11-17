import type { UiLang } from "@shawared/contracts";
import { usePathname } from "expo-router";
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, type HostInstance } from "react-native";
import { IconButton, IconLink, Nuqta, type PressState } from "../../components/ui/controls";
import { Dir } from "../../components/ui/Dir";
import { t } from "../../lib/i18n";
import { langOfPath, paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { typeFor } from "../../lib/type";
import { useWindowWidth } from "../../lib/viewport";

const LANGS: { value: UiLang; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];
const MENU_W = 176;

/** Appearance and language, as two icon buttons, and with `about` a link to the About page. */
export function SettingsButtons({ size = 40, about = false }: { size?: number; about?: boolean }) {
  return (
    <View style={styles.row}>
      <ThemeToggle size={size} />
      <LanguageMenu size={size} />
      {about && <AboutLink size={size} />}
    </View>
  );
}

/** An "i" that opens About Shawared, which leads on to the privacy policy. */
function AboutLink({ size }: { size: number }) {
  const { lang, href, palette } = useSettings();
  const pathname = usePathname();
  const bare = langOfPath(pathname) === "en" ? pathname.slice(3) : pathname;
  return (
    <IconLink
      icon="info"
      label={t(lang, "aboutShawared")}
      href={href(paths.about)}
      current={bare === paths.about}
      size={size}
      iconSize={size * 0.5}
      color={palette.fg}
    />
  );
}

/** One button: a moon by day, a sun by night. */
function ThemeToggle({ size }: { size: number }) {
  const { theme, setTheme, lang, palette } = useSettings();
  const night = theme === "night";
  return (
    <IconButton
      icon={night ? "sun" : "moon"}
      label={t(lang, night ? "toDay" : "toNight")}
      onPress={() => setTheme(night ? "day" : "night")}
      size={size}
      iconSize={size * 0.5}
      color={palette.fg}
    />
  );
}

/** A globe that opens the list of languages, each written in its own script. */
function LanguageMenu({ size }: { size: number }) {
  const { lang, setLang, palette, rtl } = useSettings();
  const width = useWindowWidth();
  const anchor = useRef<HostInstance>(null);
  const [at, setAt] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const close = () => setAt(null);
  const open = () => anchor.current?.measureInWindow((x, y, w, h) => setAt({ x, y, w, h }));
  // The menu hangs from the button and grows toward the middle of the screen.
  const left = at ? Math.max(8, Math.min(width - MENU_W - 8, rtl ? at.x : at.x + at.w - MENU_W)) : 0;

  return (
    <>
      <View ref={anchor} collapsable={false}>
        <IconButton
          icon="globe"
          label={t(lang, "language")}
          onPress={open}
          pressed={at !== null}
          size={size}
          iconSize={size * 0.5}
          color={palette.fg}
        />
      </View>
      <Modal visible={at !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <Pressable accessibilityLabel={t(lang, "close")} style={StyleSheet.absoluteFill} onPress={close} />
        {at && (
          <Dir
            dir={rtl ? "rtl" : "ltr"}
            accessibilityRole="menu"
            accessibilityLabel={t(lang, "language")}
            style={[
              styles.menu,
              {
                top: at.y + at.h + 6,
                left,
                width: MENU_W,
                backgroundColor: palette.raise,
                borderColor: palette.line,
                shadowColor: palette.shadow,
              },
            ]}
          >
            {LANGS.map((o) => {
              const on = o.value === lang;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="menuitem"
                  accessibilityState={{ checked: on }}
                  accessibilityLanguage={o.value}
                  onPress={() => {
                    setLang(o.value);
                    close();
                  }}
                  style={(s: PressState) => [styles.item, (s.hovered || s.pressed) && { backgroundColor: palette.fold }]}
                >
                  <Text style={[typeFor(o.value)[on ? "controlStrong" : "control"], { color: on ? palette.fg : palette.muted }]}>
                    {o.label}
                  </Text>
                  {on && <Nuqta />}
                </Pressable>
              );
            })}
          </Dir>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  menu: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 12,
  },
  item: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
