import type { UiLang } from "@shawared/contracts";

const ar = {
  brand: "شوارد",
  tagline: "الشعر العربي كما يُلقى: تسمعه، وتقرأ أبياته، وتفهم معانيه.",
  poems: "القصائد",
  by: "من شعر",
  recitedBy: "إلقاء {name}",
  now: "البيت {n} من {N}",
  verse: "البيت {n}",
  expl: "الشرح",
  words: "معاني الكلمات",
  root: "الجذر: {r}",
  ctx: "من البيت {n} · {half}",
  sadr: "الصدر",
  ajuz: "العَجُز",
  back: "رجوع",
  more: "المزيد",
  repeat: "تكرار البيت",
  prev: "البيت السابق",
  next: "البيت التالي",
  play: "تشغيل",
  pause: "إيقاف مؤقت",
  close: "إغلاق",
  seek: "موضع التشغيل",
  translation: "الترجمة",
  playFrom: "شغّل من البيت {n}",
  nowPlaying: "البيت الحالي",
  expand: "افتح الشرح",
  collapse: "أغلق الشرح",
  sources: "الشروح",
  about: "عن القصيدة",
  aboutPoet: "عن الشاعر",
  readMore: "المزيد",
  readLess: "أقل",
  language: "اللغة",
  theme: "المظهر",
  day: "نهار",
  night: "ليل",
  loading: "جارٍ التحميل",
  loadError: "تعذّر تحميل المحتوى",
  retry: "إعادة المحاولة",
  notFound: "لم نجد هذه الصفحة",
  home: "الصفحة الرئيسية",
  died: "ت {h}هـ",
  rhyme: "قافية {l}",
  listen: "استمع",
  minutes: "{m} د",
} as const;

export type StringKey = keyof typeof ar;

const en: Record<StringKey, string> = {
  brand: "Shawared",
  tagline: "Arabic poetry as it is recited: hear it, read it, understand it.",
  poems: "Poems",
  by: "Poem by",
  recitedBy: "Recited by {name}",
  now: "Verse {n} of {N}",
  verse: "Verse {n}",
  expl: "Explanation",
  words: "Word meanings",
  root: "Root {r}",
  ctx: "Verse {n} · {half}",
  sadr: "first half",
  ajuz: "second half",
  back: "Back",
  more: "More",
  repeat: "Repeat verse",
  prev: "Previous verse",
  next: "Next verse",
  play: "Play",
  pause: "Pause",
  close: "Close",
  seek: "Playback position",
  translation: "Translation",
  playFrom: "Play from verse {n}",
  nowPlaying: "Now playing",
  expand: "Open the explanation",
  collapse: "Close the explanation",
  sources: "Explanations",
  about: "About the poem",
  aboutPoet: "About the poet",
  readMore: "More",
  readLess: "Less",
  language: "Language",
  theme: "Appearance",
  day: "Day",
  night: "Night",
  loading: "Loading",
  loadError: "Couldn't load the content",
  retry: "Try again",
  notFound: "We couldn't find this page",
  home: "Home",
  died: "d. {h} AH / {c} CE",
  rhyme: "Rhymes on {l}",
  listen: "Listen",
  minutes: "{m} min",
};

const STRINGS: Record<UiLang, Record<StringKey, string>> = { ar, en };

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const digits = (v: number | string, lang: UiLang) =>
  lang === "ar" ? String(v).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]!) : String(v);

export function t(lang: UiLang, key: StringKey, vars: Record<string, string | number> = {}) {
  return STRINGS[lang][key].replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined ? "" : typeof v === "number" ? digits(v, lang) : v;
  });
}

export function clock(seconds: number, lang: UiLang) {
  const s = Math.max(0, Math.floor(seconds));
  return digits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`, lang);
}

/** "١٠ أبيات", "١١ بيتًا", "10 verses" */
export function abyatCount(n: number, lang: UiLang) {
  if (lang === "en") return `${n} verse${n === 1 ? "" : "s"}`;
  if (n === 1) return "بيت واحد";
  if (n === 2) return "بيتان";
  if (n <= 10) return `${digits(n, lang)} أبيات`;
  return `${digits(n, lang)} بيتًا`;
}

const METERS: Record<string, [string, string]> = {
  tawil: ["الطويل", "al-Ṭawīl"],
  madid: ["المديد", "al-Madīd"],
  basit: ["البسيط", "al-Basīṭ"],
  wafir: ["الوافر", "al-Wāfir"],
  kamil: ["الكامل", "al-Kāmil"],
  hazaj: ["الهزج", "al-Hazaj"],
  rajaz: ["الرجز", "al-Rajaz"],
  ramal: ["الرمل", "al-Ramal"],
  sari: ["السريع", "al-Sarīʿ"],
  munsarih: ["المنسرح", "al-Munsariḥ"],
  khafif: ["الخفيف", "al-Khafīf"],
  mudari: ["المضارع", "al-Muḍāriʿ"],
  muqtadab: ["المقتضب", "al-Muqtaḍab"],
  mujtath: ["المجتث", "al-Mujtath"],
  mutaqarib: ["المتقارب", "al-Mutaqārib"],
  mutadarik: ["المتدارك", "al-Mutadārik"],
};
export const meterName = (id: string, lang: UiLang) => METERS[id]?.[lang === "ar" ? 0 : 1] ?? id;

const LETTERS: Record<string, [string, string]> = {
  ء: ["الهمزة", "hamza"],
  ب: ["الباء", "bāʾ"],
  ت: ["التاء", "tāʾ"],
  ث: ["الثاء", "thāʾ"],
  ج: ["الجيم", "jīm"],
  ح: ["الحاء", "ḥāʾ"],
  خ: ["الخاء", "khāʾ"],
  د: ["الدال", "dāl"],
  ذ: ["الذال", "dhāl"],
  ر: ["الراء", "rāʾ"],
  ز: ["الزاي", "zāy"],
  س: ["السين", "sīn"],
  ش: ["الشين", "shīn"],
  ص: ["الصاد", "ṣād"],
  ض: ["الضاد", "ḍād"],
  ط: ["الطاء", "ṭāʾ"],
  ظ: ["الظاء", "ẓāʾ"],
  ع: ["العين", "ʿayn"],
  غ: ["الغين", "ghayn"],
  ف: ["الفاء", "fāʾ"],
  ق: ["القاف", "qāf"],
  ك: ["الكاف", "kāf"],
  ل: ["اللام", "lām"],
  م: ["الميم", "mīm"],
  ن: ["النون", "nūn"],
  ه: ["الهاء", "hāʾ"],
  و: ["الواو", "wāw"],
  ي: ["الياء", "yāʾ"],
};
export const rhymeName = (letter: string, lang: UiLang) => t(lang, "rhyme", { l: LETTERS[letter]?.[lang === "ar" ? 0 : 1] ?? letter });
