# لِعَينَيكِ ما يَلقى الفُؤادُ وَما لَقي

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=y6CKU_ob1xU (uploaded 2022-07-12, 7:20).
- **Audio:** kept 4.0–439.0 s of the download (the silence before the first word and after the last cut), gain −3.1 dB, giving −20.1 LUFS with a peak of −7 dBTP.
- **Music bed:** the recording has one under the voice the whole way through. The aligner managed on the mix (6 weak words of 443), so no vocal separation was needed.
- **Abyat recited:** all 43, in order, none repeated.

## Editions

- **al-Wahidi**, شرح ديوان المتنبي: shamela 754, pp. 250–253. Every bayt, with commentary. The heading: وقال يمدحه ويذكر كتاب ملك الروم الوارد عليه.
- **Abu al-Ala al-Ma'arri**, اللامع العزيزي: shamela 29591, pp. 771–792. About half the abyat, with notes on words and grammar.
- **Ibn al-Iflili**, شرح معاني شعر المتنبي: shamela 37065, p. 325. The heading dates the poem to 341 AH and says the envoy came about a ransom of prisoners. Its text of bayt 1 has وللحبّ.
- **Starting text:** the video's description, which uses aldiwan.net's conventions. Its tashkeel was put in the house style. Two run-together words were separated (مالَم → ما لَم, مابَينَ → ما بَينَ).

`abyat_in_full` is 43, as in al-Wahidi.

## Readings settled by ear

Scores come from `scripts/variants.py` on the app audio; the gap is from the best reading.

| Bayt | Recited | Other reading | Gap |
| --- | --- | --- | --- |
| 1.2 | وَلِلحُبِّ (also Ibn al-Iflili, al-Ma'arri) | وَلِلشَّوقِ (al-Wahidi) | −25.2 |
| 2.2 | يُبصِر | يَنظُر (al-Wahidi) | −16.0 |
| 4.2 | يَرجو وَيَتَّقي | يُرجو وَيُتَّقي (the description) | −12.7 |
| 14.2 | قَنا | قالَ (what the transcriber heard) | −10.9 |
| 15.2 | الخَدَرنَقِ | الحَذَرنَقِ (al-Wahidi's print) | −13.8 |
| 16.1 | الجُيوشِ | البِلادِ (al-Ma'arri) | −20.6 |
| 17.1 | تَقُدُّ | تَفُكُّ (al-Ma'arri) | −16.3 |
| 18.2 | وَيُركِزُها | وَيَركِزُها; وَيَركُزُها (the dictionaries give both) | −3.4; −6.3 |
| 23.1 | جُدتَ … جُدتَ | جادَ … جادَ | −5.0 |
| 24.1 | رَأى مَلِكُ الرّومِ | وَأَملاكُ الرّومِ | −1.2 |
| 25.2 | لِأَدرَبَ | لِأَذرَبَ (al-Wahidi) | −9.2 |
| 29.2 | يَمشي | يَسعى (al-Wahidi) | −9.5 |
| 32.1 | مِنكَ الأَمانَ | بَعضَ الأَمانِ (al-Wahidi, al-Ma'arri) | −32.9 |
| 33.2 | أَسيراً | حَبيساً (al-Wahidi) | −9.3 |
| 34.2 | زَردَقاً بَعدَ زَردَقِ | رَزدَقاً بَعدَ رَزدَقِ (al-Wahidi, al-Ma'arri) | −21.0 |
| 35.2 | أَثَرتُ | أَنَرتُ (al-Wahidi, al-Ma'arri) | −6.1 |
| 42.2 | سَعى جَدُّهُ في كَيدِهِم | سَعى مَجدُهُ في جَدِّهِ (the prints of al-Wahidi and al-Ma'arri; both their glosses read جَدُّهُ as the subject) | −17.2 |

- **24.1** is a coin toss by score. The transcript's vowels (وامالك) fit رأى مَلِكُ better than أملاك, and all three editions have رأى ملك الروم, so the text keeps it.
- **Where the reciter departs from every edition that quotes the bayt** (25.2, 29.2, 32.1, 33.2, 34.2, 35.2), the word note gives the editions' reading. Bayt 18.2's note gives the dictionary forms of the verb.

**Spelling fixes against the starting text:**
- داوُدَ (one waw);
- اُرفُقِ (the imperative of رَفَقَ يَرفُقُ starts with damma);
- the rhyme زِئبَقِ (no tanwin at the rhyme, like every other ajuz).

## Ear check

- **Alignment:** `scripts/align.py` flagged 6 weak words, all short (مِن, مَن, كُلِّ, اِبنِ, شَيئاً). Their halves passed the ear check.
- **`scripts/verify.py`:** 19 of 86 clips differ from the text. Each difference is the transcriber's, not the reciter's:
  - names and rare words split or misheard: الخدر نقي, وجل قيل, الكمات, كعادله, قذل, احماقه;
  - a long vowel or the rhyme stretched past what the skeleton comparison absorbs: والنواح, برقيقي, زرنانين;
  - 14.2 and 23.1, which the variants above settle;
  - 36.2, where «غباري ثمّ» was heard as «بارث ما» in a chanted phrase. Every edition agrees on the text there.

## Commentary drawn on

- The sharh follows al-Wahidi throughout.
- It also gives, as al-Wahidi reports them:
  - Ibn Furraja's reading of bayt 11, which al-Wahidi prefers;
  - al-Arudi's and Ibn Furraja's reading of هوادٍ in bayt 16 and of bayt 22, after al-Wahidi's own.
- It draws on al-Ma'arri for اللقان, جلّق, الدمستق and الرزدق.
- The occasion comes from Ibn al-Iflili.

## Review

A second reader checked the text against the editions and the sharh against the commentaries (2026-11-16). They found no errors in the text, its harakat or its meter. Fixed after the review:

- **Bayt 16:** the attribution, now al-Wahidi's reading first.
- **Bayt 21:** a claimed same-root play, which the line doesn't have.
- **Abyat 22 and 33:** al-Wahidi's own reading of 22 added; 33's sharh was a rhetorical question.
- **Notes for 29.2 and 33.2,** where the reciter departs from al-Wahidi.
- **Heads and roots:** the head of 30.1.5, and roots for 29.1.4 and 35.1.4.
- **English:** "Abu al-Hayja'", and several halves tightened.
- **Arabic sharh:** paraphrase moved into the third person.
