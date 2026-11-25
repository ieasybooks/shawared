// Literary periods represented in the catalogue, ordered by their beginnings.
// Al-Andalus overlaps the eastern dynasties. Group by the poet's literary career.
export const ERAS = {
  "pre-islamic": { ar: "العصر الجاهلي", en: "Pre-Islamic" },
  "early-islamic": { ar: "صدر الإسلام", en: "Early Islamic" },
  umayyad: { ar: "العصر الأموي", en: "Umayyad" },
  andalusian: { ar: "العصر الأندلسي", en: "Andalusian" },
  abbasid: { ar: "العصر العباسي", en: "Abbasid" },
  ayyubid: { ar: "العصر الأيوبي", en: "Ayyubid" },
  mamluk: { ar: "العصر المملوكي", en: "Mamluk" },
  modern: { ar: "العصر الحديث", en: "Modern" },
  uncertain: { ar: "عصر غير محدّد", en: "Period uncertain" },
} as const;

export type Era = keyof typeof ERAS;
export const ERA_IDS = Object.keys(ERAS) as Era[];
