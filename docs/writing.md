# Writing a poem

Every poem should read as if one careful editor made the whole library. This is how that
editor works. [content-format.md](content-format.md) says where things go; this file says
what goes in them. `bun run content:check` enforces what a machine can.

## The text

**The recording decides.** The verses are what the reciter says. Editions decide nothing
the audio settles, but they are where the text comes from.

- **Editions.** Set the text from at least two scholarly sources: a critical edition of
  the diwan, or a classical commentary that quotes every bayt (al-Wahidi on al-Mutanabbi,
  for example). Put them in `media/research/<poem>/` and collate with `scripts/collate.py`.
  A website's text or a video's description can be the starting point, never the
  authority: they drop shadda after the article, run words together («مالَم») and carry
  typos. Where to look:
  - `scripts/shamela.py search '"<a rare half>"'` finds every book on shamela that quotes
    the poem, and `shamela.py <book> <page>` fetches the pages;
  - `scripts/shamela-old.py list` and `shamela-old.py <id>` read the diwans that only the
    old shamela has (they are the Abu Dhabi encyclopedia's text: one source, not an edition);
  - `scripts/archive.py find`, `grep` and `page` find a critical edition's scan on
    archive.org and fetch the pages. Read the page image, never the OCR, and cite the
    printed page.
- **Where they differ,** score each reading against the audio with `scripts/variants.py`,
  candidates of the same length. A gap of 5 or more is clear; under 2 is a coin toss, so
  listen and decide. The aligner can't hear vowel length (ـة against ـات, حَكَمَت against
  حاكَمَت), and the meter often allows both. Transcribe the half with two backends
  (`--transcriber cohere` and `audar`) on a clip cut with a wide margin, but don't take a
  long vowel from them on its own: reciters stretch short syllables in the chant, above all
  the last of a shortened foot (فَعولُ), and the transcribers then hear الرصافات for
  الرصافة. Follow a long vowel only where the same reciter doesn't stretch that spot
  elsewhere; otherwise keep the editions.
- **The scores have blind spots.** A candidate with fewer words scores better by default,
  so never test a missing word with `variants.py`: read the word's confidence in
  `align.py` and the clip transcripts instead. The aligner also writes ذ as "th" and scores
  it badly against ز or against nothing; trust the transcribers there. And a merged tanwin
  before و («وعظاً ومثل») sounds like «أو» to the transcribers.
- **Where the reciter differs from every edition,** the text still follows him, and that
  word gets a note giving the editions' reading and its meaning («زَردَقاً»: the editions
  have رَزدَقاً, a row).
- **Abyat he repeats** stay once in the text; the timeline plays them as often as he says them (`align.py --plan`).
- **Abyat he leaves out** are not in the text. The abyat are numbered 1..N in the order of
  the poem; `abyat_in_full` is the count in the edition `sources.md` names. Any silence
  left where the editor cut them out is cut from the audio too.
- **Harakat** follow the house style (`packages/contracts/src/tashkeel.ts`); run
  `bun scripts/tashkeel.ts <poem> --fix` and clear what it says needs a look. In short:
  - every letter that is voweled shows its vowel, i'rab included, as the reciter reads it;
  - tanwin and shadda are written;
  - no sukun;
  - no vowel before the long letter that carries it: قالَ, تَقولُ, الَّذي, عَلى;
  - tanwin al-fath sits on the alif: فُنوناً, شَيئاً;
  - the article is bare (القَمَرِ) and a sun letter after it takes shadda (الشَّمسِ, اللَّهُ);
  - a word-initial alif of wasl that isn't the article shows its vowel (اِبنِ, اِرتِياحَكَ).
- **Spelling.**
  - Hamza on its modern seat.
  - هَذا, ذَلِكَ, لَكِن without a dagger alif.
  - One space between words, never two words run together.
  - No punctuation.
- **Title.**
  - A poem known by a name the books use takes that name, and only that name: لامية ابن الوردي, تائية الإلبيري, بانت سعاد.
  - Any other poem takes its first sadr, with harakat.
  - The English title is the known name in English, or a translation of that half.
- **Ids.** These are the names in English, lowercase, joined by hyphens, without ʿ or ':
  - poems use their first words or known name (`liaynayki-ma-yalqa`, `banat-suad`);
  - poets and reciters use their names (`al-mutanabbi`, `jamil-buthayna`, `osama-alwaaedh`).
- **Meter and rawiy.**
  - Scan the opening bayt and one bayt from the middle yourself.
  - Don't copy the meter from a website without scanning it.

## Sources (`sources.md`)

Every poem has a `sources.md` beside its `poem.json`. It records:

- the recording;
- what was cut from it (`media/work/<id>/audio.json`);
- the editions, with page references;
- every reading decided by ear, with its scores;
- the abyat left out;
- the commentaries the sharh draws on;
- what `scripts/verify.py` flagged and how each flag was settled.

A later correction starts there.

## Introduction

Write one in Arabic and one in English. Each is three to five sentences: the occasion (who, when, why), how the poem moves (an opening of love, then praise, for example), and why it's remembered. Name the source of a story inside the sentence: «ذكر الواحدي أنّ…», "Al-Wahidi says that…". Don't praise it without a reason; a reason makes the praise unnecessary.

## Sharh

Every bayt has one, in Arabic and in English.

- **Arabic.**
  - Plain modern fusha, one to three sentences (usually 100–250 letters; up to 350 for a dense bayt).
  - First what the bayt says, in plain words. Then the image or the allusion behind it. Then the turn, if it has one.
  - Third person, present tense, no «يقول الشاعر». Start with the meaning.
  - Draw on the classical commentaries, without quoting them at length. Where they disagree, give the stronger reading and the other in a clause: «وقيل: …».
  - Don't repeat a word note word for word; the note is one tap away.
- **English.** Written for a reader without Arabic.
  - What the bayt means, then what the translation can't carry: a double meaning, wordplay, a custom, a place.
  - One to three sentences.
- **Both.**
  - No exclamations, no rhetorical questions, no ellipses.
  - Facts about a person or place go in the word note; the sharh keeps to what they mean here.

## Translation (English)

- **Shape.** A pair, one line for each half. Use one sentence only when the syntax runs across the halves.
- **Language.** Faithful, plain, present-day English: no rhyme, no "thee", no padding.
- **Images.** Keep them as they are. Explaining them is the sharh's job.
- **Length.** Short lines; a half rarely needs more than twelve words.
- **Speech.** Quoted speech takes curly quotes: “ ”.

## Word notes

- **What gets a note.**
  - Words a reader of modern Arabic wouldn't know, or would misread: rare words, and old senses of common ones.
  - Names of people, places, tribes, weapons, horses.
  - Set phrases.
  - Usually two to four a bayt; none when nothing needs one.
- **What doesn't.** Common words.
- **A phrase** gets one note over the phrase (`7.2.3-4`) when its meaning is the phrase's.
- **`head`.** The word as a dictionary would list it, when that differs from the verse:
  - without its attached و ف ب ك ل (بِاللِّوى → اللِّوى; وَأَودى → أَودى) and its pronoun (مَرامُها → مَرام; يَمِّمهُ → يَمِّم);
  - an imperative in its plain form (فَاقصُري → اُقصُري; وَاحتَفِل → اِحتَفِل), and no head when that is the word itself (مِل, دارِ);
  - any other verb under its past tense (بانَت → بانَ; يُفدَ → فَدى).
  - Write it with harakat, like the verse, but without the final case ending (اللِّوى, العَنبَر, ماء الشَّباب).
- **`root`.** For words derived from an Arabic root: ش ع ر. None for names and loanwords.
- **Arabic meaning.** A short gloss first, then the sense here if it's different.
- **English meaning.**
  - Names and terms start with the word romanized: «Rida': a cloak worn over the shoulders.»
  - Idioms start with a literal rendering in quotes: «“The water of youth”: its freshness and glow.»
  - Common words start with the English: «Has perished, is gone.»
  - Notes that only matter to Arabic grammar (a shortened name in a call, for example) can stay Arabic-only.

## People

- **`poet.json`.**
  - `name`: as readers know the poet, with the harakat that help.
  - `full_name`: from al-Zirikli's *al-A'lam*.
  - `died`: hijri and CE, also from *al-A'lam*.
- **`reciter.json`.** The name, the full name if public, and the YouTube channel.
- **Bios.**
  - Poets: three to five sentences in each language. Who, where and when; what they are known for; one telling fact; how they died if it's known.
  - Reciters: one or two sentences.
  - Neutral and sourced: *al-A'lam*, the diwan's introduction, the major encyclopedias.

## English conventions

- **Romanization.**
  - Simple: no macrons or dots.
  - ʿayn and hamza are ' inside or at the end of a word (Ka'b, Rida', Marba'), and dropped at the start (Ali, Udhra).
  - `al-` is lowercase and unassimilated (al-Shabatat), and capitalized at the start of a sentence.
  - `ibn` is lowercase between names.
- **Known English forms** win: Mecca, Medina, Baghdad, Damascus, Aleppo, Byzantine, Sayf al-Dawla.
- **Dates.**
  - English: "354 AH (965 CE)".
  - Arabic: «سنة ٣٥٤هـ», with Arabic-Indic digits throughout the Arabic text.
- **Spelling.** British (neighbour, colour), as in the first poem.

## The steps, in order

1. **Take in the recording.** Run `bun scripts/intake.ts <link>` to get the audio, a 16 kHz copy, the silences, the loudness and a transcript in `media/work/<video>/`.
2. **Set the text.**
   - Read the transcript to see which abyat are said, in what order, and what lies around the poem.
   - Collate the editions, draft `poem.json`, then run `bun scripts/tashkeel.ts <poem> --fix`.
3. **Make the app audio.** Run `bun scripts/audio.ts <video> <poem>/<reciter> --keep …`. Keep only the poem, starting about half a second before the first word.
4. **Align.** Run `uv run scripts/align.py … app16k.wav --recitation …`.
   - Listen to the weak words.
   - If a music bed swamps the voice, align on a separated vocal track instead; the timings still match the app file.
5. **Settle the readings** with `scripts/variants.py` on the aligned times.
6. **Check every half by ear** with `python3 -I scripts/verify.py <poem>`. Explain every difference it lists in `sources.md`.
7. **Write.**
   - The poet and reciter, if they are new.
   - `ar.json` and `en.json`: the title, introduction, sharh, translation and word notes.
   - `sources.md`.
8. **Review.**
   - `bun run content:check` must be clean.
   - Listen through `bun run content:preview <poem>`.
   - A second reader checks the text against the editions and the sharh against the commentaries.
9. **Publish.** `bun run content:build`. Look at the halves its kashida report lists.
