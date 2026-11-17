# نونِيَّةُ البُستِيِّ

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=yRu-P1Xz6bI (uploaded 2025-01-12, 9:40), «نونية البُستي | إلقاء: أسامة الواعظ». The description calls the poem «نونية أبي الفتح البستي (ت٤٠٠هـ) المعروفة بـ(عنوان الحكم)» and links a commentary, al-Qasim's «شرح عنوان الحكم» (below).
- **Audio:** kept 7.4–575.0 s of the download (the silence before the first word, which comes at 8.2 s, and the closing silence cut), gain −6.6 dB, giving −20.1 LUFS with a peak of −6.3 dBTP.
- **Abyat recited:** all 63 of al-Qasim's commentary, in its order, none repeated or left out.

## Editions

- **عبد المحسن القاسم, شرح عنوان الحكم** (برنامج شروح متون طالب العلم), the PDF the uploader links (`13SharhUnwanAlHikmFULL.pdf`, 80 pages; the abyat in `qasim-abyat.txt`, the commentary summarized page by page in `qasim-sharh.txt`). 59 numbered abyat and two unnumbered pairs, our 9–10 (p. 20) and 54–55 (p. 71), each marked in a note «ليست بالمطبوع، لعلها في نسخة أخرى». The reciter follows this text, its order and all 63 of its abyat, but for the four readings in 3.1, 21.2, 56.1 and 57.1 below.
- **عبد المحسن القاسم, متون طالب العلم، المستوى الرابع** (5th printing, 1440/2019), pp. 65–79: shamela 574/56–69 (`qasim.txt`). «عنوان الحكم», 59 abyat, fully voweled, edited from thirteen manuscripts, the oldest Chester Beatty 5207 (684 AH). The commentary's 59 numbered abyat are this text; it lacks 9–10 and 54–55.
- **عبد الفتاح أبو غدة, قصيدة عنوان الحكم** (Maktab al-Matbu'at al-Islamiyya, Aleppo, 1404/1984), pp. 35–44: shamela 6873 (`abughudda-shamela.txt`). 63 abyat, lightly voweled: al-Qasim's commentary's 63, with 9–10 before «وإن أساء مسيء» (his 8–10).
- **ديوان أبي الفتح البستي**, ed. Durriyya al-Khatib and Lutfi al-Saqqal (Majma' al-Lugha al-Arabiyya, Damascus, 1410/1989), piece 398, pp. 186–192: scan archive.org `3195pdf_202001`, leaves 185–191, read as page images (text in `diwan.txt`). Voweled, with an apparatus of readings (sigla, p. 18: خ their manuscript, Ahmet III 2463, copied in 855 AH (p. 8); ط the Beirut print of 1294 AH; ع al-Khuli's edition; ن Nuqrakar's commentary on the poem). 65 abyat: it lacks 9–10, has 54–55 in brackets as an addition from al-Kashkul (its 58–59, placed after our 61), and four more from the anthology روح الروح (its 60–63: «والصادق البرّ في الدنيا مسيلمة», «فأكيس الناس من في كيسه كسر», «الناس هضب شمام حيث ميسرة», «كنّا نرى إنّما الإحسان مكرمة») that the reciter does not say. Its introduction (pp. 5–6) is the source for the poem's place in his work.
- **الثعالبي, نثر النظم وحلّ العقد**, in رسائل الثعالبي: shamela 623/43–44 (`tha-alibi-nathr.txt`; shamela's page numbers, not the print's). «قصيدة لأبي الفتح البستي وحلّ كلّ بيت منها على رسم المثل»: 44 of the abyat, each followed by al-Tha'alibi's prose maxim. The witness closest to the poet, by his friend and contemporary: it has «الدار» (3.1), «العصر» (21.2), «وشاء به مذلا» (36.1) and «الوحف» (56.1).

`abyat_in_full` is 63, the count of al-Qasim's commentary and Abu Ghudda's edition; the diwan's 65 include four abyat from روح الروح that neither has, and lack two that both have.

## Readings settled by ear

Scores come from `scripts/variants.py` on the app audio (run in one process for all halves by `media/work/yRu-P1Xz6bI/notes/vbatch.py`, which calls variants.py's own scoring; output in `notes/variants.txt` and `notes/variants2.txt`); the gap is the other reading's score against the text's. Al-Qasim is his commentary's text unless marked; where his printed text differs, it is named.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 1.1 | في (al-Qasim, Abu Ghudda, the diwan) | مِن (al-Tha'alibi) | −10.5 |
| 3.1 | الدّارِ (Abu Ghudda, al-Tha'alibi; the diwan's apparatus: the margin of خ, نثر النظم, طبقات الشافعية) | الدَّهرِ (al-Qasim, the diwan) | −7.4 |
| 3.2 | بِاللَّهِ … العُمرِ (al-Qasim, Abu Ghudda, al-Tha'alibi) | تَاللَّهِ; الدَّهرِ (the diwan) | −6.0; −15.3 |
| 4.1 | تَجمَعُها (al-Qasim, Abu Ghudda) | يَجمَعُها (the diwan, al-Tha'alibi) | −7.3 |
| 5.1 | وَزينَتِها (al-Qasim, Abu Ghudda) | وَزُخرُفِها (the diwan) | −40.7 |
| 12.1 | اللَّهِ (al-Qasim, Abu Ghudda) | الدّينِ (the diwan, al-Tha'alibi) | −16.1 |
| 19.1 | لِفَرطِ (al-Qasim, Abu Ghudda) | بِفَرطِ (the diwan) | −7.7 |
| 19.1 | هَوىً (al-Qasim, the diwan) | هُدىً (Abu Ghudda on shamela) | −9.8 |
| 21.2 | العَصرِ (Abu Ghudda, the diwan, al-Tha'alibi) | الدَّهرِ (al-Qasim) | −9.7 |
| 27.1 | يَغُرَّنكَ (al-Qasim, Abu Ghudda, al-Tha'alibi) | يَغُرُّكَ (the diwan) | −2.9 |
| 28.2 | الإِحسانِ (al-Qasim, Abu Ghudda, al-Tha'alibi) | الإِنسانِ (the diwan) | −6.7 |
| 29.1 | فَالرَّوضُ … بِالأَنوارِ (al-Qasim, Abu Ghudda) | وَالرَّوضُ; بِالنُّوّارِ (the diwan) | −5.7; −6.6 |
| 29.2 | بِالفَضلِ (al-Qasim) | بِالعَدلِ (Abu Ghudda); بِالأَصلِ (the diwan) | −9.4; −10.2 |
| 30.1 | غِلالَتَهُ (al-Qasim, Abu Ghudda) | غَلائِلَهُ (the diwan, al-Tha'alibi) | −29.9 |
| 31.1 | فَإِن (al-Qasim, Abu Ghudda) | وَإِن (the diwan, al-Tha'alibi) | −4.1 |
| 33.2 | وَأَفنانُ (al-Qasim, Abu Ghudda, al-Tha'alibi) | وَأَغصانُ (the diwan) | −17.2 |
| 34.1 | وَالنّاسُ (al-Qasim, Abu Ghudda, al-Tha'alibi) | فَالنّاسُ (the diwan) | −8.2 |
| 35.1 | حَصِرٌ (al-Qasim, Abu Ghudda) | حَصِراً (the diwan) | −3.7 |
| 36.1 | وَشّاءً بِهِ مَذِلاً (al-Qasim, al-Tha'alibi) | وَشّاءً يَبوحُ بِهِ (Abu Ghudda, the diwan) | −29.5 |
| 37.2 | تُحصيها وَأَلوانُ (al-Qasim) | تُحصيهِنَّ أَلوانُ (Abu Ghudda); وَأَكنانُ (the diwan) | −8.9; −9.8 |
| 38.1 | لِوارِدِهِ (al-Qasim, Abu Ghudda, the diwan) | لِشارِبِهِ (al-Tha'alibi) | −15.8 |
| 40.2 | فيهِ (al-Qasim, Abu Ghudda) | مِنهُ (the diwan) | −12.4 |
| 41.1 | فَلِلتَّدابيرِ (al-Qasim, Abu Ghudda, the diwan) | وَلِلتَّدابيرِ (al-Tha'alibi) | −5.0 |
| 43.1 | في الأَمرِ (al-Qasim, the diwan) | بِالأَمرِ (Abu Ghudda) | −9.7 |
| 44.2 | فَفيهِ … قُنيانٌ وَغُنيانُ (al-Qasim) | وَفيهِ (the diwan, al-Tha'alibi); إِن حَقَّقتَ غُنيانُ (Abu Ghudda) | −3.6; −36.9 |
| 45.1 | مِن (al-Qasim, Abu Ghudda, al-Tha'alibi) | في (the diwan) | −8.5 |
| 49.1 | ظالِماً (al-Qasim, Abu Ghudda, al-Tha'alibi) | نائِماً (the diwan) | −18.5 |
| 50.2 | مَذاقَ المَرءِ (al-Qasim, Abu Ghudda) | مَذاقٌ وَهوَ (the diwan, al-Tha'alibi) | −6.8 |
| 52.1 | لَو (al-Qasim, Abu Ghudda) | قَد (the diwan) | −15.5 |
| 52.2 | فَأَنتَ … ظَمآنُ (al-Qasim, Abu Ghudda, al-Tha'alibi) | وَأَنتَ; عَطشانُ (the diwan) | −4.8; −18.3 |
| 56.1 | الرَّحلِ (none) | الرَّحبِ (Abu Ghudda); الوَحفِ (al-Qasim, the diwan, al-Tha'alibi) | −6.5; −13.6 |
| 57.1 | رائِقٍ نَضِرٍ (Abu Ghudda; al-Qasim reading it in his commentary) | رائِقٍ خَضِلٍ (al-Qasim's printed text and the verse block of his commentary); وارِفٍ خَضِلٍ (the diwan, al-Tha'alibi) | −16.2; −17.4 |
| 58.2 | الإِسرافِ (al-Qasim, the diwan) | اللَّذّاتِ (Abu Ghudda) | −14.1 |
| 59.1 | تُبدي (al-Qasim, Abu Ghudda, al-Tha'alibi) | تُبلي (the diwan) | −2.7 |
| 61.1 | الدّينَ (al-Qasim, Abu Ghudda, al-Tha'alibi) | اللَّهَ (the diwan) | −11.8 |
| 63.2 | يَصُغها (al-Qasim, Abu Ghudda) | يَقُلها (the diwan) | +0.2 |

- **The reciter's departures from al-Qasim's commentary:** 3.1 «الدّار», 21.2 «العصر» and 57.1 «نضر» are the readings of other witnesses (above); the full transcript and both clip transcribers (`media/work/yRu-P1Xz6bI/clips2-*`) hear all three. Each has a note giving al-Qasim's reading.
- **56.1 «الرَّحلِ»:** no source has it. The aligner prefers it to Abu Ghudda's «الرّحب» by 6.5 and to «الوحف» by 13.6, and the full transcript and both clip transcribers (cohere and audar, on a clip cut with a wide margin) hear «الرحل». Scored on its own (words 4–6), «الرحل» also beats every other word of its shape tried: «الرّحب» −5.8, «الرّوح» −5.9, «الوحف» −7.5, «الرّطب» −8.9, «الرّغد» −12.5. The text follows him; the note gives the editions' «الوَحف» (and Abu Ghudda's and al-Damiri's «الرَّحب») with their meaning, the sharh explains the bayt by «الوحف», and the English sharh says so.
- **Coin tosses:** 63.2 keeps «يَصُغها», the reading of both texts of the poem as «عنوان الحكم» (the cohere clip hears «يصغها», audar «يصوها»); 27.1 and 59.1 keep al-Qasim's text, which the full transcript also hears («يغرن منك», «تبدي»).
- **Not a reading:** al-Qasim's commentary repeats 33.1 without «ونهى» (pp. 48–49) while discussing it; the half scans only with it, and the reciter says it (the full transcript's «عرم تقوانها» is «يعرى من تقىً ونُهى» run together).
- **Vowels:** 9.2 «الرِّبحَ» where the commentary's block prints «الرَّبح»; 57.2 «الشّيبِ» (shib, the grey-haired), al-Qasim's vowel, where the diwan prints «الشَّيب» but its editors prefer shib, the vowel of ن (note 42); 37.2 «غَرائِزٌ» takes tanwin for the meter; the mim of 20.1 «مِنهُمُ», 20.2 «سوسَهُمُ» and 24.2 «مِنهُمُ» is long by the meter.
- **Meter:** basit, every half scanned (`/tmp/shw/b3/tools/scan.py` with بالله and the long mim of the plural pronoun added: `media/work/yRu-P1Xz6bI/notes/scan2.py`); 1.1 rhymes with 1.2 (tasri').

## Ear check

- **Alignment:** `align.py` was run on the whole recording with al-Qasim's text, before 3.1, 21.2, 56.1 and 57.1 were changed to the reciter's words; those four were then scored with `variants.py` (above). The half timings do not depend on them. 22 weak words, mostly short ones (إن, من, ما, يا, في, كنت); the weakest is 36.2 «في» (0.01). The halves pass by ear.
- **`scripts/verify.py`:** 30 of 126 clips differ from the text, all the transcriber's:
  - **clips the transcriber failed on:** 8.2 (a repeated invented phrase, «من أعطي الله ما أعطي…»), 26.2 and 59.1 (nothing); the wide-margin clips in `clips2-cohere` and `clips2-audar` hear the halves as written;
  - **a stretched final syllable heard as a letter:** 12.2 «اركانه», 46.2 «اخوانه وخلانه», 50.2 «خطبانه», 59.2 «شيطانه»; 15.2 «الحقيقات», 22.2 «حقيقات», 33.2 «اظلات», 34.1 «دولاتهم», 45.1 «القناعات», 51.1 «سيراته», 57.1 «ناظر»;
  - **words run together or split:** 6.2 «يا قوت», 19.1 «نحواه», 24.2 «منه موصل», 33.1 «عرم تقوانها», 36.2 «غان من», 47.1 «رضيعان» (the clips2 transcripts: «رضيعان بان», «راضي عالبان»), 52.1 «فيلو جديد», 61.2 «ومالكسر قنات»;
  - **misheard words:** 3.1 «ويا» (an added و breaks the meter), 3.2 «خراب» for «لخراب» (the meter needs the لِ), 5.1 «زاعل فوادا», 8.1 «لا كثير», 36.1 «والشاء», 37.2 «لا تتحصيها» (the clips2 transcripts: «لاست تحصيها», «لا أستحصيها»; the meter needs «لَستَ»), 40.2 «اصرار», 49.2 «يقضان»;
  - **51.1:** two invented words at the end of the clip («ان يعلمون»).
- **Edges:** 19.2 and 60.2 start with a sliver of the half before («من», «ما»); the timings are the aligner's.

## Commentary drawn on

- **Al-Qasim's commentary** for the sense of most abyat and for: 2 (any deed not done for God's sake is lost), 7 (his objection to «تستعبد» and his «تستعطف»), 19 («الحقّ» as God), 34 («دولته» as the ruler's favour), 42 (choosing the right time for a request), 54 («الناس» as the believers, 49:10), 56 («الوحف»), 57 (his «نضر» and the note on «خضل»), 61 (the shaft as a spear), 63 (the closing modesty, Hassan ibn Thabit); his Quran and hadith references in 10 (which he gives under 9), 13, 16, 21, 26, 32, 33, 37, 39, 54, 59 and 60.
- **The diwan's apparatus** for many glosses: الوزع (5), أفصّلها (6), عروض زلّته (8), أخدان (15), خزيان (19), السوس (20), يقلهم (21), صروف الدهر (22), إبّان (23), الصلّ (24), الخرق (27), المقدرة (28), النّور وفاغمة (29), الغلالة (30), غضّان (31), النهى (33), سحبان وباقل (35), الوشّاء والدوّ والسرحان (36), الأكنان (37), صدّاء والسعدان (38), أبرّوا (41), البحران (43), القنيان (44), رضيعا لبان (47), السِّنة (49), الخطبان (50), اللجج (52), الوحف ومنتشيًا (56), الخضل (57), قريع وحسّان (63).
- **Al-Tha'alibi's prose maxims** quoted in 31, 45, 56 and 57.
- **Added here:** Quran 3:103 (12), 68:12 (15, note), 96:6–7 (47), 2:255 (49, note); the hadiths of the believer who mixes with people (20, Ahmad) and of «قد أفلح من أسلم» (44, Muslim).
- **The intro:** the poem's place in his work and its commentators (al-Suja'i's «بلوغ الأرب», Nuqrakar) from the diwan's introduction, pp. 5–6; al-Tha'alibi's prose version from the diwan's introduction and نثر النظم itself; Ibn al-Qayyim's quotation of 9 («كما قيل») in مدارج السالكين, الروح and مفتاح دار السعادة (shamela search); the names and al-Qasim's «لكن أشهرها: بنونية البستي» from his introduction, p. 7; his text among the set texts from the title of متون طالب العلم and its note «ليسهل على الطالب الحفظ».
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 4, p. 326 (shamela 12286/3942, `alam.txt`); al-Tha'alibi, *Yatimat al-Dahr*, vol. 4, pp. 345–346 (shamela 6743/1829–1830, `yatima.txt`) for his service to the lord of Bust and Sebuktigin, his name for wordplay, «المتشابه», and the phrase «صاحب الطريقة الأنيقة في التجنيس الأنيس البديع التأسيس»; Ibn Khallikan, *Wafayat al-A'yan*, vol. 3, pp. 376–378 (shamela 1000/1387–1389, `wafayat.txt`) for «عادات السادات سادات العادات» and the two death dates; Bust in today's Afghanistan from al-Qasim's commentary, p. 7.

## Review

Not yet read by a second reader: the drafter could not start one (the limit on concurrent subagents was reached), 2026-11-17. The drafter's own pass, after taking over an unfinished draft, checked the text against all five witnesses (the diwan as page images; the commentary through a page-by-page summary made from its page images, checked against pp. 7, 20, 73 and 74), scanned every half, scored every reading, and checked the notes, intro and bio against the sources; it fixed overlapping notes on 1.2, three heads (4.2 «أَنسى», 28.1 «مَقدُرَة», 56.1 «مُنتَشٍ»), the credits in the notes on 3.1, 21.2 and 57.1, the bio's partial quotation of al-Tha'alibi, an ellipsis (28) and a question (56) in the sharh, sharh that repeated its notes (11, 43), the translation of 49.1, and the 34.1 note; it added al-Tha'alibi's prose version as a witness and source (31, 45, 56, 57), rewrote the intros on the diwan editors' account, and deepened 45, 46 and 50.
