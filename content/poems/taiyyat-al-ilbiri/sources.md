# تائِيَّةُ الإِلبيرِيِّ

## Recording

- أحمد النفيس, on his own channel: https://www.youtube.com/watch?v=HEYIcr8ODcI (uploaded 2025-01-20, 18:22), «تائية الإلبيري منظومة أبي إسحاق الإلبيري». The description names the text he follows: Abd al-Muhsin al-Qasim's.
- **Audio:** kept 0–1091.4 s of the download (the poem starts at once; cut 0.8 s after the last word, before a short tail and the closing silence), gain −3.3 dB, giving −20 LUFS with a peak of −3.7 dBTP.
- **Abyat recited:** 113, in order, none repeated: al-Qasim's 112 and the closing prayer.

## Editions

- **عبد المحسن القاسم, متون طالب العلم، المستوى الثالث**: shamela 573, pp. 33–53 (`qasim.txt`). «منظومة أبي إسحاق الإلبيري», 112 abyat, fully voweled and numbered, edited from seven manuscripts, the only dated one a copy of the diwan in the Escorial (404/2, 676 AH). This is the text the reciter follows, word for word but for the readings below.
- **ديوان أبي إسحاق الإلبيري**, ed. Muhammad Ridwan al-Daya, annotated edition (Dar al-Fikr al-Mu'asir): PDF on archive.org `menhagmuslim-book-5312-0e852aad05eb` (OCR in `3182pdf.`), pp. 23–35. 112 abyat, voweled and numbered, with glosses and the editor's introduction, which maps the poem's sections and takes Abu Bakr for a man who had spoken of the poet's faults (p. 23; p. 25 n. 6). His text has «فراجعها ودع عنك الهوينى» as bayt 30 and lacks al-Qasim's 105 («فليس الزهد في الدنيا خمولا»); his note to 112 counts the poem as 106 abyat with six added.
- **The same editor's earlier edition** (Dar Qutayba, Damascus, 1981): shamela 6869, pp. 25–33 (`diwan.txt`), unvoweled and without notes; the same 112 abyat.
- **محمد بن علي الإثيوبي, مشارق الأنوار الوهاجة**, vol. 4, pp. 557–562: shamela 17132/2207–2212 (`ethiopi.txt`). The whole poem in 115 lines, which he says the poet wrote to his son Abu Bakr: al-Qasim's 112, al-Daya's «فراجعها», «وإن أهملتها ونبذت نصحًا», and the closing prayer the reciter says, «وصلّ على تمام الرسل ربّي». His counting bayt has «تسعًا» for «ستًّا».

`abyat_in_full` is 115, al-Ethiopi's count, the longest text; the two editions have 112. The reciter does not say «فراجعها» or «وإن أهملتها».

## Readings settled by ear

Scores come from `scripts/variants.py` on the app audio; the gap is the other reading's score against the text's. The transcript has al-Qasim's words wherever al-Ethiopi's text differs in a word (some sixty places), so only the closer calls are listed.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 3.1 | غَدرٍ (al-Qasim, al-Daya) | خِدرٍ (al-Ethiopi) | −8.1 |
| 6.2 | إِن عَقَلتا (al-Qasim, al-Daya) | لَو عَقَلتا (al-Ethiopi) | −7.2 |
| 8.1 | وَيَجلو … غَشاها (al-Qasim, al-Ethiopi) | وَتَجلو … عَشاها (al-Daya) | −4.8; −5.6 |
| 8.2 | وَيَهديكَ (al-Qasim, al-Ethiopi) السَّبيلَ (al-Qasim) | وَتَهديكَ (al-Daya); الطَّريقَ (al-Ethiopi) | −6.6; −19.2 |
| 13.2 | إِن (al-Qasim) | أَن (al-Daya, from his manuscript; he allows إن) | +1.0 |
| 19.1 | طولَ باعٍ (al-Qasim) | طَويلَ باعٍ (al-Daya) | −16.9 |
| 21.2 | رَأَستا (al-Qasim, al-Daya) | رَئِستا (al-Ethiopi) | −7.4 |
| 25.2 | وَإِن كَبِرتا (al-Qasim) | إِذا كَبُرتا (al-Daya); إِذا (al-Ethiopi) | −21.6 |
| 26.2 | وَإِن فُقِدتا (al-Qasim) | وَقَد فُقِدتا (al-Daya); وَلَو (al-Ethiopi) | −9.2; −8.3 |
| 39.1 | اِفتَضَّ (al-Daya, al-Ethiopi) | اقتَضَّ (al-Qasim) | −7.1 |
| 50.2 | لِتَعبُرَها (all three) | لِتَعمُرَها | +0.6, see below |
| 53.1 | مِنها (al-Qasim) | فيها (al-Daya) | −12.7 |
| 85.2 | اِحتَسَبتَ (al-Daya, al-Ethiopi) | حَسِبتَ (al-Qasim) | −3.0 |
| 107.1 | فَرَّقتَها (al-Qasim; al-Daya's text) | فارَقتَها (al-Daya's proposed reading, al-Ethiopi) | 0.0 |
| 108.1 | فيها (al-Qasim, al-Ethiopi) | مِنها (al-Daya) | −11.3 |
| 112.1 | سِتّاً (al-Qasim, al-Daya) | تِسعاً (al-Ethiopi) | −17.6 |
| 113.2 | ذُكِرتا (al-Ethiopi) | ذَكَرتا | −4.9 |

- **Coin tosses:** 13.2 and 107.1 keep al-Qasim's text, which the reciter follows.
- **50.2:** both transcribers hear «لتعمرها» in both halves of the bayt, but the aligner can't separate م from ب here (in 50.1 it prefers ب by 1.0, in 50.2 م by 0.6). The text keeps «لِتَعمُرَها … لِتَعبُرَها», the reading of every source and the only one that makes sense.
- **39.1, 85.2:** the reciter departs from al-Qasim for al-Daya's readings; at 85.2 the transcript also hears «احتسبت».
- **109.1 «النَّصائِحَ»:** al-Qasim prints «النَّصايِحَ»; the text has the usual spelling, which al-Daya and al-Ethiopi print. The sound is the same.
- **Meter:** 74.1 «الدِّما» and 78.1 «عَشوا» are shortened from الدماء and عشواء (14.1 «حَلواهُ» is the usual حَلوى, which is also said حَلواء); 18.2 «فَإِن أَعطاكَهُ اللَّهُ أَخَذتا» scans only with its second foot shortened (مفاعَلْتُ), where al-Ethiopi's «انتفعتا» scans normally, but the reciter clearly says «أخذتا» (−26.5 for «انتفعتا»); 23.2 needs «أَن» (one clip drops it; the second transcriber and the full transcript hear it).

## Ear check

- **Alignment:** 95 weak words, nearly all short particles (ما, من, قد, في, إن); the weakest is 52.2 «ما» (0.01). The halves pass by ear.
- **`scripts/verify.py`:** 37 of 226 clips differ from the text, all the transcriber's:
  - **the rhyme's long ā heard as ـه:** 11.2 «ضربته», 18.2 «اخذته», 40.2 «عرفته», 58.2 «قرعته», 77.2 «رحمته», 86.2 «سترته», 93.2 «غرسته», 97.2 «طهرته», 112.2 «وسته»;
  - **words run together or split:** 2.2 «ان تري», 22.1 «وضع في», 52.2 «اخري كفزتا», 55.1 «وان ترهنا», 91.1 «تنعل كالدراريم», 92.2 «فتلقلب الرفيها», 41.2 «انا اختار» for «أنختا»;
  - **misheard words:** 11.1 «العظ … ينبت», 12.1 «للصن», 18.1 «فواضبه», 20.1 «عنهم», 25.2 «وتصور», 27.2 «وتربطها», 32.1 «نديك», 36.1 «ماله», 39.2 «افتضتا», 71.2 «تفتر», 76.1 «فقلت» for «ثقلت», 78.1 «عشوار», 84.2 «لدبتا», 94.1 «بعابد», 113.1 «ربك»;
  - **dropped words:** 23.2 «أن» and 61.1 «لي», both in the full transcript;
  - **99.1:** the clip transcriber invented a lecture credit («لفضيلة الدكتور محمد راتب النابلسي»); the second transcriber and the full transcript hear the bayt;
  - **50.2:** «لتعمرها» (above).

## Commentary drawn on

- **Glosses** follow al-Daya's notes: عرس, أبتّ, غطيط, ارعوى, العضب المهنّد, الخدر والربرب, الحشايا, مسوّمات, الإقتار, الفيء, غلق الرهن, ذو النون, نكس, أمّ دفر والحميّا, انهمل, نهنه, تفتّى, التفنيد, القهقرى وخبط عشواء, الهجير, الباطنة, المقت, الوجيه, تنعلك الدراري, العاب, أوضع والخبب, نشب, الضراغم والسبنتى, السامريّ, العُصم.
- **Sources al-Daya gives:** Ali's «طلّقتك ثلاثًا» (3, from *Nahj al-Balagha*); «الناس نيام» (4, *Kashf al-Khafa*); al-Shafi'i's «علمي معي حيثما يمّمت كان معي» (12, from his diwan, p. 100); al-Mutalammis's «ولا يقيم على ضيم يراد به» (103); «اغتنم خمسًا قبل خمس» (60); Abu Bakr as perhaps Abu Bakr ibn al-Hajj (6, p. 25 n. 6); the hadith of the four questions (20); Ibn Mas'ud's «رأس الحكمة» (21); the prayer against useless knowledge (23); Ta Ha 20:114 (35); 35:29 (43); «الدنيا سجن المؤمن» (46); «كن في الدنيا كأنّك غريب» (50); 57:23 (52); 9:82 (54); 21:87 (57); 2:152 (59); 101:8–9 (76); «من نوقش الحساب عُذّب» (79); 19:95 (81); 39:56 (82); the lightest punishment (84); 20:97 (100); 25:63 (101).
- **Added here:** the hadith «إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة» (10), 7:26 (22), 25:27 (28), 3:14 (38), 74:38 (55), 33:72 (80), 67:15 (93).
- **The frame of 61–85**, Abu Bakr's reply put in his mouth by the poet, rests on the text: 61 «وقل لي يا نصيح» opens the retort (al-Ethiopi: «وقل يا ناصحي بل أنت أولى»); the speaker is young and the one addressed old (63, 64, 70, 71); 72 echoes 61; and 86 «أبا بكر كشفت أقلّ عيبي» marks the return to the poet's voice. Al-Daya's general remark fits it (p. 23: «محاورة… وإشارةً إلى مقالة أبي بكر فيه… والحديث عن النفس من منطلق لوم الذات»), but his map of the poem reads it otherwise: the poet «جعل نفسه مثلاً يتحدث عنه» in 65–68 (his 66–69), then «عاد إلى خطاب أبي بكر» in 69–85, warning him.
- **The poem as a set text:** al-Qasim prints it in his series of texts for students (متون طالب العلم).
- **The poet's fame by this poem:** al-Himyari, *al-Rawd al-Mi'tar* (صفة جزيرة الأندلس), p. 30 (shamela 1344/33).
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 1, pp. 73–74 (shamela 12286/161–162, `alam.txt`), with the Sanhaja's rising against the vizier; «الفقيه الزاهد» is the diwan's heading for him (al-Daya, p. 23).

## Review

A second reader checked the text against al-Qasim, al-Daya (his page images) and al-Ethiopi, scanned every half, and checked the sharh, notes, intro and bio against the sources (2026-11-17). Fixed after the review:

- **Text:** the alif of wasl voweled in fourteen words (4.2 «اِنتَبَهتا» to 109.2 «اِمتَثَلتا»).
- **Credits:** 13.2 «أَن» is al-Daya's text, from his manuscript; the 36.1 row dropped (al-Ethiopi's «لإن» is لَئِن); 107.1 «فارقتها» is al-Daya's proposal, not his text; al-Daya's other readings (19.1, 25.2, 26.2, 53.1) scored and listed; al-Ethiopi's agreement added; the frame of 61–85 now rests on the text, with al-Daya's different map stated; the glosses credited to him corrected.
- **Meaning:** 25.2 «كَبِرتا», growing old, not growing great; 26, 95.2, 101.1 («جهلوا عليك», insolence) and 107.1 («فرّقتها») translated as the text says; 45.2 الفيء, the shade that replaces the sun; 12 quotes al-Shafi'i's line as al-Daya gives it.
- **Sharh:** 61–85 in the third person; Quran and verse allusions added in 22, 38, 60, 80 and 103, the wordplay in 102 and 104, and the other readings in 13, 17, 18, 72 and 112; notes no longer repeated in the sharh (35, 78, 90, 100, 104, 113).
- **Notes:** eleven added (13.2, 18.2, 31.1, 41.1, 49.2, 58.2, 63.1, 72.2, 101.1, 109.2, 112.1); Abu Bakr's identity given both ways; imperative heads in their plain form; initial ʿayn dropped in six romanizations.
- **Intro:** al-Himyari quoted exactly, al-Ethiopi named for "his son", both intros cut to five sentences.
- **Poet:** the nisba no longer put down to the exile; the Sanhaja's rising against the vizier added from al-A'lam.
