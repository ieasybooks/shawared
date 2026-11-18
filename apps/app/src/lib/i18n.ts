import type { UiLang } from "@shawared/contracts";

const ar = {
  brand: "شوارد",
  tagline: "الشعر العربي كما يُلقى: تسمعه، وتقرأ أبياته، وتفهم معانيه.",
  poems: "القصائد",
  tabHome: "الرئيسية",
  poets: "الشعراء",
  reciters: "المُلقون",
  meters: "البحور",
  search: "ابحث بعنوان أو مطلع قصيدة أو شاعر أو مُلقٍ",
  searchPoets: "ابحث عن شاعر",
  searchReciters: "ابحث عن مُلقٍ",
  clearSearch: "امسح البحث",
  closePlayer: "أغلق المشغّل",
  noResults: "لا نتائج تطابق بحثك",
  latest: "أحدث القصائد",
  youtube: "يوتيوب",
  pattern: "التفعيلات",
  by: "من شعر",
  recitedBy: "إلقاء {name}",
  now: "البيت {n} من {N}",
  verse: "البيت {n}",
  expl: "الشرح",
  words: "معاني الكلمات",
  root: "الجذر: {r}",
  back: "رجوع",
  repeat: "تكرار البيت",
  continuous: "تشغيل القصيدة التالية تلقائيًا",
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
  language: "اللغة",
  toNight: "المظهر الليلي",
  toDay: "المظهر النهاري",
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
  aboutShawared: "عن شوارد",
  privacy: "سياسة الخصوصية",
  version: "الإصدار {v}",
  updated: "آخر تحديث: {date}",
  // Page descriptions, for search engines and link previews.
  siteTitle: "شوارد · الشعر العربي كما يُلقى",
  metaPoem: "{opening}. من شعر {poet} على بحر {meter}، {abyat}، بإلقاء {reciter}.",
  metaNotes: "مع الشرح ومعاني الكلمات.",
  metaPerson: "{name}: {count} في شوارد.",
  metaPoets: "شعراء العربية في شوارد، وقصائدهم كما تُلقى.",
  metaReciters: "المُلقون في شوارد، والقصائد التي يلقونها.",
  metaMeters: "بحور الشعر العربي الستة عشر وتفعيلاتها، وقصائد كل بحر.",
  metaMeter: "بحر {meter}: {feet}. {count} في شوارد.",
} as const;

export type StringKey = keyof typeof ar;

const en: Record<StringKey, string> = {
  brand: "Shawared",
  tagline: "Arabic poetry as it is recited: hear it, read it, understand it.",
  poems: "Poems",
  tabHome: "Home",
  poets: "Poets",
  reciters: "Reciters",
  meters: "Meters",
  search: "Search by title, opening verse, poet or reciter",
  searchPoets: "Search the poets",
  searchReciters: "Search the reciters",
  clearSearch: "Clear the search",
  closePlayer: "Close the player",
  noResults: "Nothing matches your search",
  latest: "Latest poems",
  youtube: "YouTube",
  pattern: "Feet",
  by: "Poem by",
  recitedBy: "Recited by {name}",
  now: "Verse {n} of {N}",
  verse: "Verse {n}",
  expl: "Explanation",
  words: "Word meanings",
  root: "Root {r}",
  back: "Back",
  repeat: "Repeat verse",
  continuous: "Autoplay the next poem",
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
  language: "Language",
  toNight: "Switch to night",
  toDay: "Switch to day",
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
  aboutShawared: "About Shawared",
  privacy: "Privacy policy",
  version: "Version {v}",
  updated: "Last updated: {date}",
  siteTitle: "Shawared · Arabic poetry as it is recited",
  metaPoem: "{opening}. A poem by {poet} in the {meter} meter, {abyat}, recited by {reciter}.",
  metaNotes: "With a translation, explanations and word meanings.",
  metaPerson: "{name}: {count} on Shawared.",
  metaPoets: "The poets on Shawared, and their poems as they are recited.",
  metaReciters: "The reciters on Shawared, and the poems they recite.",
  metaMeters: "The sixteen meters of Arabic poetry, their feet, and the poems in each.",
  metaMeter: "The {meter} meter: {feet}. {count} on Shawared.",
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

/** "قصيدة واحدة", "قصيدتان", "٣ قصائد", "١١ قصيدةً", "3 poems" */
export function poemsCount(n: number, lang: UiLang) {
  if (n === 0) return lang === "en" ? "No poems yet" : "لا قصائد بعد";
  if (lang === "en") return `${n} poem${n === 1 ? "" : "s"}`;
  if (n === 1) return "قصيدة واحدة";
  if (n === 2) return "قصيدتان";
  if (n <= 10) return `${digits(n, lang)} قصائد`;
  return `${digits(n, lang)} قصيدةً`;
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
export const METER_IDS = Object.keys(METERS);

/** The feet of one half-verse of each meter, in its full form. */
export const METER_FEET: Record<string, string> = {
  tawil: "فَعولُنْ مَفاعيلُنْ فَعولُنْ مَفاعيلُنْ",
  madid: "فاعِلاتُنْ فاعِلُنْ فاعِلاتُنْ",
  basit: "مُسْتَفْعِلُنْ فاعِلُنْ مُسْتَفْعِلُنْ فاعِلُنْ",
  wafir: "مُفاعَلَتُنْ مُفاعَلَتُنْ فَعولُنْ",
  kamil: "مُتَفاعِلُنْ مُتَفاعِلُنْ مُتَفاعِلُنْ",
  hazaj: "مَفاعيلُنْ مَفاعيلُنْ",
  rajaz: "مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ",
  ramal: "فاعِلاتُنْ فاعِلاتُنْ فاعِلُنْ",
  sari: "مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ مَفْعولاتُ",
  munsarih: "مُسْتَفْعِلُنْ مَفْعولاتُ مُسْتَفْعِلُنْ",
  khafif: "فاعِلاتُنْ مُسْتَفْعِلُنْ فاعِلاتُنْ",
  mudari: "مَفاعيلُنْ فاعِلاتُنْ",
  muqtadab: "مَفْعولاتُ مُسْتَفْعِلُنْ",
  mujtath: "مُسْتَفْعِلُنْ فاعِلاتُنْ",
  mutaqarib: "فَعولُنْ فَعولُنْ فَعولُنْ فَعولُنْ",
  mutadarik: "فاعِلُنْ فاعِلُنْ فاعِلُنْ فاعِلُنْ",
};

const LETTERS: Record<string, [string, string]> = {
  ء: ["الهمزة", "hamza"],
  ا: ["الألف", "alif"],
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
