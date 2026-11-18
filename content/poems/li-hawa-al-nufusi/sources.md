# لِهَوى النُّفوسِ سَريرَةٌ لا تُعلَمُ

## Recording

- أسامة الواعظ, on his own channel: https://www.youtube.com/watch?v=Nl1VF67p9aU (uploaded 2021-06-26, 4:48), «لهوى النفوس | قصيدة المتنبي | بصوت أسامة الواعظ». The description prints a voweled text of 28 abyat in his order, with al-Barquqi's readings throughout. Compared word by word with what he says, it differs in five halves, each settled by ear below (3.1 «بعارضي», 12.1 «الظلم» without و, 13.2 «عن غيه», 14.2 «مطروفة», 21.1 «وأرغت»), and it prints one bayt he does not say («يقلى مفارقة الأكف قذاله», the editions' 23).
- **The other upload,** https://www.youtube.com/watch?v=P6QOr3SdE_Q (channel استوديو القمة, the producer, uploaded 2020-03-27, 4:48), «لهوى النفوس - قصيدة للمتنبي بصوت: أسامة الواعظ», is the same recording. Compared on the two 16 kHz downloads (`_scratch/compare.py`): equal durations (287.77 and 287.76 s), the loudness envelopes correlate at 0.993 at one fixed offset of 0.08 s across the whole file, and the waveforms at 0.78–0.92 in every 5-second window (two encodes of one master); integrated loudness −11.0 and −10.9 LUFS (ffmpeg ebur128 on the downloads). The app audio and the `source` are the reciter's own upload, the one listed for this batch.
- **Audio:** kept 7.8–287.0 s of the download: cut the digital silence (0–6.5 s) and a soft «لهوى النفوس» (6.5–8.3 s, some 13–15 dB below the voice that follows), the first two words said once quietly, as a title, before the recitation proper starts with them again at full voice at 8.32 s; and kept the reverb tail after the last word up to the digital silence at 287.0 s. Both transcribers hear the quiet words in clips of 6.3–8.35 and 7.3–8.35 s («لهوى النفوس», «النفوس») and the full opening in 8.25–12.9 s, and run the two together in 6.3–12.9 s (`media/work/Nl1VF67p9aU/intro/`, `intro2/`). A timeline can't light two words of a half, so the title is cut rather than played as a repeat of 1.1. Gain −5.9 dB, giving −20 LUFS with a peak of −4.6 dBTP. The pauses sit near −40 dB (reverb or a faint bed); the aligner managed on the mix.
- **Abyat recited:** 27 of the 36, in the editions' order: their 1, 2, 4–13, 19, 21, 22, 24–27 and 29–36. He leaves out 3 («يرنو إليك مع العفاف»), 14–18 («يحمي ابن كيغلغ الطريق» … «واحذر مناواة الرجال»), 20 («يمشي بأربعة»), 23 («يقلي مفارقة الأكف») and 28 («أترى القيادة»): mostly the satire's obscenities. The recording has no cut in it: he simply goes on. The text is numbered 1–27 in his order; its 13 is the editions' 19, 14–15 are their 21–22, 16–19 their 24–27, and 20–27 their 29–36. The pronoun of 14.1 «وَجُفونُهُ» refers to Ibn Kayghalagh, named in the editions' 14, which he leaves out; the note on the word says so.
- He says the last bayt twice, and the timeline plays it twice; the second saying is softer (about −31 dB).

## Editions

- **al-Barquqi**, شرح ديوان المتنبي (Hindawi Foundation reset, Cairo, 2014): archive.org `20201020_20201020_1638`, leaves 1253–1254 = pp. 1254–1255 (the text, fully voweled), and his notes 695–729 on pp. 1441–1454 (leaves 1440–1453), read from the page images (the OCR of the notes, `barquqi-notes-ocr.txt`, only to find them). 36 abyat. Headed with al-Ukbari's account of the occasion, without its last clause on the meter. **Starting text**, put in the house style; the reciter departs from it in five places (below).
- **al-Ukbari (attributed)**, التبيان في شرح الديوان, ed. Mustafa al-Saqqa, Ibrahim al-Abyari and Abd al-Hafiz Shalabi (al-Babi al-Halabi, Cairo, 1936–38; reprinted by Dar al-Ma'rifa, Beirut), vol. 4, pp. 121–132, poem 249: archive.org `20240104_20240104_1855`, leaves 1325–1336, read from the page images (p. 125 is faint and was read with the contrast raised). Partly voweled, 36 abyat. The heading (p. 121): «وسار أبو الطيب من الرملة يريد أنطاكية في سنة ست وثلاثين، فنزل بطرابلس وبها إسحاق بن إبراهيم الأعور ابن كيغلغ، وكان جاهلا، وكان يجالسه ثلاثة نفر من بني حيدرة، وكان بينه وبين أبي الطيب عداوة قديمة، فقالوا له: أتحب أن يتجاوزك ولا يمدحك، وجعلوا يغرونه، فراسله أن يمدحه، فاحتج عليه بيمين لحقته لا يمدح أحدا إلى مدة، فعاقه عن طريقه ينتظر المدة، وأخذ عليه الطريق وضبطها، ومات النفر الثلاثة الذين كانوا يغرونه في مدة أربعين يوما، فهجاه أبو الطيب، وأملاها على من يثق به. فلما ذاب الثلج خرج كأنه يسير فرسه، وسار إلى دمشق، فأتبعه ابن كيغلغ خيلا ورجلا، فأعجزهم، وظهرت القصيدة. وهي من الكامل، والقافية من المتدارك». The commentary without the verses is shamela 6908/1249–1260 (`ukbari.txt`), which drops the heading.
- **al-Wahidi**, شرح ديوان المتنبي, ed. Friedrich Dieterici (Berlin, 1861): archive.org `carminacumcommen00muta`, leaves 561–555 = printed pp. 339–345 (this scan runs backwards: leaf = 900 − page), read from the page images. Voweled, 36 abyat (his 17 and 18 in the other order), headed «وقال يهجو اسحاق بن ابراهيم بن كيغلغ». Shamela 754/171–174 (`wahidi.txt`) is the same text unvoweled, with typos that are not readings: «المحبوس» for «المجوس», «أرعتك», «الولى», «من للأوان».
- **Ibn Jinni**, الفسر, ed. Rida Rajab (Dar al-Yanabi', Damascus, 2004), vol. 4, pp. 567–577, poem 251: archive.org `DO-alfasr`, file `alfasr3`, leaves 566–576, read from the page images. Voweled, 36 abyat, headed «وقال يهجو إسحاقَ بنَ ابراهيمَ بنَ كيغَلَغ، وقد عاقه عن الطريق»; the editor's notes give the long heading of his MS (د) (the same story, «سنة ستٍّ وثلاثين وثلاثمائة … فلمّا ذاب الثلج، وخفَّ عن لبنان»), the readings of MSS (ك) and (د), and the marginal remarks of «الوحيد».
- **al-Ma'arri**, اللامع العزيزي: shamela 29591/1274–1284, printed pp. 1282–1292 (`maarri.txt`, `maarri2.txt`). Notes on abyat 1–6, 8, 9, 11–13, 15, 16, 18, 19, 25, 31 and 34 (editions' numbering).
- **معجز أحمد** (attributed to al-Ma'arri): shamela 753/193–195 (`mujiz.txt`). Every bayt with a short commentary and the long heading.
- **al-Sahib ibn Abbad**, الأمثال السائرة من شعر المتنبي: shamela 37460/13–14, printed pp. 33–34 (`sahib.txt`): twelve abyat of the poem, every one of them in the recording.

`abyat_in_full` is 36, the count of al-Barquqi, al-Ukbari, al-Wahidi and al-Fasr.

**Attribution** is not in doubt: besides the four commentaries, Ibn Khallikan, *Wafayat al-A'yan*, vol. 5, p. 63 (shamela 1000/2061), says of Ishaq ibn Ibrahim ibn Kayghalagh that al-Mutanabbi «هجاه بقصيدته التي أولها: لهوى القلوب سريرة لا تعلم», and al-Sahib ibn Abbad, his contemporary, and Abu Sa'd al-Amidi (العميدي), *al-Ibana an Sariqat al-Mutanabbi*, p. 74 (shamela 37468/55: «قال المتنبي: لهوى القلوب سريرةٌ لا تُعْلمُ»), quote it as his.

**Title:** the books cite the poem by its opening (Ibn Khallikan: «بقصيدته التي أولها»), not by a name, so the title is the first sadr as he says it.

`scripts/collate.py` against the text (`collate/`; the shamela witnesses as printed, the page-image editions as read): al-Barquqi differs at 3.1, 12.1, 13.2, 14.2 and 21.1; al-Ukbari at 3.1, 13.2, 14.2 and 21.1; al-Wahidi at 1.1, 3.1, 12.1, 13.2, 14.2 and 21.1; al-Fasr at 1.1, 3.1, 3.2, 4.2, 9.1, 12.1, 14.2 and 21.1. The shamela texts add nothing beyond the readings below and their own typos (al-Lami' «رق» for «أرق» and «نبذواة»; معجز أحمد «يحترم» and «والظم»).

## Readings settled by ear

Scores are `scripts/variants.py`'s scoring on the app audio, run in three batches with one model load each (`/home/alifadel/.cache/shw-tmp/b4/tools/vbatch.py`; specs, tests and output in `media/research/li-hawa-al-nufusi/`, `specs1–3.txt`, `variants1–3.txt`). The gap is the other reading's score against the text's; every pair has the same number of words. Where a half and a narrower span were both scored, both are given.

| Half | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 1.1 | النُّفوسِ (al-Barquqi, al-Ukbari) | القُلوبِ (al-Wahidi, al-Fasr, al-Lami', معجز أحمد; al-Barquqi's «يروى») | −24.1; −21.2 on the first two words |
| 3.1 | بِمَفرِقي (no edition) | بِعارِضي (every edition) | −19.6; −14.0 on the last two words |
| 3.1 | رائِعَةُ (al-Barquqi, al-Ukbari, al-Wahidi, al-Fasr's text, معجز أحمد) | راعِيَةُ (al-Lami'; al-Fasr's MSS ك and د; Ibn Jinni's reading as al-Wahidi reports it) | +1.0 |
| 3.2 | الأُولى (al-Barquqi, al-Ukbari, al-Wahidi, معجز أحمد) | الأُخرى (al-Fasr) | −12.0; −6.0 on two words |
| 4.2 | فَالشَّيبُ (all but al-Fasr) | وَالشَّيبُ (al-Fasr) | −2.3; −3.6 on two words |
| 8.2 | يولى (al-Barquqi, al-Ukbari, al-Wahidi, al-Fasr, al-Sahib) | يولي (معجز أحمد: «يولي: أي يعطي») | +2.75 on the half; −2.0 on two words; −4.6 on the word |
| 9.1 | يَخدَعَنَّكَ (al-Barquqi, al-Ukbari, al-Wahidi) | تَخدَعَنَّكَ (al-Fasr, معجز أحمد, al-Sahib) | −5.2 on two words |
| 9.1 | مِن عَدُوٍّ (all but al-Fasr) | عَن عَدُوٍّ (al-Fasr) | −11.4 on the half (with the two readings below); −3.9 on two words |
| 9.1 | دَمعُهُ (al-Barquqi, al-Ukbari, al-Wahidi, al-Fasr) | دَمعَةٌ (معجز أحمد; al-Sahib, with «مِن عَدُوِّكَ») | −4.8 on three words |
| 11.2 | كَما (all but al-Sahib) | كَمَن (al-Sahib) | −4.6 on three words |
| 12.1 | وَالظُّلمُ مِن شِيَمِ (al-Ukbari, al-Sahib) | الظُّلمُ مِن شِيَمِ (al-Barquqi); وَالظُّلمُ في خَلقِ (al-Wahidi, al-Fasr, al-Lami', معجز أحمد; al-Barquqi's «يروى») | +2.9 (+2.6 on two words) for the shorter reading, see below; −30.4 |
| 13.2 | عَن جَهلِهِ (al-Fasr, al-Lami', معجز أحمد; al-Barquqi's «يروى») | عَن غَيِّهِ (al-Barquqi, al-Ukbari, al-Wahidi, al-Sahib) | −16.0; −4.4 on two words |
| 14.2 | مَطروقَةٌ (no edition) | مَطروفَةٌ (every edition) | −7.2; −5.1 on two words; −2.5 on the word |
| 21.1 | وَأَرَدتَ (no edition) | وَأَرَغتَ (every edition) | −15.3; −7.3 on two words; −6.3 on the word |
| 21.1 | ما لِأَبي (every edition) | مالَ أَبي (how a transcriber split it) | +0.2 on the half; −3.4 on two words |
| 24.2 | المُعلِمُ (al-Barquqi) | المُعلَمُ | −2.4; −1.8 on the word |
| 26.1 | مُشَيَّعٌ (al-Barquqi, al-Ukbari, al-Fasr) | مُشَيِّعٌ (al-Fasr's MSS ك and د) | −1.4 |
| 26.2 | مُصَمِّمُ (al-Barquqi) | مُصَمَّمُ | +5.2 on two words; +2.8 on the word, see below |

- **3.1 «بِمَفرِقي», 14.2 «مَطروقَةٌ», 21.1 «وَأَرَدتَ»:** he departs from every edition, and the text follows him. Both transcribers hear all three (`clips.txt`: «بمفرق» / «بمفرقة»; «مطروقة» twice; «وَأَرَدْتَ» / «وأردت»), and so does the full-recording transcript. Controls in the same recording show that the aligner tells ف from ق (the true letter leads by 6.0 in 26.1 «وَالفُؤادُ» against «وَالقُؤادُ», by 6.75 in 25.1 «القَناةَ» against «الفَناةَ» and by 6.7 in 15.2 «يُقَهقِهُ» against «يُفَهفِهُ») and hears a real د (22.2 «تَدنو» leads «تَغنو» by 10.8), but leans to د where غ is real (2.1 «الوَغى» trails «الوَدى» by 1.3), so for 21.1 the transcribers carry most of the weight. Each word has a note giving the editions' reading and its meaning. The two glosses agree in sense with the editions: «أرغت» is «طلبت وأردت» in Ibn Jinni's gloss (al-Fasr, p. 575), and «مطروقة», struck, is close to «مطروفة», struck in the eye.
- **12.1 «وَالظُّلمُ»:** the half-length score leans 2.9 to the shorter text without و, but that is the aligner's bias towards fewer letters. The voice starts at 110.0 s, 0.2 s before the aligner first placed «الظُّلمُ»; clips cut wide around it (109.45–115.0, 107.0–115.0 and 109.6–112.2 s of the app audio, `media/work/Nl1VF67p9aU/wide/`) are heard as «والظلم من شيم» by both transcribers, all six times. That is al-Ukbari's text (p. 125, read with the contrast raised), and al-Sahib's.
- **8.2 «يولى»:** a coin toss (the half favours «يولي» by 2.75, the word alone «يولى» by 4.6; the controls 8.2 «يَنسى» and 7.1 «يَشقى» score the right final vowel by 1.9 and 4.4). Cohere hears «يُولِي», audar «يولى». The text keeps the passive of every edition but one, which is also the sense the commentaries give: the freed captive forgets what was done for him (al-Wahidi: «ينسى ما أُزِلَّ إليه من الإحسان»).
- **26.2 «مُصَمِّمُ»:** the fatha scores better (5.2 on two words, 2.8 on the word), but the controls show the aligner leans to a fatha before the rhyme mim: where every edition has a kasra it scores 16.2 «وَيُقسِمُ» +2.0, 15.2 «تَلطِمُ» −0.6 and 12.2 «يَظلِمُ» −2.3, against +3.5 to +4.9 where the fatha is certain (3.2 «الأَسحَمُ», 27.2 «أَعجَمُ», 23.2 «عَرَمرَمُ»). The text keeps al-Barquqi's «مُصَمِّمُ», the participle of «صمّم السيف» (*Lisan*, vol. 12, p. 347: «إذا أصاب العظم فأنفذ الضريبة: قد صمّم، فهو مُصمِّم»).
- **3.1 «رائِعَةُ», 26.1 «مُشَيَّعٌ», 24.2 «المُعلِمُ»:** coin tosses or leans; the text keeps al-Barquqi (and *Lisan*: «والمُشَيَّعُ: الشجاع», vol. 8, p. 189; «وأعلم الفارس: جعل لنفسه علامة الشجعان، فهو مُعْلِم», vol. 12, p. 419).
- **The aligner's blind spot for ذ:** 13.1 «عَذلُ» scores 7.9 below «عَدلُ», and both transcribers write «عدل». Where ذ is certain the aligner does the same (17.1 «وَالذُّلُّ» −7.4, 7.1 «ذو» −8.0, 17.1 «الذَّليلِ» −8.9), so the text keeps «عَذلُ», blame, as every edition has it.
- **6.1 «يَختَرِمُ»:** both transcribers write «يغترم»; the aligner prefers خ by 3.0, and every edition has it.
- **2.2 «لَأَخوكِ»:** both transcribers hear «قال أخوك». «قالَ أَخوكِ ثَمَّ» (– u – u –) is no foot of the kamil; «لَأَخوكِ ثَمَّ» (u u – u –) is.
- **Tanwin and case endings that no edition disputes** were not scored: the aligner can't hear tanwin, and the text follows al-Barquqi's print.

## Meter

Kamil (الكامل), full: three feet a half, مُتَفاعِلُن (u u – u –) or مُتْفاعِلُن (– – u –), the last foot of every half whole; al-Ukbari's heading: «وهي من الكامل، والقافية من المتدارك». The rhyme is م with a damma (أَسلَمُ، أَرحَمُ), the rawiy م. Scanned by hand:

- 1.1 لِهَوى النْ / نُفوسِ سَري / رَتُن لا تُعلَمو: u u – u – | u u – u – | – – u –
- 17.2 وَأَوَدْ / دُ مِنهُ لِمَن / يَوَدْ / دُ الأَرقَمو: wa-a-wad-du-min | hu-li-man-ya-wad | dul-ar-qa-mū: u u – u – | u u – u – | – – u –

Every half was scanned with `/home/alifadel/.cache/shw-tmp/b4/tools/scan.py`. It flags only 15.2 «قِردٌ يُقَهقِهُ أَو عَجوزٌ تَلطِمُ», reading the root ه of «يُقَهقِهُ» as a pronoun the poet may lengthen; by hand it scans qir-dun-yu-qah | qi-hu-aw-ʿa-jū | zun-tal-ṭi-mū, – – u – | u u – u – | – – u –, a regular half.

The meter decides:
- 3.2 «وَلَوَ اَنَّها»: the hamza of «أَنَّ» is dropped and its fatha moved onto the waw of «لو» (wa-la-wan-na-hal, u u – u –), as al-Barquqi prints it («وَلَوَ انَّهَا»); with the hamza the first foot would be u – – u –. The note on it says so.
- 23.1 and 23.2 «وَهوَ» with a silent ه (wah-wa), as al-Barquqi prints «وَهْوَ».
- 25.2 «مِنهُمُ»: the plural mim voiced and long at the rhyme, as in al-Barquqi («مِنْهُمُ»).

## Ear check

- **Alignment:** `scripts/align.py` (under `heavy --mem 9G`; `align.txt`) flagged two weak words, 9.1 and 9.2 «عَدُوٍّ» (0.34 and 0.33), short words in a steady stretch. The halves run evenly at about 4.4 s each.
- **Timeline edits:** four entries started in the pause after the half before, where the voice is silent, so they would have lit early: 19.1 (179.26 → 179.76 s), 21.1 (198.98 → 199.50), 27.1 (258.54 → 258.98) and the repeat of 27.1 (268.44 → 269.08); each now starts about 0.05 s before the voice comes back (`_scratch/joins.py`, `_scratch/early.py`). The halves before them now end where the voice does: 18.2 179.30, 20.2 199.06, 26.2 258.58, 27.2 268.50. Between a sadr and its ajuz he does not pause; the app holds a half lit until the next starts, so the 0.5 s the aligner leaves between them is not dark.
- **`scripts/verify.py`** (cohere, on the final timeline; `verify.txt`): 9 of 56 clips differ from the text, 18 of 276 words. Each difference is the transcriber's:
  - **2.2** «قال أخوك», ruled out by the meter (above);
  - **5.2** «ضيق قيميت» for «يَقَقاً يُميتُ»; audar hears «لا يققى يميت»;
  - **6.1** «يغترم», 13.1 «عدل»: above;
  - **8.2** «ولا ينسي الذي يولي وعافيا دمون»: «ولا» at the clip's start is not in the full transcript («…فمطلق ينسى الذي يولي وعافي يندم») or audar's; «وعافيا» is the tanwin of «وَعافٍ» heard as a letter, «دمون» the stretched rhyme; audar hears «ينسى الذي يولى وعافى يندم»;
  - **9.1** «لفضيلة الدكتور محمد راتب النابلسي»: pure hallucination, a credit; audar hears «لا يخدعنك من عدو دمعه»;
  - **11.2** «وي الامور» for the stretched «وَيَلؤُمُ»; audar hears «ويلؤم»;
  - **21.1** «مالابي»: «ما لِأَبي» run together (above);
  - **25.2** «وثنافقا ومها»: «وَثَنى فَقَوَّمَها» split in the wrong places; audar «وثنا فقه ومغاب آخر».
- **The second transcriber** (audar, on the same 56 clips; `media/work/Nl1VF67p9aU/audar/`, both side by side in `clips.txt`) hears every half as the text apart from its own slips: stretched endings («تلثمون», «ينعمون», «ترحمون», «أعجمون», «حصر»), 1.2 «وعرض النضارة», 2.1 «الوضع», 3.1 «راعت كرائعة», 3.2 «الأسماء», 4.1 «سفارة», 23.2 «واه وعرمرم», 25.1 «أطرى», 26.2 «أسمى», 27.1 «ما انتلد».
- **The skipped bayt:** the full transcript runs «…أو عجوز تلطم وتراه أصغر ما تراه…», and the aligner placed 15.2 and 16.1 back to back with no weak word, so «يقلي مفارقة الأكف قذاله» is not said.
- **The repeat:** both sayings of bayt 27 are heard in full by both transcribers (clips 052–055).

## Commentary drawn on

- **The occasion** (intro): al-Ukbari's heading (vol. 4, p. 121), the same in al-Barquqi (p. 1254), معجز أحمد (p. 193) and al-Fasr's MS (د) (p. 567 n. 1). The intro gives the year as 336 AH, as they do.
- **The sharh** follows al-Wahidi throughout (Dieterici pp. 339–345), with al-Ukbari, Ibn Jinni (al-Fasr), al-Ma'arri (al-Lami'), معجز أحمد and al-Barquqi's notes where they add to him or differ:
  - **1:** Ibn Jinni, «يعرِّضُ في هذا بما يذكره بعدُ، وعليه بناءُ القصيدة» (al-Fasr, p. 567; al-Ukbari, p. 121, «وعليه بنى القصيدة»), given in the sharh without quotation marks.
  - **2:** al-'Arudi's and Ibn Furraja's reading, as al-Wahidi reports them (p. 340), and al-Ma'arri's (p. 1282: «وصف أخا المرأة بالشجاعة، وذكر أنه على قتله الناس أرق من أخته قلبًا»); Ibn Jinni's «يرميه بأخته وبالأُبنة» (al-Fasr, p. 568), which al-Wahidi answers («وإنما أتى هذا من البيت الثاني») and al-Ma'arri rejects («وذهب بعض الناس إلى أن هذين البيتين كالتعريض بابن كيغلغ، وليس الأمر كذلك»); al-Zawzani rejects it too (*Qishr al-Fasr*, vol. 2, pp. 332–333, shamela 37491/327–328). The sharh names the slur only as «التعريض بالمهجوّ».
  - **3:** al-Wahidi (p. 341), «فلا تراعي بالبياض لأنه كالسواد»; al-Ma'arri (p. 1283) on why grey hair is disliked.
  - **4:** al-Ma'arri (p. 1283), «لأنه ظلمني وجاءني في غير أوانه». **5:** al-Ma'arri (p. 1285), «وهذا نهي للإنسان عن كراهة الشيب؛ إذ كان هو والشباب مثلين». **6:** al-Barquqi, note 700 (p. 1445), «يشير إلى علة مشيبه، وأن الهم هو الذي أشابه».
  - **7:** al-Wahidi (p. 341) and al-Buhturi's half «أرى الحلم بؤسا في المعيشة للفتى». **8:** al-Wahidi (pp. 341–342); Ibn Jinni (al-Fasr, p. 569), «فالندمُ على فعل الجميل غيرُ مستحسَن». **9:** al-Wahidi (p. 342).
  - **10:** al-Wahidi (p. 342); Ibn Jinni (al-Fasr, p. 570): «أشهدُ بالله، لو لم يقلِ المتنبي غيرَ هذا البيت لوجب أن يتقدَّم به كثيرًا من المُحْدَثين» (al-Ukbari, p. 125, and al-Barquqi, note 704, quote other wording: «لكان أشعر المجيدين» and «لكان أشعر الشعراء المجيدين»). The English renders المحدثين «the modern poets».
  - **11:** al-Wahidi (p. 342); «مَن» as the object of «يؤذي», معجز أحمد (p. 194); the subject of «يقلّ … ويلؤم», al-Barquqi, note 705 (p. 1446). **12:** al-Ma'arri (pp. 1287–1288). **13:** al-Ukbari (p. 127).
  - **14:** al-Wahidi (p. 343), «يريد أنه أبدا يحرك جفونه يستدعي العلوج»; معجز أحمد (p. 195), «أشار بهذا إلى أن في عينه آفة»; al-Ukbari (p. 128) on «فُتّ» joined to «مطروفة».
  - **15:** al-Wahidi (p. 343); Ibn al-Shajari's «أو للإباحة» as al-Ukbari quotes him (p. 128). **16:** al-Wahidi (p. 343), «أراد وأكذب ما يكون مقسما فوضع المضارع موضع الحال وزاد واوا»; Ibn al-Shajari (al-Ukbari, pp. 129–130), «أخطب ما يكون الأمير قائما».
  - **17:** al-Wahidi (pp. 343–344), Sudayf; al-Barquqi, note 718 (p. 1452), for «أودّ» and «يودّ». **18:** Ibn Jinni (al-Fasr, pp. 573–574) and al-Wahidi (p. 344), Salih ibn Abd al-Quddus.
  - **19:** Ibn Jinni (al-Fasr, p. 574), «صفراءُ اسم أمّه، أي: هي على ما بها في دون حالك، فكيف يتّجه لي مدحك». **20:** al-Wahidi (p. 344), «وعني بالأنجم أبيات شعره».
  - **21:** al-Wahidi (p. 344); Ibn Jinni (al-Fasr, p. 575) on «أرغت» and «خالصًا». **22:** al-Wahidi (p. 344), Jarir; al-Barquqi, note 724 (p. 1454). **23:** Ibn Jinni (al-Fasr, p. 575), «وهو مكرَّم، أي: المالُ مكرَّم، أي: كثيرٌ يُضَنُّ بمثله»; al-Ukbari (p. 131) for the second reading.
  - **24:** al-Ukbari (p. 131), Abu Tammam. **25:** al-Wahidi (p. 344), «فثقّفها بذلك»; al-Barquqi, note 727 (p. 1454). **26:** al-Barquqi, note 728 (p. 1454). **27:** al-Wahidi (pp. 344–345), «والأعاجم عند العرب لئام»; al-Barquqi, note 729 (p. 1454), «وإنما قال ذلك لأن هذا الرجل كان روميًّا».
- **Glosses:** al-Ukbari's «الغريب» (عرضا، معتنق الفوارس، الوغى، ثمّ، الأسحم، العارض، سفرت، التلثم، يقق، يخترم، الجسيم، النحافة، الهرم، الشقاوة، الحفاظ، عاف، القليل، اللئام، الشيم، الأرقم، الأخدعان، العرمرم، الكماة، المأزق، المعلم، الأزهر، المشيع، المصمم); al-Barquqi's notes (السريرة، خلت، الناصية، يعصم، نبذ، أولاه، أراق، العلة، العذل، يرعوي، الغي، الحصرم، لشدّ ما، الوجء، أطر، الفعال); al-Wahidi's (رائعة البياض، المطلق من الإسار، صفراء، الأنجم، الإراغة، النهم، الأعاجم); Ibn Jinni's (شدّ ما، خالصًا، مكرَّم); معجز أحمد's (ترحم = ترحمه، يولي، صفراء اسم امرأته). From *Lisan al-Arab*: «مَفرِق» (vol. 10, p. 301, shamela 1687/4970), «الطَّرق: الضرب» (vol. 10, p. 215, 1687/4885), «مطروفة» (vol. 9, p. 215, 1687/4522), «المشيَّع» (vol. 8, p. 189, 1687/4037), «مُصمِّم» (vol. 12, p. 347, 1687/6260), «مُعلِم» (vol. 12, p. 419, 1687/6332), «الزعم» (vol. 12, p. 267, 1687/6180).
- **Abu al-Asha'ir:** his name from al-Wahidi's heading to «أتراها لكثرة العشاق» (shamela 754/175: «وقال يمدح أبا العشائر الحسين بن علي بن الحسين بن حمدان»); the remark that the poet was on his way to him is a marginal note of al-Fasr's MS (ك), which the editor prints (p. 574, n. 9: «فإليه كان قاصدًا لمّا منعه ابن كيغلغ من الوفود»), and the note says so; that margin names him «الحسن بن علي بن الحسن بن حمدان», where al-Wahidi has al-Husayn, and the note follows al-Wahidi.
- **The intro's last sentence:** al-Sahib ibn Abbad, pp. 33–34 (twelve abyat), and Ibn Jinni on bayt 10 (above).

## Review

Checked by the drafter, 2026-11-18: every recited half against al-Barquqi's, al-Ukbari's, al-Wahidi's (Dieterici) and al-Fasr's page images and the shamela texts of al-Lami', معجز أحمد and al-Sahib (`collate/`), and against the reciter's own description; the four departures and every disputed reading scored on the audio with same-length candidates and controls, and heard by two transcribers; every half scanned (`scan.py`) and the flagged one by hand; the cut (start and end levels, and the quiet title before the first half transcribed by both models) and every join of the timeline against the voice's level; each sharh and note against the commentary it cites, each quotation against its page image or shamela page, and each gloss against the edition's note or *Lisan*; the al-Barquqi notes used (695–729) read on the page images, not the OCR. Fixed in that pass: the text's 12.1 (the و he says, first missed because the clips start after it), 24.2 «المُعلِمُ» (first written with a fatha; al-Barquqi prints a kasra), four early starts in the timeline, the note addresses in 2.1, 5.1, 8.1 and 23.1, an unvoweled Arabic exclamation in 20.1's note, Ibn Jinni's verdict moved out of the intro's quotation into the sharh of 10, and the English sharh tightened to the library's length.
