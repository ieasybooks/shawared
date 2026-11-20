import { space } from "@shawared/design";
import Constants from "expo-constants";
import { Link } from "expo-router";
import { Platform, StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { TextLink } from "../../components/ui/TextLink";
import { t, type StringKey } from "../../lib/i18n";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import type { ReactNode } from "react";
import { Only } from "../../lib/responsive";
import { ListPage, SectionHead } from "../library/Page";
import { Counts } from "../navigation/Sidebar";
import { ABOUT, PRIVACY, PRIVACY_UPDATED, runs, SUPPORT, TERMS, TERMS_UPDATED, type PageText, type Section } from "./texts";

/** About Shawared: what it is, where its content comes from, and who makes it. */
export function AboutScreen() {
  const { lang } = useSettings();
  // The apps say which version they are, for reports of a problem.
  const version = Platform.OS === "web" ? undefined : Constants.expoConfig?.version;
  // Wide windows have the counts in the sidebar.
  const counts = (
    <Only on="phone">
      <Counts />
    </Only>
  );
  return <TextPage path={paths.about} text={ABOUT[lang]} note={version && t(lang, "version", { v: version })} extra={counts} />;
}

/** The privacy policy of the apps and the website. */
export function PrivacyScreen() {
  const { lang } = useSettings();
  return <TextPage path={paths.privacy} text={PRIVACY[lang]} note={t(lang, "updated", { date: PRIVACY_UPDATED[lang] })} />;
}

/** The terms of use of the apps and the website. */
export function TermsScreen() {
  const { lang } = useSettings();
  return <TextPage path={paths.terms} text={TERMS[lang]} note={t(lang, "updated", { date: TERMS_UPDATED[lang] })} />;
}

/** How to reach us, what helps in a report, and where rights and privacy requests go: the stores' support page. */
export function SupportScreen() {
  const { lang } = useSettings();
  return <TextPage path={paths.support} text={SUPPORT[lang]} />;
}

/** The four pages, each of which ends with links to the other three. */
const PAGES: { path: string; label: StringKey }[] = [
  { path: paths.about, label: "aboutShawared" },
  { path: paths.privacy, label: "privacy" },
  { path: paths.terms, label: "terms" },
  { path: paths.support, label: "support" },
];

/** A page of prose: its title, a lead paragraph and a note under it, its sections, then the other pages. */
function TextPage({ path, text, note, extra }: { path: string; text: PageText; note?: string | undefined; extra?: ReactNode }) {
  const { palette, start, lang, href } = useSettings();
  const type = useType();
  const header = (
    <View style={styles.header}>
      <Paragraph text={text.lead} style={[type.lead, { color: palette.fg, textAlign: start }]} />
      {note && <Text style={[type.label, { color: palette.muted, textAlign: start }]}>{note}</Text>}
      {extra}
    </View>
  );
  const footer = (
    <View style={styles.pages}>
      {PAGES.filter((p) => p.path !== path).map((p) => (
        <TextLink key={p.path} href={href(p.path)}>
          <Text style={[type.controlStrong, { color: palette.accent }]}>{t(lang, p.label)}</Text>
        </TextLink>
      ))}
    </View>
  );
  return (
    <ListPage
      title={text.title}
      back
      header={header}
      footer={footer}
      data={text.sections}
      keyOf={(s) => s.title}
      renderItem={(s) => <SectionView section={s} />}
      maxWidth={680}
      estimatedItemSize={160}
    />
  );
}

function SectionView({ section }: { section: Section }) {
  const { palette, start } = useSettings();
  const type = useType();
  return (
    <View style={styles.section}>
      <SectionHead title={section.title} />
      {section.body.map((p) => (
        <Paragraph key={p} text={p} style={[type.prose, { color: palette.fg, textAlign: start }]} />
      ))}
    </View>
  );
}

/**
 * A paragraph whose links sit in its text: a page of Shawared's opens in the reader's language,
 * an email address in the mail app, and a web address (on the web, in a new tab).
 */
function Paragraph({ text, style }: { text: string; style: StyleProp<TextStyle> }) {
  const { palette, href } = useSettings();
  const link = StyleSheet.flatten([styles.link, { textDecorationColor: palette.line2 }]);
  return (
    <Text style={style}>
      {runs(text).map((r, i) =>
        r.href === undefined ? (
          r.text
        ) : (
          <Link
            key={i}
            href={r.href.startsWith("/") ? href(r.href) : r.href}
            {...(r.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            style={link}
          >
            {r.text}
          </Link>
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.l },
  section: { gap: space.l, paddingBottom: space.xxl },
  pages: { flexDirection: "row", flexWrap: "wrap", columnGap: space.xl, rowGap: space.l },
  link: { textDecorationLine: "underline" },
});
