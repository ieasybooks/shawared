// Every text in the app uses one of these roles. Each is trimmed to its ink (see
// packages/design/src/type.ts), so layouts space texts with true gaps from `space`.
import type { UiLang } from "@shawared/contracts";
import { textBox, type TextBox } from "@shawared/design";
import { responsive, useLayout, type Layout } from "./responsive";
import { useSettings } from "./settings";

function roles(lang: UiLang) {
  const script = lang === "ar" ? "ar" : "latin";
  const en = lang === "en";
  return {
    // Arabic content in Amiri, the same in every language.
    verse: textBox("verse", 19.5, "ar", 2.05),
    verseSmall: textBox("verse", 17, "ar", 2.05),
    cardTitle: textBox("verseBold", 25, "ar", 2.05),
    listTitle: textBox("verseBold", 21, "ar", 2.05),
    smallTitle: textBox("verseBold", 17, "ar", 2.05),
    miniTitle: textBox("verseBold", 16, "ar"),
    wordHead: textBox("verseBold", 31, "ar"),
    wordHeadCompact: textBox("verseBold", 27, "ar"),
    noteHead: textBox("verseBold", 20, "ar"),
    nameAr: textBox("verseBold", 22, "ar"),

    // Interface in Readex Pro, trimmed for the reader's script.
    caption: textBox("ui", 11, script),
    captionStrong: textBox("uiMedium", 11, script),
    // Ink bounds measured across the three Arabic field labels and the catalogue's 67 theme, meter and rhyme names.
    classificationLabel: en ? textBox("ui", 11, "latin") : textBox("ui", 11, "ar", 0, { top: 0.82, bottom: 0.25 }),
    classificationValue: en ? textBox("uiMedium", 14, "latin") : textBox("verseBold", 21, "ar", 0, { top: 1.02, bottom: 0.65 }),
    label: textBox("ui", 12, script),
    labelStrong: textBox("uiMedium", 12, script),
    body: textBox("ui", 13, script),
    bodyStrong: textBox("uiMedium", 13, script),
    control: textBox("ui", 14, script),
    controlStrong: textBox("uiMedium", 14, script),
    menu: textBox("ui", 15, script),
    heading: textBox("uiMedium", 18, script),
    section: textBox("uiMedium", 20, script),
    /** Arabic inside an English interface: the root of a word. */
    captionAr: textBox("ui", 11, "ar"),
    labelAr: textBox("ui", 12, "ar"),

    // Running text: Readex Pro in Arabic, Newsreader in English.
    prose: en ? textBox("translation", 15.5, "latin", 1.6) : textBox("ui", 14, "ar", 1.9),
    proseSmall: en ? textBox("translation", 14.5, "latin", 1.55) : textBox("ui", 13, "ar", 1.8),
    proseLarge: en ? textBox("translation", 17, "latin", 1.55) : textBox("ui", 15, "ar", 1.85),
    lead: en ? textBox("translation", 18, "latin", 1.45) : textBox("ui", 17, "ar", 1.75),
    /** One line of an explanation, cut short. */
    proseLine: en ? textBox("translation", 14.5, "latin") : textBox("ui", 13, "ar"),

    // Translated titles.
    subtitle: textBox("translationItalic", 14, "latin", 1.43),

    // Page titles: in the top bar on phones, at the top of the page on wide windows. Readex,
    // not Reem Kufi: names written in Latin letters need ṭ, ḥ, ʿ and the like.
    barTitle: textBox("uiMedium", 20, script),
    pageTitle: textBox("uiMedium", 30, script, 1.4),

    // The wordmark.
    wordmark: textBox("display", 32, script),
    wordmarkSmall: textBox("display", 21, script),
  };
}

/** The font size of `verseLine`, for what is sized from it (lib/responsive's `scale`). */
export const VERSE_LINE = { phone: 19.5, wide: 22 } as const;

/**
 * The poem page's roles, a size larger on wide windows (lib/responsive). The same in every
 * language: Arabic verses, English translations. On the web their values are CSS that differs
 * by layout: style with them, never read them.
 */
const SIZED = {
  /** The verses of the poem page. */
  verseLine: responsive(textBox("verse", VERSE_LINE.phone, "ar", 2.05), textBox("verse", VERSE_LINE.wide, "ar", 2.05)),
  /** The poem's title on its page. */
  poemTitle: responsive(textBox("verseBold", 26, "ar", 2.05), textBox("verseBold", 28, "ar", 2.05)),
  /** English under the verses. */
  verseTranslation: responsive(textBox("translation", 14, "latin", 1.43), textBox("translation", 14.5, "latin", 1.43)),
};

type Base = ReturnType<typeof roles>;
export type Type = Base & { [K in keyof typeof SIZED]: TextBox };
const cache: Partial<Record<UiLang, Base>> = {};
const sizedCache = new Map<Layout, Partial<Record<UiLang, Type>>>();

/** The roles for a language that are the same in every layout. */
export function typeFor(lang: UiLang): Base {
  return (cache[lang] ??= roles(lang));
}

/** The type roles for the reader's language, in this window's layout. */
export function useType(): Type {
  const { lang } = useSettings();
  const layout = useLayout();
  let forLayout = sizedCache.get(layout);
  if (!forLayout) sizedCache.set(layout, (forLayout = {}));
  return (forLayout[lang] ??= {
    ...typeFor(lang),
    verseLine: layout.style(SIZED.verseLine),
    poemTitle: layout.style(SIZED.poemTitle),
    verseTranslation: layout.style(SIZED.verseTranslation),
  });
}
