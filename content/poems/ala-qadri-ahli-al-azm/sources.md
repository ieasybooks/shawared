# عَلى قَدرِ أَهلِ العَزمِ تَأتي العَزائِمُ

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=01v6T9wghjw (uploaded 2023-12-16, 6:29), «على قدر أهل العزم تأتي العزائم | إلقاء: أسامة الواعظ». The description names the poet and nothing else about the text.
- **Audio:** kept 3.3–386.6 s of the download (the digital silence before the first word cut; the recording ends in a fade just after the last word), gain −4.9 dB, giving −20 LUFS with a peak of −4.7 dBTP. The gaps between halves sit near −46 dB (reverb or a faint bed); the aligner managed on the mix.
- **Abyat recited:** all 46, in order. He says the last bayt twice (373.9–381.7 s of the app audio, after its first saying at 365.7–373.4 s), and the timeline plays it twice. The full transcript's last chunk breaks off in that repeat («…بك دائم ولم لا يق الرحمـ»).

## Editions

- **al-Barquqi**, شرح ديوان المتنبي (Hindawi Foundation reset, Cairo, 2014), pp. 1230–1231, with his notes 162–208 on pp. 1309–1322: archive.org `20201020_20201020_1638`, leaves 1229–1230 and 1308–1321, read from the page images (`barquqi.txt`; the notes' OCR in `barquqi-notes-ocr.txt`). Fully voweled, 46 abyat, headed «وقال يمدحه ويذكر بناءه ثغر الحدث سنة ثلاث وأربعين وثلاثمائة». **The reciter says al-Barquqi's text word for word**, and it is the starting text, put in the house style.
- **al-Ukbari (attributed)**, التبيان في شرح الديوان, ed. Mustafa al-Saqqa, Ibrahim al-Abyari and Abd al-Hafiz Shalabi (al-Babi al-Halabi, Cairo, 1936–38; reprinted by Dar al-Ma'rifa, Beirut), vol. 3, pp. 378–392, poem 225: archive.org `20240104_20240104_1855`, leaves 1184–1198, read from the page images (`ukbari-verses.txt`, which fills in al-Barquqi's vowels where the print has none). Partly voweled, 46 abyat, headed «وقال يمدحه. وهي من الطويل، والقافية من المتدارك»; the commentary on bayt 1 tells the occasion. Shamela 6908/1110–1124 has the same print's commentary without the verses (`ukbari.txt`); shamela's card notes that the attribution to al-Ukbari is disputed.
- **al-Wahidi**, شرح ديوان المتنبي: shamela 754/274–278 (`wahidi.txt`; shamela numbers this book's pages itself, not by a print). Unvoweled, 46 abyat with commentary, headed «وقال يمدحه ويذكر بناءه ثغر الحدث ومنازلته أصناف الروم سنة ٣٤٣». The digital text has typos that are not readings: 10.2 «تمتئم», 35.2 «حملاتث», 46.1 «ولام», 46.2 «وتغليقه»; 5.1 drops «الطير».
- **Ibn al-Iflili**, شرح معاني شعر المتنبي: shamela 37065/473–476, vol. 2, pp. 244–247 (`iflili.txt`): the occasion and its dates, and the first abyat.

`abyat_in_full` is 46, as in all three editions. `scripts/collate.py` against the draft: al-Barquqi differs nowhere; al-Ukbari at 14.2, 29.1 and 44; al-Wahidi at 9.1, 21.2, 36.2, 38.1 and 44 (below).

## Readings settled by ear

Scores come from `scripts/variants.py`'s scoring on the app audio, run for all the rows with one model load (a wrapper that calls variants.py's own functions; it and the output are in `media/research/ala-qadri-ahli-al-azm/`, `vbatch.py` and `variants.txt`); the gap is the other reading's score against the text's. Every pair has the same number of words.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 5.2 | المَلا (all three) | الفَلا (al-Barquqi's «ويروى») | −8.8 |
| 9.1 | تَقرَعُ (al-Ukbari, al-Barquqi) | يَقرَعُ (al-Wahidi) | −6.4 |
| 10.1 | مِثلُ (al-Barquqi) | مِثلَ (al-Ukbari) | −0.5; −2.7 on «بها مثل الجنون» alone, see below |
| 12.1 | أَخَذتَهُ (all three) | أَخَذنَهُ (the reading the poet rejected, in al-Ukbari and al-Barquqi) | −7.1 |
| 19.2 | تُفهِمُ الحُدّاثَ … التَّراجِمُ (al-Ukbari, al-Barquqi) | تَفهَمُ الحُدّاثُ … التَّراجِمَ | −10.3 |
| 21.2 | الأَبطالِ (al-Ukbari, al-Barquqi) | الفُرسانِ (al-Wahidi) | −25.4 |
| 29.1 | كُلِّهِ (al-Wahidi, al-Barquqi) | نَثرَةً (al-Ukbari) | −17.8 |
| 36.2 | بِما (al-Ukbari, al-Barquqi) | لِما (al-Wahidi) | −6.6 |
| 37.1 | فيهِمُ | فيهِمِ (al-Ukbari; al-Barquqi leaves the mim unvoweled) | −6.1 |
| 38.1 | عَن (al-Ukbari, al-Barquqi) | مِن (al-Wahidi) | −4.6 |
| 44.1 | لَيسَ (al-Barquqi; al-Wahidi's «ويروى») | لَستَ (al-Wahidi, al-Ukbari) | −8.2 |
| 44.2 | فيهِ … مِنهُ (al-Barquqi) | فيكَ … مِنكَ (al-Wahidi, al-Ukbari) | −13.3 (−6.0 and −7.3 for each word alone) |

- **10.1** was a coin toss on the whole half (−0.5). The second reader scored the three words «بها مثل الجنون» alone (75.7–77.7 s, `variants-review.txt`), and «مِثلُ» led by 2.7: a lean, not proof. The text keeps al-Barquqi's «مِثلُ», which his note parses as the subject of كان («أي شيء مثل الجنون»); al-Ukbari's print has «مِثلَ».
- **Tanwin at the end of a sadr can't be scored.** The reciter pauses after every sadr, and on the second reader's tests (`variants-review.txt`) the bare word beats both the tanwin and the lengthened vowel even where every edition prints the tanwin (26.1 «غائِبٌ» −1.0, 33.1 «مُقدِمٌ» −2.0). The tanwin of 6.1, 13.1, 15.1, 19.1, 22.1, 23.1, 25.1, 26.1, 33.1, 38.1, 40.1 and 44.1 follows al-Barquqi's print, which has it at every one of them.
- **Where the reciter follows one edition against another** (9.1, 21.2, 29.1, 36.2, 38.1, 44), he follows al-Barquqi every time; the sharh gives al-Wahidi's or al-Ukbari's reading where the meaning changes (21, 36, 44). No word departs from every edition, so no note gives an editions' reading.
- **Meter decides:**
  - 8.1 «الغَمامُ الغُرُّ», as all three editions have it: the full transcript's «الغمائم» falls on a chunk boundary, and «سَقَتها الغَمائِمُ الغُرُّ» would break the second foot of the tawil;
  - 14.2 «آساسٌ» (al-Wahidi, al-Barquqi): al-Ukbari's print has «أَساسٌ», which turns the second foot («نُ آساسُن», u - - -) into u u - -, short where the meter needs a long syllable; al-Ukbari's own gloss gives «آساس» as the plural;
  - 25.1 «جَناحَيهِم» with a silent mim, 17.2 «ثِيابُهُمُ» and 29.1 «نَثَرتَهُمُ» with a long one, 41.2 «وَإِنِّيَ» (al-Barquqi), 46.1 «وَلِم» (al-Barquqi: «لِمَ» with its mim silenced for the meter);
  - 6.1 «مَخالِبٍ», 15.1 «حَواكِمٌ», 40.1 «عَدنانٌ» and «رَبيعَةٌ»: diptotes given tanwin, which the meter needs (without it 40.1's second foot falls apart, and 6.1, 15.1 and 40.1 end their sadr on a short syllable); al-Barquqi prints the tanwin on all four (al-Ukbari on 15.1 and 40.1; his 6.1 is too faint to read), and the notes say so;
  - 12.1 «اللَّيالي» with its accusative ya silent, which al-Barquqi notes as a licence;
  - 41.2 «فَإِنَّكَ مُعطيهِ» scans with the second foot مفاعيلُ (kaff), as in all three editions; every other half scans normally (`scan_tawil.py`, a tawil wrapper of /tmp/shw/b3/tools/scan.py that also teaches it the hidden alifs of ذلك, لكنّ, لله and الرحمن, short أنا and the long mim of هُمُ).
- **Long vowels not taken from the transcripts** (the reciter stretches short syllables, and every edition and the meter agree on the short one). The clip transcripts hear 3.2 «عاجزت» for «عَجَزَت», 7.1 «الحادث» for «الحَدَثُ», 10.1 «وكانا» for «وَكانَ», 11.1 «طريذات» for «طَريدَةُ», 17.1 «بارقوا» for «بَرَقوا», 23.1 «كالما» for «كَلمى», 28.1 «طالب» for «طَلَبَ» (the «الجليلا» after it confirms the accusative object of a verb), 30.2 «كاثرت» for «كَثُرَت», 32.1 «زالقت» for «زَلِقَت» and 37.1 «المشرفيات» for «المَشرَفِيَّةِ»; the full transcript also has 24.1 «الشجاعات» and 43.2 «واقعت», which the clips hear short. At 7.1 the meter would allow «الحادِثُ», but the place is al-Hadath in every source, and the reciter stretches short syllables the same way all through.

## Ear check

- **Alignment:** `scripts/align.py` flagged 20 weak words (`align.txt`), all short (من, كلّ, به, بي, منه, ما, أن, عليه), plus 6.1 «بغير», 43.1 «برجله», 41.2 «وإنّيَ», 38.2 «ولكنّ» and 18.2 «أذن» (ذ, which the aligner writes as "th"); the weakest is 46.1 «ما» (0.08) in the first saying of the last bayt. Every half's timing sits in the reciter's steady rhythm of about 3.6 s a half.
- **`scripts/verify.py`** (cohere): 12 of 94 clips differ from the text, 21 of 473 words. Each difference is the transcriber's:
  - **a stretched vowel or tanwin heard as letters:** 11.1 «طريذات», 15.1 «حواكمها», 19.2 «الحداثه», 25.1 «ضمتا», 37.1 «المشرفيات», 38.1 «جهالته»;
  - **words run together or split:** 33.1 «ذد مستوق», 41.2 «فانا كمعطيه», 29.1 «الاحيد بكله» (with «كان», the first sound of 29.2 «كما»);
  - **misheard:** 29.1 «ونفرتاهم», 36.1 «الظبع», 46.1 «وقع»;
  - **16.2:** the clip came back empty (the model began repeating itself and the tool kept nothing); the full transcript hears «سروا بجياد ما لهن قوائم», and the aligner's confidence on its five words is 0.44–1.00.
  - **22.1** starts with «إن», though the clip starts 0.46 s after 21.2 ends; the clip's timing matches the aligner's, and «إن» is not in the full transcript, which runs «…من لا يصادم وقفت وما في الموت».
- **The second transcriber** (audar, on the same 94 clips; `media/work/01v6T9wghjw/audar/`) hears 16.2 «وسري بجياد ما لهن قوايم» and 22.1 without «إن», which settles both. It is noisier than cohere (27 clips differ, 52 of 473 words), and every one of its differences is its own: a dropped rhyme letter (13.2 «الجواز», 20.2 «ضبار»), split or run-together words (17.2 «فيا ابوهم», 25.1 «ضم امتاج ناحيهم», 41.1 «ليلفظه», 42.2 «ان تنادم», 46.2 «العذاب كدايم»), stretched vowels (9.1 «والقناه», 30.1 «الذره», 38.1 «جهالات») and mishearings (12.2 «وهم», 31.1 «الفضخ انا كثرتها», 34.1 «اينك»), each heard as the text by cohere. Where both transcribers depart from the text the same way (11.1, 29.1, 37.1, 38.1, 41.2, and 46.1 «وقع» for the stretched «وَقى»), it is a stretched vowel or a split word, as above.
- **Both sayings of bayt 46** (clips 090–093) are heard in full by both transcribers, which confirms the repeat.
- **8.1** is heard as «سقتها الغمام الغر قبل نزوله», as the text has it.

## Commentary drawn on

- **The sharh and notes** follow al-Wahidi and al-Ukbari throughout, with al-Barquqi's notes for the glosses and the grammar (5 «نسور» as badal, 10 «مثلُ» as the subject of كان, 12 the two objects of «تفيت», 39 «التوحيد» and «هازم» as two predicates of لكنّ, 45 «أنّك سالم» as the subject of «هنيئًا», 46 «لِمْ» shortened for the meter and «ما» of duration).
- **Other readings and remarks the sharh reports, with whose they are:** al-Wahidi on «البحور الخضارم» (3), on 6's second sense, on 18's al-Jawza', on 37 (understanding by inference), and his story of Sayf al-Dawla's objection to 22–23 and the poet's answer (also in al-Ukbari and al-Barquqi); al-Ukbari on «جيف» for «جثث» (10), the story of «أخذنه» that he takes from Ibn al-Qatta' (12), «تورية» (13), the two senses of «القوائم» (6, 16), the turbans (17), the gender of «نار» (20), «فقطّع» (21), 29 as one of the poet's best, the proverb «السلامة إحدى الغنيمتين» (38) and «بك» for «به» (40); Ibn Jinni (as al-Wahidi and al-Ukbari quote him) on 24 and 26; Ibn Furraja on 26; Ibn al-Iflili's reading of 31 (in al-Ukbari and al-Barquqi) and his list of the army's peoples (19).
- **The occasion** comes from al-Ukbari's note on bayt 1, al-Barquqi's note 162 and Ibn al-Iflili: al-Hadath surrendered to the Domestic in 337; Sayf al-Dawla came on Wednesday 18 Jumada II 343, laid the foundations with his own hand; the Domestic attacked with some 50,000 men; the battle on Monday, the last day of Jumada II, from morning to afternoon; the prince's charge with about 500 of his guard; the last battlement laid on 13 Rajab, the day the poem was recited.
- **Checked against the histories:**
  - Ibn al-Athir, *al-Kamil*, vol. 7, p. 209 (shamela 21712/3940, `kamil.txt`), year 343: the Domestic's son Constantine killed in a raid of Sayf al-Dawla's in Rabi' I; the Domestic's army of Byzantines, Rus, Bulgars and others; the battle at al-Hadath, the Byzantines routed, «وأسر صهر الدمستق وابن ابنته». He dates the battle to Sha'ban, the commentators to the end of Jumada II, so the intro and sharh give only the year. His account fits bayt 35 (son, son-in-law's son, son-in-law).
  - Yahya al-Antaki, *Ta'rikh*, pp. 84–85 (shamela 14512/78–79, `antaki.txt`): names the Domestic «الدومستيقس بردس الفوقاسي» (Bardas Phokas); puts Constantine's capture under 342, near Mar'ash, and his death in captivity at Aleppo; at al-Hadath the capture of «أعور حرم» (al-Ukbari's «تودس الأعور», the son-in-law) and the escape of Nikephoros son of Bardas through the conduit by night.
  - Ibn al-Adim, *Zubdat al-Halab*, p. 74 (shamela 9872/65, `zubda.txt`): «وقصده الدمستق بردس… وأسر صهر الدمستق على ابنته»; al-Dhahabi, *Ta'rikh al-Islam*, vol. 25, p. 127 (shamela 22771/8108, `dhahabi.txt`): the Domestic's army of Turks, Rus, Bulgars and Khazars (note on 14.1); al-Nuwayri, *Nihayat al-Arab*, vol. 26, p. 140 (shamela 10283/9997, `nuwayri.txt`): the Domestic wrecked al-Hadath in 337, and the dates of the rebuilding.
- **Places and names:** Yaqut, *Mu'jam al-Buldan*, vol. 2, pp. 227–228 (shamela 23735/758–759, `yaqut.txt`): al-Hadath between Malatya, Sumaysat and Mar'ash, called al-Hamra' for its red soil, its castle on the hill al-Uhaydib; al-Bakri, *Mu'jam ma Ista'jam*, vol. 1, p. 121 (shamela 11802/141): al-Uhaydib, «تصغير أحدب: جبل الحدث»; al-Idrisi, *Nuzhat al-Mushtaq*, vol. 1, p. 386 (shamela 11787/390): al-Khatt in Bahrain, which gives its name to the spears; al-Zirikli, *al-A'lam*, vol. 4, p. 303 (shamela 12286/3875): Sayf al-Dawla's name and dates (note on 3.1). The Rudayna of 27, the Masharif of 37, Adnan, Rabi'a and the Awasim of 40 are glossed as al-Ukbari and al-Barquqi gloss them.

## Review

The drafter read the draft again first, as no second-reader agent could be started then. A second reader then checked every half against al-Barquqi's and al-Ukbari's page images (the sadr endings and the disputed vowels zoomed in) and al-Wahidi's text, scanned every half, scored the 10.1 vowel and the tanwin at the sadr ends again, and checked the sharh, notes and intro against al-Wahidi, al-Ukbari, al-Barquqi, Ibn al-Iflili and the histories (2026-11-17). Fixed after the review:

- **Text:** no word or vowel changed; every vowel al-Barquqi's page images print is the text's, and the departures from al-Ukbari stand as recorded. 6.1 «مَخالِبٍ», a diptote given tanwin as al-Barquqi prints it, is now recorded with the other three; the tanwin at the sadr ends is recorded as following al-Barquqi, since the audio can't tell; 10.1 scored again on its own words (a 2.7 lean to the text).
- **Meaning:** 43, «على» belongs to «نادم» in 42, as al-Wahidi and al-Ukbari both say, not to «تعدو»; both languages rewritten.
- **Sharh:** 5 (why the longest-lived birds, after Ibn al-Iflili) and 30 (the pursuit into the remotest crags, after al-Ukbari) deepened to the range.
- **Notes:** 14.2 «آساسٌ» is the plural of «أُسّ», not of «أَساس»; 6.1 «مَخالِبٍ» notes its tanwin; the heads of 23.1 «كَليم» and 43.2 «مِسمَع» without an article the verse word lacks.
- **English:** 19.2, the interpreters make the talkers understand one another (أفهم), not "understood"; the note on 20.1 «الغِشَّ» no longer repeats the sharh.
- **sources.md:** al-Ukbari's print is partly voweled, not fully, and `ukbari-verses.txt` fills its gaps from al-Barquqi; the meter fault of al-Ukbari's 14.2 «أَساسٌ» described correctly (a short syllable where a long one is needed, not a syllable short).
