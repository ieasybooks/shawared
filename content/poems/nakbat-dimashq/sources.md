# نَكبَةُ دِمَشقَ

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=1lAVCKF7SC0 (uploaded 2025-02-28, 6:58), «سلام من صبا بردى أرقّ | إلقاء: أسامة الواعظ». The description names the poet («للشاعر أحمد شوقي (ت: ١٩٣٢م)») and gives no text.
- **Audio:** kept 4.7–409.5 s of the download (`media/work/1lAVCKF7SC0/audio.json`), gain −7.2 dB, giving −20 LUFS with a peak of −6.9 dBTP. The poem starts at once after 5.2 s of silence.
- **The ending:** the video fades out over the last bayt, which he says three times. The first time is at full level; the fade starts during the second (from about 398 s of the download) and the third lies at −36 to −50 dB, under the fade, before the closing silence at 412.9 s. The app audio keeps the first two and cuts at the end of the second (409.5 s), so the timeline plays bayt 50 twice. An earlier cut at 413.3 s left the aligner only 3.6 s for the third pass, and it put every word of it below 0.01.
- **Abyat recited:** 50 of the 55, in the diwan's order: 1–50. He says the opening sadr twice (two clean passes, 0.5–4.2 s and 4.6–8.3 s) and the last bayt twice more, as above. He leaves out the last five abyat, on the Druze («وما كان الدروزُ قبيلَ شرٍّ» to «كأنّ من السموأل فيه شيئًا»).

## Editions

- **الشوقيات، شعر المرحوم أحمد شوقي**, Dar al-Awda, Beirut, 1988, volume 1 (parts 1 and 2), part 2, pp. 74–77: archive.org `elshandawily2617`, leaves 372–375 (the title page of part 2 is leaf 300, the imprint leaf 2). Headed «نكبة دمشق: قيلت في حفلة أقيمت لإعانة منكوبي سوريا بتياترو حديقة الأزبكية في يناير سنة ١٩٢٦». 55 abyat, lightly voweled, in five sections divided by asterisks, with glosses at the foot of each page. A second scan of the same printing, `BBib-Alex-02914`, leaf 377, has the same page 74. This is the edition the text follows and `abyat_in_full` counts.
- **مجلة المنار**, vol. 26, issue of Rajab 1344 (January–February 1926), p. 634: shamela 6947/3589 (`manar.txt`), under «جمعية منكوبي الإعانة السورية». Rashid Rida prints the whole poem, 55 abyat in the diwan's order, and says it and a poem by Khayr al-Din al-Zirikli «أنشدتا في حفلة حافلة لجمعية الإعانة». Lightly voweled; it has a few misprints the diwan doesn't (ليلٌ for بليل in 27.1, «على من راع» for «سلي من راع» in 29.1, «غير عطف» for «غير مختلف» in 42.2, يسفي in 45.1).
- **Quotations:** Ali al-Tantawi, *Dhikrayat*, vol. 1, pp. 292–295 (shamela 17076/278–281, `tantawi.txt`), voweled, abyat 1, 2, 22, 24–30 and 40–48; al-Risala no. 491, pp. 11–12 (shamela 29674/36701–36702, `risala-491*.txt`), abyat 12–16, 25–28, 37–39, 41–43, 45 and 47–48; مجلة الجامعة الإسلامية vol. 20, pp. 232–233 (shamela 4473/9728–9729, `jamia.txt`), 45 abyat (it leaves out 33–36, 39 and the last five).
- **Starting text:** none; the description has no verses. The text was set from the Dar al-Awda scan, read as page images (`crops` in `/tmp/shw-nd`), and given full harakat in the house style.

`abyat_in_full` is 55, the count in al-Shawqiyyat and al-Manar.

## Readings settled by ear

The words are the same in al-Shawqiyyat and in the recording throughout; only vowels the editions leave unmarked needed the audio. Scores come from `scripts/variants.py` on the app audio (one batch run, `/tmp/shw-nd/vb/vbatch.py`, which loads the model once); the gap is the other reading's score against the text's.

| Half | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 10.2 | المَدَقُّ (the diwan's fatha) | المِدَقُّ | −1.7 |
| 11.2 | أَبِيٍّ (the diwan) | أَبِيٌّ | 0.0 (the aligner drops tanwin) |
| 13.2 | وَيُجمِلُها (the diwan, al-Manar) | وَيُجَمِّلُها | −5.3 |
| 25.2 | تُزَقُّ (the diwan, al-Risala) | تَزُقُّ (al-Tantawi) | −7.2 |
| 29.1 | غيدَكِ | غيدَكَ | −4.3 |
| 39.1 | صَيَدٍ (the diwan, al-Manar, al-Risala) | صَيدٍ (it also scans) | −2.6 |
| 43.2 | فَاشقَوا | فَاشقُوا (al-Risala) | +0.5 over the half; −0.3 on the word alone |
| 45.1 | يَسقي (the diwan) | يُسقى (al-Tantawi) | −6.1 |
| 49.1 | دِمَشقٍ | دِمَشقِ; دِمَشقَ | −1.4; −3.5 |
| 17.1 | تاجُكِ | تاجُكَ | +5.9 over the half, +1.7 on the last three words; see below |

- **17.1 «تاجُكِ», left open.** The whole passage speaks to Damascus in the feminine (16 «أَلَستِ», 18 «سَرحِكِ», 19 «سَماؤُكِ … وَأَرضُكِ», 20 «بَنَيتِ»), and none of the prints marks the kaf. Over the whole half the aligner prefers «تاجُكَ» by 5.9, which the guide counts as clear; cut down to «تاجُكِ لَم يُجَمَّل» the gap falls to 1.7. The same test on the other feminine pronouns of the poem prefers ‑ki: 3.2 «إِلَيكِ» +4.9, 5.1 «دَخَلتُكِ» +3.2, 22.1 «وَيحَكِ» +3.0, 31.1 «رَماكِ» +2.4, 18.2 «سَرحِكِ» +1.2, 19.1 «سَماؤُكِ» +1.2, 19.2 «وَأَرضُكِ» +0.5, and 6.1 «جِنانِكِ» −0.2. So the reciter may have slipped into ‑ka here. The text keeps the grammatical «تاجُكِ»; it needs a listener.
- **43.2 «فَاشقَوا»:** the imperative of شَقِيَ يَشقى is اِشقَوا, so the rawiy takes a fatha here against the damma of every other rhyme; al-Risala's «فاشقُوا» smooths the rhyme, but the lexicons give the verb for suffering as شَقِيَ يَشقى. The diwan marks only the sukun of the shin, and the aligner can't tell the two apart.
- **49.1 «دِمَشقٍ»:** the diwan prints a kasra under the qaf; the reciter says a kasra or pauses (−1.4 for the kasra without tanwin, −3.5 for the fatha a diptote would take). The text gives the name the tanwin poets allow it.
- **11.2 «أَبِيٍّ»:** the diwan's kasra-shadda over the ya, an adjective of «حُرٍّ».
- **26.1 «رُمنَ»:** the transcript hears «رمنا», but the subject is the women of 24–25, and every print has «رمن»; the aligner can't hear the length of the vowel.
- **Tanwin and long vowels the transcript drops or adds** follow the meter: 17.2 «يوسَم» (the transcript's «يسم»), 3.2 «تَلَفُّتٌ» (its «تلافت» is the stretched vowel), 15.1 «دُكَّت» (its «دكات»).

## The meter

Wafir (مفاعلتن مفاعلتن فعولن), rawiy ق, with damma. Every half was scanned with a wafir version of `/tmp/shw/b3/tools/scan.py`. Four halves scan only with a lengthened pronoun, as the reciter says them and as the diwan prints two of them:
- 35.2 «قَومِهِمُ» and 47.2 «لَهُمُ», with the mim's damma lengthened (the diwan prints «قومِهمُ»; al-Manar «لهمو»);
- 20.2 «حَضارَتَيهِ» and 34.1 «فيهِ», with the ha lengthened after a long syllable.

Where the meter decides the text: 10.2 «المَدَقُّ» and 34.2 «كَمُنهَلِّ» need their shadda; 17.2 «يوسَم» its long vowel (the transcript's «يسم» is a syllable short); 21.2 «بِأَندَلُسٍ» its tanwin; 23.2 «نَسقُ» its sukun.

## Ear check

- **Alignment:** `scripts/align.py` through `heavy --mem 9G`, on the app audio as first cut (to 413.3 s of the download), with the plan 1.1 twice, 1.2 to 50.2, then bayt 50 twice more. The third pass of bayt 50 fell under the fade-out and its words scored 0.00–0.01, so the audio was recut at 409.5 s and the timeline and `words.json` trimmed to match: the audio before 404.8 s is the same in both cuts, so the timings of the first 103 entries stand. A second alignment on the recut audio waited 35 minutes for a slot on the shared machine and was dropped. 34 weak words of 449, nearly all short ones (مِن, لَكَ, بِهِ, إِذا, أَن); the weakest is 26.1 «مِن» (0.11). The longer ones: 6.2 «وَمِلءُ» (0.29, below), 33.2 «وَتَعلَمُ», 37.2 «وَأَلقوا», 41.2 «وَلَكِن», and 50.2 «بِنَصرِ» in the fading second pass.
- **`scripts/verify.py`** (GPU build, under the GPU lock): 19 of 103 clips differ from the text, 29 of 449 words. Ten clips were transcribed again with `--transcriber audar` (`media/work/1lAVCKF7SC0/audar-asr/`). Every difference is the transcriber's:
  - **names and words run together or misheard:** 1.1 «صباب رداء» (twice) for «صبا بردى»; 29.1 «سليما» for «سلي من»; 36.2 «علاقناها»; 37.1 «تططرح» for «اطّرحوا»; 10.2 «واطرم»; 8.1 «الاسنان» for «لسن»; 21.1 «وعرص»;
  - **the stretched rhyme heard as letters:** 9.2 «خلقها», 25.2 «تزقر», 28.1 «افقر», 28.2 «افقه», 29.2 «فرقه», 39.2 «عنقها», 38.1 «تغرر»;
  - **6.2 «ومن» for «وملء»:** both transcribers hear «ومن», but each also hears the syllable of the hamza after it («ومن ارباك», «ومن أورباك»), and «وَمِن رُباكِ» would leave the first foot a syllable short;
  - **9.2 «لكل»:** the second transcriber hears «بكل»;
  - **31.2:** the clip transcriber returned nothing; the second hears «أخو حرب به صلف وحمق»;
  - **41.1:** the clip transcriber drops «داراً» (aligned at 0.92); the second hears it;
  - **47.2 «الاسراف دن»:** the second transcriber hears «وفي الأسرى فدا لهم», and the full transcript ends the half «وعتق».
- **Edges:** 1.2 starts with «وهو», 11.2 with «من», 14.2 with «ما» and 26.2 with «ان», slivers of the half before (26.1 ends on the tanwin of «طَريقٍ»); 20.1 ends with «الناس», which the second transcriber doesn't hear.

## Commentary drawn on

- **Glosses:** the footnotes of the Dar al-Awda edition (بردى, الرزء, خفق, ائتلاق, الورق, لهوات, لسن, شدق, اضطرم, المدق, الشكيمة, العتق, الولي, يفصّل, الأحداث, الظئر, السرح, الرقّ, منضّد, الدمى, المقاصير, الوهن, منهل السماء, تسترقّ, الرقّ as slavery, الصَّيَد, العتق as freedom); other words from the common lexicons.
- **Readings of the abyat:** al-Tantawi on 2 (that the poet did not fall short in describing after all), 25 (the women driven out of their houses with fire around them and their children in danger), 30 (stones dressed in silk), 40–43 (lines that became proverbs; hearts of the East; eloquence needs faith to unite) and 48 («بيت القصيد … على ضعف تأليفه»).
- **The occasion:** the Dar al-Awda heading (January 1926, the Azbakiyya Garden theatre); al-Manar vol. 26, p. 634 (the relief society formed in Cairo after Saad Zaghlul's appeal, and the two poems recited at its party) and p. 585 (shamela 6947/3584, `manar-revolt.txt`: the revolt «حدثت في أوائل الصيف من هذا العام الشمسي (١٩٢٥م)», kindled by the Druze leaders of Hawran under Sultan al-Atrash, and the shelling of the Muslim quarters of Damascus with artillery and aircraft); al-Tantawi, *Dhikrayat*, vol. 1, pp. 276–277 (the burning of the quarter between Suq al-Hamidiyya and Suq Midhat Pasha, called al-Hariqa ever since). The date of the bombardment, which began on 18 October 1925 and lasted two days, and General Sarrail's order for it come from the English Wikipedia article on Hasan al-Kharrat, citing Michael Provence, *The Great Syrian Revolt* (2005), pp. 102–104. The French occupation of Syria in 1920: al-Zirikli, *al-A'lam*, vol. 3, p. 173.
- **Saladin:** al-Zirikli, *al-A'lam*, vol. 8, p. 220 (`alam-saladin.txt`): grew up in Damascus, took Jerusalem in 583 AH, died in Damascus in 589 AH. **Abd al-Rahman al-Dakhil** as founder of the Umayyad state in al-Andalus: vol. 3, p. 338 (`alam-dakhil.txt`).
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 1, pp. 136–137 (shamela 12286/346–348, `alam.txt`).
