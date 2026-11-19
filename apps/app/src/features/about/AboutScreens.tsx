import { space } from "@shawared/design";
import Constants from "expo-constants";
import { Platform, StyleSheet, Text, View } from "react-native";
import { TextLink } from "../../components/ui/TextLink";
import { t } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { ListPage, SectionHead } from "../library/Page";
import { ABOUT, CONTACT, PRIVACY, PRIVACY_UPDATED, SUPPORT, type PageText, type Section } from "./texts";

/** About Shawared: what it is, who makes it, how to reach us, and the way to the privacy policy. */
export function AboutScreen() {
  const { lang } = useSettings();
  // The apps say which version they are, for reports of a problem.
  const version = Platform.OS === "web" ? undefined : Constants.expoConfig?.version;
  return <TextPage text={ABOUT[lang]} note={version && t(lang, "version", { v: version })} />;
}

/** The privacy policy of the apps and the website. */
export function PrivacyScreen() {
  const { lang } = useSettings();
  return <TextPage text={PRIVACY[lang]} note={t(lang, "updated", { date: PRIVACY_UPDATED[lang] })} />;
}

/** How to reach us, what helps in a report, and where privacy requests go: the stores' support page. */
export function SupportScreen() {
  const { lang } = useSettings();
  return <TextPage text={SUPPORT[lang]} />;
}

/** A page of prose: its title, a lead paragraph and a note under it, then its sections. */
function TextPage({ text, note }: { text: PageText; note?: string | undefined }) {
  const { palette, start } = useSettings();
  const type = useType();
  const header = (
    <View style={styles.header}>
      <Text style={[type.lead, { color: palette.fg, textAlign: start }]}>{text.lead}</Text>
      {note && <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{note}</Text>}
    </View>
  );
  return (
    <ListPage
      title={text.title}
      back
      header={header}
      data={text.sections}
      keyOf={(s) => s.title}
      renderItem={(s) => <SectionView section={s} />}
      maxWidth={680}
      estimatedItemSize={160}
    />
  );
}

function SectionView({ section }: { section: Section }) {
  const { palette, lang, start, href } = useSettings();
  const type = useType();
  return (
    <View style={styles.section}>
      <SectionHead title={section.title} />
      {section.body.map((p) => (
        <Text key={p} style={[type.prose, { color: palette.fg, textAlign: start }]}>
          {p}
        </Text>
      ))}
      {section.email && (
        <TextLink href={`mailto:${CONTACT}`}>
          <Text style={[type.controlStrong, styles.ltr, { color: palette.accent }]}>{CONTACT}</Text>
        </TextLink>
      )}
      {section.support && (
        <TextLink href={href(paths.support)}>
          <Text style={[type.controlStrong, { color: palette.accent }]}>{t(lang, "support")}</Text>
        </TextLink>
      )}
      {section.privacy && (
        <TextLink href={href(paths.privacy)}>
          <Text style={[type.controlStrong, { color: palette.accent }]}>{t(lang, "privacy")}</Text>
        </TextLink>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.l },
  section: { gap: space.l, paddingBottom: space.xxl },
  ltr: { writingDirection: "ltr" },
});
