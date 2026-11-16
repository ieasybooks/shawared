// Every text in the app uses one of these roles. Each is trimmed to its ink (see
// packages/design/src/type.ts), so layouts space texts with true gaps from `space`.
import type { UiLang } from "@shawared/contracts";
import { textBox } from "@shawared/design";
import { useSettings } from "./settings";

function roles(lang: UiLang) {
  const script = lang === "ar" ? "ar" : "latin";
  const en = lang === "en";
  return {
    // Arabic content in Amiri, the same in every language.
    verse: textBox("verse", 19.5, "ar", 2.05),
    verseWide: textBox("verse", 22, "ar", 2.05),
    verseSmall: textBox("verse", 17, "ar", 2.05),
    title: textBox("verseBold", 26, "ar", 2.05),
    titleWide: textBox("verseBold", 28, "ar", 2.05),
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

    // English under the verses, and translated titles.
    translation: textBox("translation", 14, "latin", 1.43),
    translationWide: textBox("translation", 14.5, "latin", 1.43),
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

export type Type = ReturnType<typeof roles>;
const cache: Partial<Record<UiLang, Type>> = {};

export function typeFor(lang: UiLang): Type {
  return (cache[lang] ??= roles(lang));
}

/** The type roles for the reader's language. */
export function useType(): Type {
  return typeFor(useSettings().lang);
}
