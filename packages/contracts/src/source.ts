// The files editors write under content/. Strict: an unknown field is a mistake.
import { z } from "zod";
import { ERA_IDS } from "./eras.ts";
import { LINE_RE, WORD_RE } from "./address.ts";
import { AUDIO_KEY_RE } from "./audio.ts";
import { METERS } from "./meters.ts";

export { METERS, type Meter } from "./meters.ts";

export const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase latin letters, digits and dashes");
export const Lang = z.string().regex(/^[a-z]{2}$/, "use a two-letter language code");
const Text = z.string().trim().min(1, "empty text");
const BilingualText = z.strictObject({ ar: Text, en: Text });

/** content/themes.json. A theme used only as a secondary subject has no example. */
export const Themes = z.record(
  Slug,
  z.strictObject({
    name: BilingualText,
    definition: BilingualText,
    example: z.strictObject({ poem: Slug, bayt: z.int().positive() }).optional(),
    references: z.array(z.url()).min(1),
  }),
);

// A half-verse: Arabic letters, harakat and single spaces only.
const ARABIC_WORD = "[\\u0621-\\u063A\\u0641-\\u0652\\u0670]+";
const VERSE_RE = new RegExp(`^${ARABIC_WORD}( ${ARABIC_WORD})*$`, "u");
const Verse = z.string().regex(VERSE_RE, "use Arabic letters, harakat and single spaces only (no punctuation, tatweel or Latin)");

export const Bayt = z.strictObject({ n: z.int().positive(), sadr: Verse, ajuz: Verse });

/** poem.json: the Arabic text, exactly as the recordings say it. */
export const Poem = z.strictObject({
  id: Slug,
  poet: Slug,
  title: Text,
  meter: z.enum(METERS),
  /** The primary poetic purpose first, followed by any substantial secondary subjects. */
  themes: z
    .array(Slug)
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, "each theme may appear only once"),
  /** The rhyme letter (الرَّوِيّ). */
  rawiy: z
    .string()
    .regex(/^[ء-ي]$/, "one Arabic letter")
    .optional(),
  abyat_in_full: z.int().positive(),
  /** The day the poem joined the library; the home page lists newest first. */
  added: z.iso.date(),
  abyat: z.array(Bayt).min(1),
});

export const Translation = z.union([Text, z.tuple([Text, Text])]);

export const WordNote = z.strictObject({
  /** The exact Arabic at the address, so text edits can't silently drift. */
  word: Text,
  /** The form shown on the card, e.g. اللِّوى for بِاللِّوى. */
  head: Text.optional(),
  root: z
    .string()
    .regex(/^[ء-ي]( [ء-ي]){1,4}$/, "write the root as letters separated by spaces, e.g. ش ع ر")
    .optional(),
  meaning: Text,
});

/** <lang>.json or <lang>.<source>.json: one language from one source. */
export const PoemLang = z.strictObject({
  lang: Lang,
  source: z.strictObject({ name: Text }),
  title: Text.optional(),
  intro: Text.optional(),
  abyat: z
    .record(
      z.string().regex(/^[1-9]\d*$/, "bayt keys are numbers"),
      z.strictObject({ translation: Translation.optional(), sharh: Text.optional() }),
    )
    .default({}),
  words: z.record(z.string().regex(WORD_RE, "word addresses look like 17.1.5 or 17.1.2-3"), WordNote).default({}),
});

export const TimelineEntry = z.tuple([
  z.string().regex(LINE_RE, "timeline addresses look like 17 or 17.1"),
  z.number().nonnegative(),
  z.number().positive(),
]);

/** recitations/<id>.json: one recording and where each line falls in it, in audio order. */
export const Recitation = z.strictObject({
  reciter: Slug,
  /** <poem>/<recitation>.m4a, or once uploaded <poem>/<recitation>.<hash>.m4a (scripts/audio.ts). */
  audio: z.string().regex(AUDIO_KEY_RE, "audio is <poem>/<recitation>.m4a, or <poem>/<recitation>.<hash>.m4a once uploaded"),
  duration: z.number().positive(),
  source: z.url().optional(),
  timeline: z.array(TimelineEntry).min(1),
});

export const Poet = z.strictObject({
  id: Slug,
  era: z.enum(ERA_IDS).optional(),
  name: Text,
  full_name: Text.optional(),
  died: z.strictObject({ hijri: z.int(), ce: z.int() }).optional(),
});

export const Reciter = z.strictObject({
  id: Slug,
  name: Text,
  full_name: Text.optional(),
  links: z.record(z.string(), z.url()).optional(),
});

/** poets/<id>/<lang>.json and reciters/<id>/<lang>.json */
export const PersonLang = z.strictObject({
  lang: Lang,
  name: Text.optional(),
  bio: Text.optional(),
});

export type Poem = z.infer<typeof Poem>;
export type PoemLang = z.infer<typeof PoemLang>;
export type Recitation = z.infer<typeof Recitation>;
export type Poet = z.infer<typeof Poet>;
export type Reciter = z.infer<typeof Reciter>;
export type PersonLang = z.infer<typeof PersonLang>;
export type Translation = z.infer<typeof Translation>;
export type WordNote = z.infer<typeof WordNote>;
