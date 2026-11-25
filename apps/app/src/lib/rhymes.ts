import type { CatalogPoem } from "@shawared/contracts";

export type Rhyme = { id: string; letter: string; ar: string; en: string };

/** Arabic alphabetical order in both interfaces. Hamza and long alif are distinct rhymes. */
export const RHYMES: readonly Rhyme[] = [
  { id: "hamza", letter: "ء", ar: "الهمزة", en: "hamza" },
  { id: "alif", letter: "ا", ar: "الألف", en: "alif" },
  { id: "ba", letter: "ب", ar: "الباء", en: "bāʾ" },
  { id: "ta", letter: "ت", ar: "التاء", en: "tāʾ" },
  { id: "tha", letter: "ث", ar: "الثاء", en: "thāʾ" },
  { id: "jim", letter: "ج", ar: "الجيم", en: "jīm" },
  { id: "hah", letter: "ح", ar: "الحاء", en: "ḥāʾ" },
  { id: "kha", letter: "خ", ar: "الخاء", en: "khāʾ" },
  { id: "dal", letter: "د", ar: "الدال", en: "dāl" },
  { id: "dhal", letter: "ذ", ar: "الذال", en: "dhāl" },
  { id: "ra", letter: "ر", ar: "الراء", en: "rāʾ" },
  { id: "zay", letter: "ز", ar: "الزاي", en: "zāy" },
  { id: "sin", letter: "س", ar: "السين", en: "sīn" },
  { id: "shin", letter: "ش", ar: "الشين", en: "shīn" },
  { id: "sad", letter: "ص", ar: "الصاد", en: "ṣād" },
  { id: "dad", letter: "ض", ar: "الضاد", en: "ḍād" },
  { id: "tah", letter: "ط", ar: "الطاء", en: "ṭāʾ" },
  { id: "zah", letter: "ظ", ar: "الظاء", en: "ẓāʾ" },
  { id: "ayn", letter: "ع", ar: "العين", en: "ʿayn" },
  { id: "ghayn", letter: "غ", ar: "الغين", en: "ghayn" },
  { id: "fa", letter: "ف", ar: "الفاء", en: "fāʾ" },
  { id: "qaf", letter: "ق", ar: "القاف", en: "qāf" },
  { id: "kaf", letter: "ك", ar: "الكاف", en: "kāf" },
  { id: "lam", letter: "ل", ar: "اللام", en: "lām" },
  { id: "mim", letter: "م", ar: "الميم", en: "mīm" },
  { id: "nun", letter: "ن", ar: "النون", en: "nūn" },
  { id: "ha", letter: "ه", ar: "الهاء", en: "hāʾ" },
  { id: "waw", letter: "و", ar: "الواو", en: "wāw" },
  { id: "ya", letter: "ي", ar: "الياء", en: "yāʾ" },
];
const byLetter = new Map(RHYMES.map((rhyme) => [rhyme.letter, rhyme]));
const byId = new Map(RHYMES.map((rhyme) => [rhyme.id, rhyme]));

export const rhymeById = (id: string) => byId.get(id);
export function rhymeFor(rawiy?: string) {
  if (!rawiy) return undefined;
  return byLetter.get(rawiy.replace(/[أإؤئ]/u, "ء").replace("ى", "ا"));
}

export function rhymeCounts(poems: CatalogPoem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const poem of poems) {
    const rhyme = rhymeFor(poem.rawiy);
    if (rhyme) counts[rhyme.id] = (counts[rhyme.id] ?? 0) + 1;
  }
  return counts;
}
