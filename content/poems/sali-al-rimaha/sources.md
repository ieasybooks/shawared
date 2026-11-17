# سَلي الرِّماحَ العَوالي عَن مَعالينا

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=KTiiwdaL7ac (uploaded 2021-06-23, 5:12), «سلي الرماح العوالي / أسامة الواعظ». The description names the poet and gives his death date as 750 AH.
- **Audio:** kept 5.05–300.95 s of the download, gain −1.8 dB, giving −20 LUFS with a peak of −4.5 dBTP (295.9 s). The production frames the recitation with two quiet passes of his voice, which are cut:
  - **the opening** (0.6–5.0 s): the first half said faintly, about 13 dB under the recitation (mean −33 dB against −20 dB), before he says it at full voice. The app audio starts 0.45 s before the full-voice first word.
  - **the close** (300.9–307.7 s): bayt 32 again, about 10 dB under the recitation, run straight on from its full-voice reading. Both clip transcribers hear the whole bayt in it (cohere stops at «عنه», audar goes on to «تغاضينا»); the full-recording transcript misses it, and the aligner could not place its words (confidence 0.00–0.06). The app audio ends where the full-voice «تغاضينا» fades, before the quiet pass.
- **Abyat recited:** 32 of the diwan's 33, in order, none repeated at full voice. The full transcript has none of Mazloum's other «س» readings (5.1 «ما ارتبطناها», 5.2 «مَن كانَ», 7.2 «وإن هُمُ حُكِّموا», 8.2 «خلتهم فينا», 9.2 «وإذ دعوا», 23.2 «تكن»); he says the text of both editions there. He leaves out the last, «لكن تركناه إذ بتنا على ثقةٍ / إنّ الأمير يكافيه فيكفينا».

## Editions

- **ديوان صفي الدين الحلي** (Dar Sadir, Beirut), pp. 20–22: scan archive.org `3509pdf`, leaves 19–21 (`sadir.txt`). Headed «سلي الرماح», with the occasion: «وقال في صباه يفتخر بقومه وأخذهم بثأر خاله صفي الدين بن محاسن من آل أبي الفضل حين قتلوه بمسجده غدراً، فأخذوا الثأر قسراً سنة إحدى وسبعمائة». 33 abyat, voweled, with short glosses (استخصموا، الفراعنة، الزرازير، الشواهين، البيادق والرخاخ والفرازين، الفرامين، المصلّي).
- **ديوان صفي الدين الحلي**, ed. Muhammad Mazloum, vol. 1, pp. 64–66: scan archive.org `1_20260318_20260318_1716`, leaves 64–66 (`mazloum.txt`). Titled «مجانين في الحرب» by the editor, under the same heading, 33 abyat, fully voweled; its notes give the variants of two manuscripts, «د» and «س», and of *Masalik al-Absar*. Its introduction (p. 28) says the poet fought in the battle of al-Zawra', was wounded there, and composed the poem at twenty-three.
- **Ibn Fadl Allah al-Umari, مسالك الأبصار في ممالك الأمصار**, vol. 16, pp. 250–251 (Dar al-Kutub al-Ilmiyya print: shamela 30189/5835–5836, `masalik.txt`; the Cultural Foundation print, pp. 335–336: shamela 11790/6268–6269, `masalik-mujamma.txt`). Nineteen abyat, 1–7, 10, 12–17, 19–22 and 25 here, introduced as said after the poet had taken his revenge («ومنها قوله، وقد أخذ بثأره…»), with «سَلِ … واستشهدِ … وسائلِ», «وتهتزّ», «صاروا», «عن بلوغ منى» and «بآدينا».
- **The Abu Dhabi poetry encyclopedia's text** (old shamela 4517, `shamela-old-4517.txt`, `mawsua.txt`): the Dar Sadir text with its typos («نهبش», «أعزتنا»); not an independent source.

`abyat_in_full` is 33, the count of both editions of the diwan.

## Readings settled by ear

Scores come from `scripts/variants.py`'s scoring, run on the app audio through a copy that loops over several stretches so the model loads once (same model, same sums); the gap is the other reading's score against the text's.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 2.1 | العُربَ (both editions) | العَرَبَ | −6.8 |
| 4.2 | دِنّا (both) | دَنا | −1.7 |
| 7.2 | حُكِّموا (both) | حَكَموا | −2.4 |
| 11.1 | ظَنَّت (all) | وَأَنَّ (the full transcript's «وأن التأني») | +0.3 |
| 12.2 | صادوا (Dar Sadir; Mazloum's manuscript «د») | صاروا (Mazloum's text; *Masalik*) | −1.3 |
| 16.2 | وَيَهتَزُّ (Dar Sadir; Mazloum's «د») | وَتَهتَزُّ (Mazloum's text from «س»; *Masalik*) | −5.4 |
| 25.2 | دَهَتنا (all) | نَهَتنا; أَتَتنا (for the full transcript's «انتهتنا») | −3.3; −4.1 |
| 25.2 | بِأَيدينا (both editions) | بِآدينا (*Masalik*) | +2.8, see below |
| 26.1 | مُلكٌ (both) | مَلكٌ; مِلكٌ | −1.4; −2.6 |
| 27.1 | ثاقِبَةً (the reciter) | ثاقِبَةٌ (both editions); ثاقِبَةٍ | −4.0; −3.5, spelled out, see below |
| 32.2 | عَجَزاً (both) | عاجِزاً (what the transcribers write); عَجزاً | −4.7; +0.2 |

- **1.1–2.1 سَلي … وَاستَشهِدي … وَسائِلي:** Mazloum's «س» and *Masalik* have the masculine سَلِ … وَاستَشهِدِ … وَسائِلِ. Before the article both are said alike (salir-rimāḥa, wastashhidil-bīḍa, wasā'ilil-'urba), so the recording cannot decide, and the clip transcripts write «سل» and «سلي» both. The text keeps the feminine of both diwan editions.
- **11.1 ظَنَّت:** every transcript hears the opening as «وأن» or «ونت» («ونت أني البزات», audar), the ẓ being the sound both transcribers miss; «وأنّ تأنّي» would break the meter (u-uu-) and leave the sadr without a verb, and the aligner cannot tell the two apart. All sources have ظنّت.
- **12.2 صادوا, 16.2 وَيَهتَزُّ:** the reciter follows Dar Sadir and Mazloum's manuscript «د» against Mazloum's text and *Masalik*. 12.2 is close by score, but both clip transcribers hear صاد(وا) («صَادُ فَرَزِينا», «صادف رزينا»); 16.2 is clear.
- **18.1 دَعوَةً … سائِرَةً:** Mazloum has the accusative, the usual case after «يا لَها» (a specifying noun, as in يا لَهُ رَجُلاً); Dar Sadir has دعوةٌ … سائرةٌ. The romanizer drops tanwin, so the plain candidates score the same. Spelled out (دَعوَتَن against دَعوَتُن, سائِرَتَن against سائِرَتُن), the accusative wins by 3.9 and 4.7; the text follows Mazloum.
- **Tanwin spelled out:** to hear a tanwin's vowel, the candidates spell it as letters (-tan, -tun, -tin), which keeps them the same length. On seven tanwins whose case is not in doubt the test chose right every time: بيضٌ (20.1, by 2.4), and at the end of a sadr عَلَقٌ (17.1, 1.1), جَزَعٍ (11.1, 0.7), غَلَطٍ (28.1, 1.9), فَراعِنَةً (7.1, 1.4), مُصَدِّقَةً (9.1, 2.6), مُسَوَّمَةً (5.1, 4.4).
- **27.1 ثاقِبَةً:** both editions have ثاقبةٌ, an adjective of «عزائمٌ»; spelled out, the reciter's accusative wins by 3.5 and 4.0, wider than any control's margin but one. The accusative is good Arabic (a ḥāl: the resolves, piercing as they strike), so the text follows him and the word note gives the editions' reading.
- **25.2 بِأَيدينا:** *Masalik*'s بِآدينا («with our strength», as its editor glosses it) scores better, but it is two letters shorter, which the scoring always rewards; both clip transcribers and the full transcript hear «بأيدينا», as both diwan editions have it. The sharh mentions al-Umari's reading.
- **26.1 مُلكٌ:** both editions vowel it مُلك, and cohere's clip transcript writes «مُلكٌ»; the scores lean the same way. مَلِك, the king, would break the meter (uu-u-); its shortened form مَلْك would scan, but no source has it. Abyat 26–28 praise the holder of that sovereignty: he gives (28 «أعطى»), and the diwan's last bayt, which the reciter leaves out, names «الأمير» who will repay the enemy; the sharh and translation read مُلك as the sovereign himself.
- **32.2 عَجَزاً:** both transcribers, and the full transcript, write «عاجزا». But the romanizer drops the long ā, so the scored strings differ only in the vowel after ج ('ajazan against 'ajizan, the shorter of the two), and the edition's a wins by 4.7; a long ā after ع is the stretch of the foot's first short syllable that the transcribers turn into a known word. The meter takes either. The text keeps both editions' عَجَزاً. A second listener could overturn this one.
- **Meter:** every half scans as basit (`/tmp/shw/b3/tools/scan.py`) except two, both as the poet wrote them: 12.2 «تَرَكناهُمُ» needs its mim lengthened (humū), as verse often does; 15.1 «أَخلَوا المَساجِدَ» scans only if the waw of أخلوا makes no syllable of its own before the article (akhlal-masājida); every source spells it أخلوا, and the aligner's low confidence on the word (0.28) fits a reciter who does not say akhlawu. 5.2 «لِنَغزو» and 19.2 «نَبتَدي» keep their last letter silent where the subjunctive would take a fatha (*Masalik* voweling نَبْتَدِيَ, which the meter rejects); 27.1 «عَزائِمٌ» takes tanwin, which the meter needs; 22.1 «فَرامينٌ» has the tanwin of both editions, which the meter allows but does not need; 2.1 «العُربَ» (not العَرَب) is the only form that scans, and also the clearer reading by ear (−6.8).

## Ear check

- **Alignment:** `scripts/align.py` flagged 7 weak words in the kept audio, all short or at a half's edge: 6.2 «أو» (0.27), 7.1 «إذا» (0.20), 13.1 «فمذ» (0.29), 15.1 «أخلوا» (0.28, see above), 19.2 «أن» (0.34), 23.2 «إن» (0.12), 31.1 «به» (0.32). The first alignment, on the audio with the quiet passes, placed the quiet opening as a weak 1.1 (0.14–0.40) and crowded the quiet close into the last second; neither is in the app audio.
- **`scripts/verify.py`:** 11 of 64 clips differ from the text; every difference is the transcriber's:
  - **stretched syllables heard as letters:** 4.1 «وقعات», 8.1 «حاميته», 9.2 «امينه»;
  - **words misheard or run together:** 1.2 «البيضه الخبر جفينا», 6.1 «قل اصوم سمعهم», 13.1 «فمنذر», 16.2 «القنالينا», 22.1 «فرامنن صلوبها», 25.1 «الخطبه»;
  - **15.1 «دخلوا»** for أخلوا: the clip cut with a wider margin hears «أخلوا» in both transcribers;
  - **11.1 «وان التاني»:** see above;
  - **31.2** ends on «نا»: the stretched rhyme of «ويسقينا», not the next half.
- **Second transcriber:** audar on the clips cut with wide margins (1.1, 4.2, 7.2, 11.1, 12.2, 15.1, 16.2, 18.1, 25.2, 26.1, 32.2 and the two quiet passes) agrees with cohere wherever it matters (`media/work/KTiiwdaL7ac/clips/`).

## Commentary drawn on

- **Glosses** follow the Dar Sadir notes (استخصموا، الفراعنة، الزرازير، الشواهين، الفرازين، الفرامين، المصلّي) and Mazloum's (الفرازين, الفرامين); *Masalik al-Absar*'s print gives «بآدينا: بقوّتنا». The rest are from the dictionaries' common senses (العوالي، الضمّر، المسوّمة، دان، الصلّ، العلق، العبير، الطلق، صرف الدهر، فوّق، الممنون).
- **The occasion:** the diwan's heading (both editions), *Masalik al-Absar* (the uncle named «صفي الدين محاسن بن محاسن»), and Mazloum's introduction, p. 28 (the battle of al-Zawra', the poet's wound and age, the killers «رجال من آل الفضل خصوم سنبس»).
- **Places:** al-Zawra' as Baghdad, and other places of the name, from Yaqut, *Mu'jam al-Buldan*, vol. 3, pp. 155–156 (shamela 23735/1229–1230) and vol. 1, p. 456 (23735/451). The two shrines called the tomb of Ubayd Allah: al-Khatib al-Baghdadi, *Tarikh Baghdad*, ed. Bashshar, vol. 1, p. 446 (Mashhad al-Nudhur in Baghdad, shamela 736/156, `tarikh-baghdad.txt`), and al-Harawi, *al-Isharat ila Ma'rifat al-Ziyarat*, p. 71 (al-Madhar, shamela 10797/66); Yaqut, vol. 5, p. 88 (shamela 23735/2121, `yaqut-madhar.txt`) describes the shrine at al-Madhar but his print names its man عبد الله بن علي. No source ties the poem's place to either, so the note gives both without choosing.
- **The poem's later life:** Ali al-Tantawi, *Dhikrayat*, vol. 1, p. 76 (shamela 17076/71), on learning it at school in Damascus, and vol. 1, p. 67 (17076/63, `tantawi-flag.txt`), on the new four-coloured flag raised in Damascus when the Ottoman army left («فكأنه يقول مع صفي الدين:» and bayt 20; he quotes the bayt again for the flags in Baghdad, vol. 4, p. 163, 17076/1345); *Masalik al-Absar* above for al-Umari's selection.
- **Bayt 20 in rhetoric:** Muhyi al-Din Darwish, *I'rab al-Quran wa-Bayanuh*, vol. 2, p. 17 (shamela 2163/580, `darwish-tadbij.txt`), quotes it for التدبيج; al-Maraghi, *Ulum al-Balagha*, p. 313 (9997/340), sets it as an exercise in kinaya.
- **Quran:** 37:10 («فأتبعه شهابٌ ثاقب», the piercing flame that pursues the eavesdropping devil) for bayt 27; 95:6 («فلهم أجرٌ غير ممنون») for bayt 28.
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 4, pp. 17–18 (shamela 12286/3021–3022, `alam.txt`), and Mazloum's introduction, pp. 28–30.

## Review

A second reader checked every half against the page images of both diwan editions and the *Masalik* text, scanned every half, re-read the readings settled by ear and their logs, measured the cut at both ends, and checked the sharh, notes, translation, intro and bio against the editions, the lexicons and the research files (2026-11-17). The text needed no change. Fixed after the review:

- **Meaning:** 26–28 read as praise of the sovereign who protects the tribe (مُلك for its holder, the «أمير» of the omitted last bayt), so the English says "he", not "it", and the sharh, notes and intro say so; 18 «تلقينا»: time dictates the story like a teacher, not repeats it like a pupil; 29 «بسطوته» keeps the enemy's own might, with the sovereign's might as the other reading.
- **English:** 25 no longer says both halves end on "hands" (the sadr ends on فَنَدفَعُها); 26–28 retranslated with "he"; 18.2 retranslated.
- **Sharh:** 12 gives *Masalik*'s and Mazloum's «صاروا» (a pawn promoted to vizier); 20 the rhetoricians' التدبيج; 27 quotes 37:10, whose «ثاقب» the bayt borrows; 32 in the present tense; a phrase in 26 and 28 that repeated the notes removed; English 3, 6, 11, 31 deepened.
- **Notes:** 1.1 «العوالي» glossed as the adjective it is here (tall); added 2.1 «العُرب», 5.2 «باتَ», 13.1 «مُذ», 19.1 «شَرَفاً», 21.1 «دونَ» (with *Masalik*'s «عن بلوغ»), 26.1 «نَبل», 28.2 «أجره», 31.1 «يُشير»; English notes for 26.1 and 28.2.
- **Intro:** al-Tantawi on the four-coloured flag and bayt 20, quoted exactly; "a sovereign power" made "the sovereign".
- **Timeline:** 32.2 runs to 295.85 s, where the full-voice «تغاضينا» fades (the aligner stopped at 295.50).
- **sources.md:** Mazloum's editor's title named; his other «س» readings recorded as not said; 19.2 «نَبتَدي» added to the licences; مَلْك noted under 26.1.
