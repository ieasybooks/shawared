# إِنَّ السَّلامَةَ أَن تَرضى بِما قُضِيا

## Recording

- أحمد النفيس, on his own channel: https://www.youtube.com/watch?v=-bg5Ld09uW4 (uploaded 2023-08-30, 1:57). No description.
- **Audio:** kept 0.9–114.1 s of the download (the silence before the first word and after the last cut), gain −6.8 dB, giving −20 LUFS with a peak of −7.2 dBTP.
- **Background:** a light echo on the voice, no music.
- **Abyat recited:** all 12, in order, none repeated.

## Editions

- **Shukri Faisal**, أبو العتاهية: أشعاره وأخباره (Damascus University, 1965), poem 449, pp. 432–433: all 12 abyat, from al-Basit, with variants from his manuscripts (ل) and (ت). The poem isn't in his manuscript (ظ). Scan: archive.org `0017pdf_202002`, leaves 472–473.
- **ديوان أبي العتاهية** on old shamela (book 4381), pp. 197–198: the same 12 abyat. This is the text of the Abu Dhabi poetry encyclopedia. It agrees with Faisal's manuscript (ل) in 1.1 (نرضى), 6.2 (صبّاً), 12.1 (منقطعٍ) and 12.2 (بدا), and has غيبةً in 7.2, which breaks the meter.
- Variants in Faisal's apparatus that the reciter doesn't raise: 2.2 يصحبه (ت), 6.1 تغتدي (ت), 6.1 دونَ التراب (ل).
- **عبد العزيز السلمان**, مجموعة القصائد الزهديات: shamela 38155, vol. 2, p. 316. A modern anthology, fully voweled, with the same text as Faisal.

`abyat_in_full` is 12, as in Faisal. No classical commentary on the poem is known; the sharh is a plain reading.

## Readings settled by ear

Scores come from `scripts/variants.py` on the app audio; the gap is the other reading's score against the text's. The text is what the reciter says, except where a note below says otherwise.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 1.1 | تَرضى (Faisal) | نَرضى (Faisal's (ل), old shamela) | −6.5 |
| 2.1 | يَأمَلُ (Faisal's (ت)) | يَأمُلُ (Faisal, the dictionaries) | −5.8 |
| 3.2 | بُكِيا (Faisal) | بَكَيا (Faisal's (ت)) | −7.0 |
| 6.2 | حَيّاً (Faisal) | صَبّاً (Faisal's (ل), old shamela) | −9.8 |
| 6.2 | مُغتَذِيا (Faisal) | مُغتَدِيا (Faisal's (ت)) | −1.0 |
| 7.1 | المَيتِ (Faisal) | المَوتِ (Faisal's (ت)) | −4.0 |
| 7.2 | غَيبَةَ (Faisal) | غَيبَةً (old shamela) | +3.4 |
| 8.2 | لا يُرتَجى (Faisal) | لا يَرتَجي (Faisal's (ت)) | −6.3 |
| 9.1 | عَنِ الدُّنيا (all editions) | لِلدُّنيا (what the transcriber heard) | −3.3 |
| 9.2 | مُغتَدِيا (Faisal) | مُغتَذِيا | −9.8 |
| 12.1 | مُنقَطِعٌ (Faisal) | مُنقَطِعِ (Faisal's (ل), old shamela) | −10.3 |
| 12.2 | يُرى (Faisal) | بَدا (Faisal's (ل), old shamela) | −16.9 |

- **2.1:** the reciter says يَأمَلُ, which one of Faisal's manuscripts has; the text follows him, and the word note gives the dictionary form.
- **6.2:** a coin toss by score between ذ and د, which the aligner barely separates. The text keeps Faisal's مُغتَذِيا: the sense needs "fed on", and مُغتَدِيا in the same sense already ends bayt 9, so repeating it would be iṭāʾ, a fault the poet avoids.
- **7.2:** the aligner leans to غَيبَةً by 3.4, under the gap that counts as clear, and with tanwin the half breaks the meter: «مَن غابَ غَي» is مُستَفعِلُن and «بَةَ مَن» is فَعِلُن, while «بَتَن مَن» would be short-long-long, which no form of فاعِلُن allows. The text keeps Faisal's idafa.

## Ear check

- **Alignment:** `scripts/align.py` flagged 4 weak words, all short (إِنَّ, أَن, بِهِ, عَنِ). Their halves passed the ear check.
- **`scripts/verify.py`:** 4 of 24 clips differ from the text, each the transcriber's:
  - 4.1: «ناعٍ نَعى» heard as «نا عن نعا», the run of n and ʿayn;
  - 6.2: the ذ of مُغتَذِيا heard as د (settled above);
  - 7.1: «لَهُ» heard as «لهم», the stretched vowel before the pause (لَهُ scores 5.5 above لَهُم);
  - 8.1: «فَوَ» heard as «فول», the word that runs into the second half.

## Commentary drawn on

- None exists for this poem. The word notes follow the dictionaries (لسان العرب, المعجم الوسيط).
- The poet's dates and life follow al-Zirikli's *al-A'lam* (shamela 12286, vol. 1, p. 321).
- The reciter's details come from his channel's description (`media/research/inna-al-salamata/channel.txt`).

## Review

A second reader checked the text against Faisal's scan and the notes, sharh and bios against the sources (2026-11-17). They found no errors in the text, its harakat or its meter. Fixed after the review:

- **sources.md:** the manuscript of 12.1's variant, the old shamela readings, the scansion of 7.2.
- **Notes:** the rhyme alif (3.2 ends in the dual alif), heads of the passive rhyme verbs, 7.2's phrase note, and two notes dropped as trivial.
- **Bayt 6 (en):** the translation now keeps the repeated verb.
- **Bayt 12 (en):** «يُرى» translated, not the rejected «بدا».
- **Intro and bio:** claims not in *al-A'lam* replaced with what it says; the caliph named.
