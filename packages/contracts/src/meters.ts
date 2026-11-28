export const METER_DETAILS = {
  tawil: { ar: "الطويل", en: "al-Ṭawīl", feet: "فَعولُنْ مَفاعيلُنْ فَعولُنْ مَفاعيلُنْ" },
  madid: { ar: "المديد", en: "al-Madīd", feet: "فاعِلاتُنْ فاعِلُنْ فاعِلاتُنْ" },
  basit: { ar: "البسيط", en: "al-Basīṭ", feet: "مُسْتَفْعِلُنْ فاعِلُنْ مُسْتَفْعِلُنْ فاعِلُنْ" },
  wafir: { ar: "الوافر", en: "al-Wāfir", feet: "مُفاعَلَتُنْ مُفاعَلَتُنْ فَعولُنْ" },
  kamil: { ar: "الكامل", en: "al-Kāmil", feet: "مُتَفاعِلُنْ مُتَفاعِلُنْ مُتَفاعِلُنْ" },
  hazaj: { ar: "الهزج", en: "al-Hazaj", feet: "مَفاعيلُنْ مَفاعيلُنْ" },
  rajaz: { ar: "الرجز", en: "al-Rajaz", feet: "مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ" },
  ramal: { ar: "الرمل", en: "al-Ramal", feet: "فاعِلاتُنْ فاعِلاتُنْ فاعِلُنْ" },
  sari: { ar: "السريع", en: "al-Sarīʿ", feet: "مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ مَفْعولاتُ" },
  munsarih: { ar: "المنسرح", en: "al-Munsariḥ", feet: "مُسْتَفْعِلُنْ مَفْعولاتُ مُسْتَفْعِلُنْ" },
  khafif: { ar: "الخفيف", en: "al-Khafīf", feet: "فاعِلاتُنْ مُسْتَفْعِلُنْ فاعِلاتُنْ" },
  mudari: { ar: "المضارع", en: "al-Muḍāriʿ", feet: "مَفاعيلُنْ فاعِلاتُنْ" },
  muqtadab: { ar: "المقتضب", en: "al-Muqtaḍab", feet: "مَفْعولاتُ مُسْتَفْعِلُنْ" },
  mujtath: { ar: "المجتث", en: "al-Mujtath", feet: "مُسْتَفْعِلُنْ فاعِلاتُنْ" },
  mutaqarib: { ar: "المتقارب", en: "al-Mutaqārib", feet: "فَعولُنْ فَعولُنْ فَعولُنْ فَعولُنْ" },
  mutadarik: { ar: "المتدارك", en: "al-Mutadārik", feet: "فاعِلُنْ فاعِلُنْ فاعِلُنْ فاعِلُنْ" },
} as const;

export type Meter = keyof typeof METER_DETAILS;
export const METERS = Object.keys(METER_DETAILS) as readonly Meter[];
