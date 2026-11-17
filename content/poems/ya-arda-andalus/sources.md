# يا أَرضَ أَندَلُسَ الخَضراءَ حَيّينا

## Recording

- أسامة الواعظ, uploaded by the channel الحارث: https://www.youtube.com/watch?v=xsM1deqwsI8 (uploaded 2022-11-12, 20:31), «يا أرض أندلس الخضراء حيينا، رثاء الأندلس للوليد بن طعمة، بصوت: أسامة الواعظ». The description says some abyat were left out and flags bayt 121 («هذا لعمري لسخط الله أو غضب…») as unsound; the bayt is recited, so it is shown.
- **Audio:** kept 0.4–1228.1 s of the download (the silence before the first word and after the last cut), gain −5.9 dB, giving −20.1 LUFS with a peak of −6.2 dBTP.
- **Abyat recited:** 127, in order, none repeated: the first 127 of the 131 on the poetry sites. He leaves out the last four, an appeal to the Prophet («فما لنا قوةٌ إلا بسيّدنا…» to «…متى نرى السيف مسلولاً ليشفينا»).

## Text

- **No printed edition was found.** Al-Zirikli lists the poet's collections (`alam.txt`), but none of them is on shamela or archive.org, and none names this poem.
- **The poetry sites:** Qafiyah (qafiyah.com/poems/MtIT, `qafiyah.txt`, 131 abyat) and PoetsGate (poetsgate.com, poem 55207, `poetsgate.txt`) give the same text letter for letter, lightly voweled; al-Diwan (aldiwan.net, poem 35649) blocks fetching. They evidently share one source. The text here is theirs, voweled throughout in the house style, with the readings below.
- **The recording** is the second witness: where it and the sites differ, the text follows the recording.

`abyat_in_full` is 131, the sites' count.

## Readings and vowelling

| Bayt | Text | Other reading | Evidence |
| --- | --- | --- | --- |
| 6.2 | حُشاشَةٌ | حُشاشاتٌ (sites) | all three transcripts hear «حشاشة»; the aligner can't hear the length (0.0); this reciter's slips run the other way, short heard as long |
| 64.2 | فَتَبنينا | فتنبينا (sites) | −9.3 for «فَتُنبينا»; transcript «فتبنينا» |
| 116.2 | وَلا شَهِدنا | لا شهدنا (sites) | the meter needs «و» and the transcript has it |
| 57.1 | العاني (sites) | العالي (transcript) | −2.4 |
| 73.1 | افتَقِد (sites) | تَفَقَّد | −11.2 |
| 92.2 | عَلى العِزِّ (sites) | مَعَ العِزِّ | +0.3, a coin toss |
| 4.1 | شَقوَتِنا (sites) | شِقوَتِنا | −5.9; the second transcriber hears «شَقْوَتِنَا» |
| 10.1 | نَشَقَتنا (sites) | نَشِقَتنا | −4.7 |
| 36.2 | بَرناتَ | بِرناتَ; بُرتاتَ | −6.4; −10.3; the second transcriber hears «بَرْنَاتَ» (the sites leave it bare) |
| 43.2, 68.1, 109.2 | العَرَب | العُرب | −4.5; −6.2 (the sites leave it bare; «العُرب» breaks the second foot) |
| 51.1 | ذَبَلتَ | ذَبُلتَ; ذَبَّلتَ (sites) | −5.0 for «ذَبُلتَ»; the aligner can't hear the sites' shadda, and the sense is "you withered" |
| 89.2 | بِها يُخشى | بِهِ (sites); يَخشى | −6.3; −4.3 |
| 108.1 | عُدوَتِنا | عِدوَتِنا | +0.5, a coin toss; both are said |
| 109.2 | المَروعينا (sites) | المُرَوَّعينا | the shadda adds a syllable the last foot can't take |

- **15.2 and 30.2:** the full transcript drops «والعلى حينا» and «وتعلينا» at chunk boundaries, and `variants.py` scores the shorter halves better, but it always favours fewer words. The aligner gives the words 0.72–0.96 confidence and the clips hear them. They stay.
- **Vowelling the sites' text needed choices the meter or the grammar settles:** 25.2 «ذُيولَ» (object; the sites print ذيولُ); 35.2 «سَراحينا» and 36.2 «شَواهينا» as accusatives, "like wolves", "like falcons"; 51.2 «وَإِنَّ ذِكراكَ» (the sites' «وإن» breaks the foot); 89.2 «وَلا سِلاحٌ» as printed; 115.1 «مَع» before a vowelless syllable. 85.2 «توفوا» is the poet turning on the French ("you have never given full measure"). 10.1 «نَشَقَتنا», as the sites print it: نَشَقَ is "to smell", used here for "to make smell". **Spelling against the sites:** 103.1 «القُربى» for their «القربي», 127.1 «بَعدَما» for «بعد ما».

## Ear check

- **Alignment:** 24 weak words in 127 abyat, all short particles; the weakest is 90.1 «إن» (0.09). The halves pass by ear.
- **`scripts/verify.py`:** 46 of 254 clips differ from the text, all the transcriber's except 6.2 (above):
  - **ـة heard as ـات or a stretched ending as a letter:** 34.2 «الفروسات», 41.1 «العمامات», 42.2 and 58.1 «الخليفات», 43.1 «الخلافات», 93.1 «مغربيات», 97.1 «السعادات», 102.1 «الاميرات», 22.1 «دمنان», 48.1 «اندلسه», 59.2 «امينه», 94.2 «والعينان», 121.1 «غضبه»;
  - **words run together or split:** 10.1 «لبدع انا شقتنا», 14.1 «واسبانيا تزدهرت», 31.2 «القنالينا», 47.1 «ماتلف», 59.1 «ما لما لات», 88.2 «لان صير», 90.2 «يا امالنا», 98.1 «ان تون», 99.1 «وات صباني», 114.1 «الفرنسي سب الوان», 124.1 «لطارق», 127.1 «بعد ما»;
  - **misheard words:** 26.1 «غفرنا», 26.2 «اللما», 33.1 «علي», 44.1 «دعوه», 49.2 «اطوال», 57.2 an extra «لا», 73.1 «مفتق الجنات», 77.1 «فلت», 78.1 «مسالاتنا», 96.2 «قال», 99.2 «ان», 103.2 «احصن», 116.1 «الاحداث», 122.1 «ثبتوا»;
  - **dropped words:** 10.2 «طيبا», 12.1 «تاقت الى», 117.1 «وا»; the second transcriber or the full transcript has each;
  - **100.1, 121.2, 127.2:** the clip transcriber failed or invented words («صوت المومنين»); the second transcriber hears «ومن دموعك هاتك السموط حكت», «من النبي على سهين لهين» and «خمر الحوانيت وامتصوا المداخين».
- **Edges:** 30.2 ends with the «نا» of «وتعلينا» heard into the next clip; 84.2 and 92.2 start with the last syllable of the half before.

## Commentary drawn on

- **No commentary on the poem exists that we found;** the sharh rests on the text, the lexicons and the history it names.
- **«براقيل»:** plural of بِرقيل, «الجلاهق يرمى به» (al-Shidyaq, *al-Jasus 'ala al-Qamus*, p. 303, shamela 3742/304), a pellet-bow or catapult; here the enemy's siege guns.
- **Quran:** 17 «ممرّد» (27:44); 33 «الملأ الأعلى» (37:8, 38:69); 79 «صياصي» (33:26); 85 full measure (7:85); 87 «جوس» (17:5); 92 the manna and quails (2:57, 7:160, 20:80), Zaqqum (37:62, 44:43, 56:52) and ghislin (69:36); 115 the guilty «زرقًا» (20:102).
- **Poems:** 22 «تنائينا» and 98–100 recall Ibn Zaydun's nuniyya «أضحى التنائي بديلًا من تدانينا», whose meter and rhyme this poem shares; 108 «عوادينا» recalls the opening of Shawqi's Andalusian ode in the same meter and rhyme, «يا نائح الطلح أشباهٌ عوادينا».
- **History:** the Umayyads of Cordoba (55), the Abbadids of Seville (56), Abd al-Rahman al-Nasir and Madinat al-Zahra' (64, 66), the Great Mosque of Cordoba (57–58), Yarmuk and Hattin (41), Tariq ibn Ziyad and Musa ibn Nusayr (124), Ibn Zaydun's nuniyya and Wallada (98–102). The present-day lines (76–127) name the French in Morocco, Algeria and Tunisia and a grief in Tripoli; the sharh does not date the poem beyond that.
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 2, pp. 9–10 (shamela 12286/956–958, `alam.txt`).

## Review

A second reader scanned every half, scored the doubtful vowels with `variants.py` and the second transcriber, and checked the sharh, notes, intro and bio against the sources (2026-11-17). Fixed after the review:

- **Text:** «العَرَب» for «العُرب» in 43.2, 68.1 and 109.2, and 109.2 «المَروعينا» for «المُرَوَّعينا», all for the meter; 4.1 «شَقوَتِنا», 36.2 «بَرناتَ» and 51.1 «ذَبَلتَ» by ear; 89.2 «بِها يُخشى», what the reciter says; the alif of wasl voweled in fourteen words.
- **Meaning:** 7 read as the land gone back to its first people; 20 «أبدعته» has «أيادينا» for subject; 82 «الجلّاد» the executioner; 85 the poet turning on the French; 96 «التأسّي» seeking comfort; 110 «مرّاكش» as Morocco; 119 without the compulsion the verse doesn't have; 8 and 9 corrected in the Arabic.
- **Sharh:** the English rewritten to say what each bayt means (median 9 words to 26), and the short Arabic sharh deepened (median 94 letters to 114); the wordplay in 29, 64, 86, 96, 98, 108, 117 and 124, the echoes of Ibn Zaydun (22) and Shawqi (108), and the Quran in 33, 79 and 115 added; notes no longer repeated in the sharh.
- **Notes:** the places and peoples of the last part (البرتغال, الفرنسيس, مرّاكش, الجزائر, طرابلس الغرب, تونس), «مغربيّة», «نونيّة», «تباكينا» and the reciter's «بها» added; heads and roots of 3.2, 6.2, 56.2, 110.2 and 127.2 corrected; 10.1 «نَشَقَتنا» explained; romanization put right.
- **Intro:** the poem's order kept, Tripoli's grief an old one renewed, both cut to four sentences.
- **Poet:** al-Zirikli quoted, not paraphrased; his birth name in the Arabic bio.
