// The house style for harakat, so verses taken from different editions read alike.
//
// Every letter that carries a short vowel shows it; tanwin and shadda are written. What
// the letters already say is left out:
// - no sukun: an unmarked letter is silent (رَأَت, الأَحمَرِ);
// - no vowel before the long letter that carries it: قالَ, تَقولُ, الَّذي, عَلى, لَمّا;
// - tanwin al-fath sits on the alif or alif maqsura after it: فُنوناً, فَتىً.
// The article's alif and lam are bare, and a sun letter after it takes its shadda:
// الرِّضا, وَالسُّخطِ, لِلنَّدى, اللَّهُ. Any other alif of wasl that starts a word shows the
// vowel it starts with (اِبنِ, اِرتِياحَكَ), so it can't be taken for the article; after a
// prefix it is bare and the prefix keeps its vowel: وَالعَنبَرِ, فَاقصُري.
//
// `houseStyle` makes those changes. `tashkeelIssues` finds what it can't decide: a word
// that starts without a vowel, two silent letters in a row, a shadda with no vowel.

const FATHATAN = "\u064B";
const DAMMATAN = "\u064C";
const KASRATAN = "\u064D";
const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";
const SHADDA = "\u0651";
const SUKUN = "\u0652";
const DAGGER = "\u0670";
const VOWELS = [FATHATAN, DAMMATAN, KASRATAN, FATHA, DAMMA, KASRA];
const isMark = (c: string) => (c >= FATHATAN && c <= SUKUN) || c === DAGGER;

type Letter = { ch: string; marks: string[] };

function letters(word: string): Letter[] {
  const out: Letter[] = [];
  for (const c of word.normalize("NFC")) {
    if (isMark(c) && out.length) out.at(-1)!.marks.push(c);
    else out.push({ ch: c, marks: [] });
  }
  return out;
}

const join = (ls: Letter[]) =>
  ls
    .map((l) => l.ch + l.marks.join(""))
    .join("")
    .normalize("NFC");
const has = (l: Letter | undefined, m: string) => !!l && l.marks.includes(m);
const bare = (l: Letter | undefined) => !!l && l.marks.length === 0;
const drop = (l: Letter, m: string) => (l.marks = l.marks.filter((x) => x !== m));

/** An alif after a voweled letter is long, unless a silent letter follows it: then it is
 *  the alif of wasl after a prefix (وَالعَنبَرِ, فَاقصُري) and the prefix keeps its vowel. */
const isWasl = (ls: Letter[], i: number) => {
  const after = ls[i + 1],
    then = ls[i + 2];
  // The letter after it is silent: bare, and not taking its vowel from a long letter (وادي)
  // or from the alif that carries tanwin al-fath (مالاً).
  const long = then && "اىوي".includes(then.ch) && (bare(then) || ("اى".includes(then.ch) && then.marks.every((m) => m === FATHATAN)));
  // Form VIII of a verb whose first letter merges with the t (اِتَّقى, اِدَّرَعَ, اِطَّرَحَ):
  // after a one-letter prefix the alif comes before a doubled letter (وَاتَّقِ, فَاطَّرِح).
  const doubled = i === 1 && "وف".includes(ls[0]!.ch) && has(after, SHADDA) && "تدطذصضظزثسش".includes(after!.ch);
  return i > 0 && !!after && ((bare(after) && after.ch !== "ا" && !long) || doubled);
};

const SUN = "تثدذرزسشصضطظلن";

/** Where the noun after the article starts (الـ, or لِلـ after li), past up to two
 *  one-letter prefixes (وَ فَ بِ كَ); -1 when the word has no article. */
function afterArticle(ls: Letter[]): number {
  let k = 0;
  while (k < 2 && ls[k] && "وفبك".includes(ls[k]!.ch) && ls[k]!.marks.some((m) => VOWELS.includes(m))) k++;
  const a = ls[k],
    b = ls[k + 1];
  if (a?.ch === "ا" && bare(a) && b?.ch === "ل" && bare(b)) return k + 2;
  if (a?.ch === "ل" && has(a, KASRA) && b?.ch === "ل" && bare(b)) return k + 2;
  return -1;
}

function styleWord(word: string): string {
  const ls = letters(word);
  for (const l of ls) drop(l, SUKUN);
  // (Only in a word that has harakat at all: a bare word stays bare.)
  const voweled = ls.some((l) => l.marks.some((m) => VOWELS.includes(m)));
  const noun = voweled ? ls[afterArticle(ls)] : undefined;
  if (noun && SUN.includes(noun.ch) && !has(noun, SHADDA) && ls.indexOf(noun) < ls.length - 1) noun.marks.push(SHADDA);
  for (let i = 0; i < ls.length - 1; i++) {
    const l = ls[i]!,
      next = ls[i + 1]!;
    const last = i + 1 === ls.length - 1;
    // Tanwin al-fath moves onto the alif (or alif maqsura) that ends the word.
    if (has(l, FATHATAN) && last && bare(next) && (next.ch === "ا" || next.ch === "ى")) {
      drop(l, FATHATAN);
      next.marks.push(FATHATAN);
    }
    if (has(l, FATHA) && (next.ch === "ى" ? bare(next) : next.ch === "ا" && (bare(next) || has(next, FATHATAN)) && !isWasl(ls, i + 1)))
      drop(l, FATHA);
    // و and ي lengthen the vowel before them, unless a long alif follows: then they are
    // consonants whose fatha that alif leaves out (رِياح, طُوال). A final وا is the plural's
    // و and its silent alif (كانوا).
    const then = ls[i + 2];
    const consonant = (then?.ch === "ا" && (next.ch === "ي" || i + 2 < ls.length - 1)) || then?.ch === "ى";
    // The و of أُولو, أُولي, أُولَئِكَ and أُولات is only written, never said: the damma stays.
    const silentWaw = l.ch === "أ" && ls[i + 2]?.ch === "ل";
    if (has(l, DAMMA) && next.ch === "و" && bare(next) && !consonant && !silentWaw) drop(l, DAMMA);
    if (has(l, KASRA) && next.ch === "ي" && bare(next) && !consonant) drop(l, KASRA);
  }
  return join(ls);
}

/** A verse half in the house style. Only harakat change, never letters or spaces. */
export function houseStyle(text: string): string {
  return text.split(" ").map(styleWord).join(" ");
}

/** What the house style can't settle on its own, one message per word that needs a look. */
export function tashkeelIssues(text: string): string[] {
  const issues: string[] = [];
  for (const word of text.split(" ")) {
    const ls = letters(word);
    // A letter that needs no mark: an alif, alif maqsura or alif madda; a و or ي that
    // lengthens the vowel before it (not after a fatha: يَوم, بَين are silent letters).
    const free = ls.map((l, i) => {
      if (l.marks.length) return true;
      if ("اىآ".includes(l.ch)) return true;
      if ((l.ch === "و" || l.ch === "ي") && i > 0 && !has(ls[i - 1], FATHA)) return true;
      // A letter right before a long alif, alif maqsura, و or ي takes its vowel from it.
      const next = ls[i + 1];
      const long = next && (bare(next) || ("اى".includes(next.ch) && next.marks.every((m) => m === FATHATAN)));
      if (long && "اىوي".includes(next.ch) && !(next.ch === "ا" && isWasl(ls, i + 1))) return true;
      return false;
    });
    if (!free[0]) issues.push(`«${word}» starts without a vowel`);
    for (let i = 1; i < ls.length; i++) {
      if (!free[i] && !free[i - 1] && i - 1 > 0) {
        issues.push(`«${word}» has two silent letters in a row (${ls[i - 1]!.ch}${ls[i]!.ch})`);
        break;
      }
    }
    ls.forEach((l, i) => {
      const next = ls[i + 1];
      // Before a long letter, or before the alif or alif maqsura that carries tanwin al-fath
      // (حَيّاً, مُعَنّىً), the
      // vowel is already written.
      const carried = next && "اىوي".includes(next.ch) && (bare(next) || ("اى".includes(next.ch) && next.marks.every((m) => m === FATHATAN)));
      if (has(l, SHADDA) && !l.marks.some((m) => VOWELS.includes(m)) && !carried)
        issues.push(`«${word}» has a shadda with no vowel on ${l.ch}`);
      if (l.marks.filter((m) => VOWELS.includes(m)).length > 1) issues.push(`«${word}» has two vowels on ${l.ch}`);
      if (l.marks.includes(DAGGER)) issues.push(`«${word}» has a dagger alif; write the plain spelling (هَذا, لَكِن)`);
    });
  }
  return issues;
}
