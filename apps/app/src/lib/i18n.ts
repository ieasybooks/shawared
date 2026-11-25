import { rhymeFor } from "./rhymes";
import type { UiLang } from "@shawared/contracts";

const ar = {
  brand: "شوارد",
  tagline: "الشعر العربي كما يُلقى: تسمعه، وتقرأ أبياته، وتفهم معانيه.",
  poems: "القصائد",
  tabHome: "الرئيسية",
  poets: "الشعراء",
  reciters: "المُلقون",
  meters: "البحور",
  themes: "الأغراض",
  poemTheme: "الغرض",
  poemMeter: "البحر",
  poemRhyme: "القافية",
  eras: "العصور",
  showEras: "عرض كل العصور",
  fewerEras: "عرض أقل",
  clearEra: "كل الشعراء",
  rhymes: "القوافي",
  allRhymes: "كل القوافي",
  byRhymeLetter: "بحسب حرف الرويّ",
  byRecordingCount: "بحسب عدد التسجيلات",
  sortPoets: "ترتيب الشعراء",
  sortReciters: "ترتيب المُلقين",
  sortMeters: "ترتيب البحور",
  sortRhymes: "ترتيب القوافي",
  metaRhymes: "تصفّح قصائد شوارد بحسب حرف الرويّ.",
  metaRhyme: "قصائد {name} في شوارد. تضمّ المجموعة {count}.",
  searchThemes: "ابحث عن غرض شعري",
  byPoemCount: "بحسب عدد القصائد",
  alphabetical: "بحسب الترتيب الهجائي",
  sortThemes: "ترتيب الأغراض",
  otherSubjects: "موضوعات أخرى",
  allMeters: "كل البحور",
  themePoems: "قصائد {name}",
  noThemes: "الأغراض غير متاحة في نسخة الفهرس هذه.",
  metaThemes: "تصفّح القصائد بحسب أغراضها الشعرية، واقرأ تعريف كل غرض وبيتًا من شعره.",
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
  repeat: "التكرار",
  repeatPoem: "القصيدة كلها",
  repeatBayt: "هذا البيت",
  repeatTipOff: "اضغط لتكرار القصيدة كلها، ومرةً أخرى لتكرار البيت وحده.",
  repeatTipPoem: "تبدأ القصيدة من أولها كلما انتهت. اضغط لتكرار البيت وحده.",
  repeatTipBayt: "يُعاد البيت الذي يُلقى مرةً بعد مرة. اضغط لإيقاف التكرار.",
  continuousHeld: "لا يعمل ما دام التكرار مفعّلًا.",
  continuous: "تشغيل القصيدة التالية تلقائيًا",
  continuousTip: "حين تنتهي القصيدة تبدأ التي تليها في القائمة التي فتحتها منها.",
  isOn: "مفعّل",
  isOff: "متوقف",
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
  terms: "شروط الاستخدام",
  support: "التواصل والدعم",
  version: "الإصدار {v}",
  updated: "آخر تحديث: {date}",
  appTitle: "تطبيق شوارد",
  appLead: "شوارد على هاتفك وجهازك اللوحي: تسمع القصائد والشاشة مقفلة، وتنزّل ما تحب منها لتسمعه بلا إنترنت.",
  appStoreBadge: "تنزيل شوارد من App Store",
  googlePlayBadge: "تنزيل شوارد من Google Play",
  appGalleryBadge: "تنزيل شوارد من HUAWEI AppGallery",
  appScan: "على حاسوبك؟ امسح الرمز بكاميرا هاتفك، يأخذك إلى متجر تطبيقاته.",
  appQr: "رمز QR لصفحة تطبيق شوارد",
  appBannerText: "استمع في تطبيق شوارد",
  openApp: "فتح",
  // Page descriptions, for search engines and link previews.
  siteTitle: "شوارد · الشعر العربي كما يُلقى",
  metaPoem: "{opening}. من شعر {poet} على بحر {meter}، {abyat}، بإلقاء {reciter}.",
  metaNotes: "مع الشرح ومعاني الكلمات.",
  metaPerson: "{name}: {count} في شوارد.",
  metaPoets: "شعراء العربية في شوارد، وقصائدهم كما تُلقى.",
  metaReciters: "المُلقون في شوارد، والقصائد التي يلقونها.",
  metaMeters: "بحور الشعر العربي الستة عشر وتفعيلاتها، وقصائد كل بحر.",
  metaApp: "حمّل تطبيق شوارد من App Store وGoogle Play وAppGallery.",
  metaMeter: "بحر {meter}: {feet}. {count} في شوارد.",
  // The reader's library: favourites, playlists and downloads.
  library: "مكتبتي",
  favPoems: "القصائد المفضّلة",
  favPoets: "الشعراء المفضّلون",
  favReciters: "المُلقون المفضّلون",
  playlists: "قوائمي",
  downloads: "التنزيلات",
  addFav: "أضف إلى المفضّلة",
  removeFav: "أزل من المفضّلة",
  favourite: "في المفضّلة",
  addToPlaylist: "أضف إلى قائمة",
  newPlaylist: "قائمة جديدة",
  playlistName: "اسم القائمة",
  untitled: "قائمة بلا اسم",
  create: "أنشئ",
  cancel: "إلغاء",
  save: "احفظ",
  rename: "غيّر الاسم",
  deletePlaylist: "احذف القائمة",
  deletePlaylistAsk: "أتحذف قائمة «{name}»؟ القصائد نفسها تبقى.",
  delete: "احذف",
  playAll: "شغّل الكل",
  edit: "رتّب",
  done: "تمّ",
  moveUp: "انقل إلى أعلى",
  moveDown: "انقل إلى أسفل",
  removeFromPlaylist: "أزل من القائمة",
  download: "نزّل للاستماع دون اتصال",
  downloading: "جارٍ التنزيل",
  downloadingPct: "جارٍ التنزيل، {p}٪",
  stopDownload: "أوقف التنزيل",
  downloaded: "منزّلة للاستماع دون اتصال",
  removeDownload: "احذف التنزيل",
  removeDownloadAsk: "أتحذف تنزيل «{title}»؟ ستحتاج بعدها إلى اتصال لتسمعها.",
  libraryEmpty: "احفظ هنا ما تحب: اضغط القلب في صفحة قصيدة أو شاعر أو مُلقٍ، وأنشئ قوائم تسمع فيها القصائد بالترتيب الذي تريد.",
  playlistEmpty: "القائمة فارغة. أضف إليها قصائد من صفحاتها، بزر «أضف إلى قائمة».",
  playlistMissing: "لم نجد هذه القائمة على هذا الجهاز.",
  savedApp: "يُحفظ هذا على جهازك وحده.",
  savedWeb: "يُحفظ هذا في هذا المتصفح وحده.",
  metaLibrary: "ما حفظته في شوارد: قصائدك وشعراؤك ومُلقوك المفضّلون، وقوائمك.",
  // The redesign's player and poem page.
  back10: "رجوع ١٠ ثوانٍ",
  forward10: "تقديم ١٠ ثوانٍ",
  mute: "اكتم الصوت",
  unmute: "أعد الصوت",
  versesHint: "مرّر على الكلمة المنقّطة لمعناها، واضغط رقم البيت لتسمعه منه، والبيتَ لشرحه.",
  wordHint: "اضغط الكلمة لشرح البيت كله",
  read: "اقرأ القصيدة وشرحها",
  favourites: "المفضّلة",
  length: "المدة",
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
  themes: "Themes",
  poemTheme: "Theme",
  poemMeter: "Meter",
  poemRhyme: "Rhyme",
  eras: "Eras",
  showEras: "Show all eras",
  fewerEras: "Show fewer",
  clearEra: "All poets",
  rhymes: "Rhymes",
  allRhymes: "All rhymes",
  byRhymeLetter: "By rhyme letter",
  byRecordingCount: "By recording count",
  sortPoets: "Sort poets",
  sortReciters: "Sort reciters",
  sortMeters: "Sort meters",
  sortRhymes: "Sort rhymes",
  metaRhymes: "Browse the poems on Shawared by their Arabic rhyme letter.",
  metaRhyme: "{name} on Shawared. Browse the collection of {count}.",
  searchThemes: "Search poetic themes",
  byPoemCount: "By poem count",
  alphabetical: "Alphabetical",
  sortThemes: "Sort themes",
  otherSubjects: "Other subjects",
  allMeters: "All meters",
  themePoems: "Poems in this theme",
  noThemes: "Themes are unavailable in this copy of the catalogue.",
  metaThemes: "Browse poems by their poetic themes, with a definition and a verse from each collection.",
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
  repeat: "Repeat",
  repeatPoem: "Whole poem",
  repeatBayt: "This verse",
  repeatTipOff: "Tap to repeat the whole poem, and again to repeat just the verse.",
  repeatTipPoem: "The poem starts over each time it ends. Tap to repeat just the verse.",
  repeatTipBayt: "The verse being recited plays again and again. Tap to stop repeating.",
  continuousHeld: "Waits while repeat is on.",
  continuous: "Autoplay the next poem",
  continuousTip: "When the poem ends, the next one in the list you opened it from begins.",
  isOn: "On",
  isOff: "Off",
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
  terms: "Terms of use",
  support: "Contact & support",
  version: "Version {v}",
  updated: "Last updated: {date}",
  appTitle: "The Shawared app",
  appLead: "Shawared on your phone and tablet: listen with the screen locked, and download the poems you love to hear them offline.",
  appStoreBadge: "Download Shawared on the App Store",
  googlePlayBadge: "Get Shawared on Google Play",
  appGalleryBadge: "Get Shawared from HUAWEI AppGallery",
  appScan: "On a computer? Scan the code with your phone's camera to go to its app store.",
  appQr: "QR code for the Shawared app page",
  appBannerText: "Listen in the Shawared app",
  openApp: "Open",
  siteTitle: "Shawared · Arabic poetry as it is recited",
  metaPoem: "{opening}. A poem by {poet} in the {meter} meter, {abyat}, recited by {reciter}.",
  metaNotes: "With a translation, explanations and word meanings.",
  metaPerson: "{name}: {count} on Shawared.",
  metaPoets: "The poets on Shawared, and their poems as they are recited.",
  metaReciters: "The reciters on Shawared, and the poems they recite.",
  metaMeters: "The sixteen meters of Arabic poetry, their feet, and the poems in each.",
  metaApp: "Get the Shawared app on the App Store, Google Play and AppGallery.",
  metaMeter: "The {meter} meter: {feet}. {count} on Shawared.",
  library: "My library",
  favPoems: "Favorite poems",
  favPoets: "Favorite poets",
  favReciters: "Favorite reciters",
  playlists: "My playlists",
  downloads: "Downloads",
  addFav: "Add to favorites",
  removeFav: "Remove from favorites",
  favourite: "In favorites",
  addToPlaylist: "Add to a playlist",
  newPlaylist: "New playlist",
  playlistName: "Playlist name",
  untitled: "Untitled playlist",
  create: "Create",
  cancel: "Cancel",
  save: "Save",
  rename: "Rename",
  deletePlaylist: "Delete playlist",
  deletePlaylistAsk: "Delete the playlist “{name}”? The poems themselves stay.",
  delete: "Delete",
  playAll: "Play all",
  edit: "Reorder",
  done: "Done",
  moveUp: "Move up",
  moveDown: "Move down",
  removeFromPlaylist: "Remove from playlist",
  download: "Download for offline listening",
  downloading: "Downloading",
  downloadingPct: "Downloading, {p}%",
  stopDownload: "Stop downloading",
  downloaded: "Downloaded for offline listening",
  removeDownload: "Remove download",
  removeDownloadAsk: "Remove the download of “{title}”? You'll need a connection to hear it again.",
  libraryEmpty:
    "Keep what you love here: tap the heart on a poem's, poet's or reciter's page, and make playlists to hear poems in the order you like.",
  playlistEmpty: "This playlist is empty. Add poems to it from their pages, with “Add to a playlist”.",
  playlistMissing: "We couldn't find this playlist on this device.",
  savedApp: "This is saved on this device only.",
  savedWeb: "This is saved in this browser only.",
  metaLibrary: "What you've kept on Shawared: your favorite poems, poets and reciters, and your playlists.",
  back10: "Back 10 seconds",
  forward10: "Forward 10 seconds",
  mute: "Mute",
  unmute: "Unmute",
  versesHint: "Hover a dotted word for its meaning; click a verse number to hear it, a verse to read its notes.",
  wordHint: "Click the word for the verse's notes",
  read: "Read it, with notes",
  favourites: "Favorites",
  length: "Length",
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

/** "١٫٢٥×", "1.25×": a playback speed. */

/** "٤٫٢ ميغابايت", "4.2 MB": a download's size. */
export function sizeOf(bytes: number, lang: UiLang) {
  const mb = bytes / 1_000_000;
  const n = mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10;
  if (lang === "en") return `${n} MB`;
  return `${digits(String(n).replace(".", "٫"), lang)} ميغابايت`;
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

export function themesCount(n: number, lang: UiLang) {
  if (lang === "en") return `${n} theme${n === 1 ? "" : "s"}`;
  if (n === 0) return "لا أغراض";
  if (n === 1) return "غرض شعري واحد";
  if (n === 2) return "غرضان شعريان";
  return n <= 10 ? `${digits(n, lang)} أغراض شعرية` : `${digits(n, lang)} غرضًا شعريًا`;
}

const directoryNouns = {
  poets: ["poet", "شاعر واحد", "شاعران", "شعراء", "شاعرًا"],
  reciters: ["reciter", "مُلقٍ واحد", "مُلقيان", "مُلقين", "مُلقيًا"],
  recordings: ["recording", "تسجيل واحد", "تسجيلان", "تسجيلات", "تسجيلًا"],
  meters: ["meter", "بحر واحد", "بحران", "بحور", "بحرًا"],
  rhymes: ["rhyme", "قافية واحدة", "قافيتان", "قوافٍ", "قافيةً"],
} as const;

export function directoryCount(kind: keyof typeof directoryNouns, n: number, lang: UiLang) {
  const [name, one, two, few, many] = directoryNouns[kind];
  if (lang === "en") return String(n) + " " + name + (n === 1 ? "" : "s");
  if (n === 1) return one;
  if (n === 2) return two;
  const last = n % 100;
  return digits(n, lang) + " " + (n === 0 || (last >= 3 && last <= 10) ? few : many);
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

export const rhymeName = (letter: string, lang: UiLang) => t(lang, "rhyme", { l: rhymeFor(letter)?.[lang] ?? letter });
