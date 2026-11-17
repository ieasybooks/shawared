# مَقصورَةُ اِبنِ دُرَيدٍ

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=ABhIY5g4Qxs (uploaded 2026-03-20, 24:40), «مقصورة ابن دريد | إلقاء: أسامة الواعظ». The description credits the language check to حسين السادة and the explanation of the abyat to الشيخ أحمد سالم بن مقام الشنقيطي, "from al-Harbi's «مفاتح المقصورة»", and links the full text as a Google Doc (`gdoc.txt`, `gdoc-poem.txt`). The recording itself is recitation only: no spoken explanation between the abyat, no introduction (the transcript is the poem from the first second to the last).
- **Audio:** kept 13.0–1478.0 s of the download (cut 0.5 s before the first word, after 13.5 s of silence, and just after the last word), gain −7 dB, giving −20 LUFS with a peak of −5.6 dBTP. The voice never drops to silence between halves (the quietest frames are about −34 dB, the voice about −19.5 dB), so nothing inside the poem was cut.
- **Abyat recited:** 254, in order, none repeated or left out: the Google Doc's text, which is al-Harbi's. Against al-Lakhmi's 254 the recording lacks his 25 («وعدٌ لو كانت له الدنيا بما فيها فزالت عنه دنياه سوا», which al-Harbi gives in a note as an addition found in some transmissions, p. 42 n. 2) and has 224 («والشخص في الآل يُرى لناظرٍ»), which al-Lakhmi's editor gives only in a note, as found in some transmissions (p. 85 n. 3). The bayt numbers here are the recording's (al-Harbi's): al-Lakhmi's are one higher for 25–223.

## Editions

- **محمد بن أحمد بن هشام اللخمي (ت ٥٧٧هـ), الفوائد المحصورة في شرح المقصورة**, ed. Ahmad Abd al-Ghafur Attar (Dar Maktabat al-Hayat, Beirut, 1st ed.): scan archive.org `1765pdf_201912` (OCR `ghiloufik_gmail_20160830`). The editor prints the whole poem, voweled and numbered, on pp. 76–87 (leaves 75–86, read as page images), with the variants he found in the manuscripts in footnotes; the commentary follows bayt by bayt (bayt 1 from about p. 110; 19 on p. 147, 104 on p. 287, 210 on p. 378). Where al-Lakhmi's commentary quotes a word differently from the editor's printed text (22.1 «أنضيتني», 37.1 «دون التي», 210.2 «يقبل منه الموتُ أسناءَ الرشا»), the notes give al-Lakhmi's.
- **عبد العزيز بن علي الحربي, مفاتح المقصورة (شرح مقصورة ابن دريد)** (Dar Ibn Hazm, Beirut, 2nd ed., 1434/2013): PDF on archive.org `menhagmuslim-book-5072-0e852aad05eb` (`harbi/mafatih.pdf`, page images rendered from it). A commentary bayt by bayt with glosses, and the whole poem again at the end (pp. 183–195), 254 abyat, voweled and numbered. The video's Google Doc follows him: the same 254 abyat in the same order, and his readings wherever he and al-Lakhmi differ (checked on his pages at 19, 25, 63, 73, 76, 107, 120, 150 and 245), except that the Doc has «إذا» where his full text prints «إذ» (below) and «وصاحبي» for his «وصاحبيّ» (73). The text here started from the Doc and was put in the house style.
- **محمود جاسم محمد, ابن خالويه وجهوده في اللغة مع تحقيق كتابه شرح مقصورة ابن دريد** (Mu'assasat al-Risala, Beirut): scan archive.org `0482pdf_201912`. Ibn Khalawayh's commentary, for the meanings; his readings are given in the notes where they differ.
- **Anthologies, for comparison only:** al-Hashimi, *Jawahir al-Adab*, vol. 2, pp. 400–423 (shamela 21505/608–631, `hashimi.txt`), 247 abyat with many misprints; *Amali al-Marzuqi*, pp. 55–63 (shamela 722, `marzuqi.txt`), 234 abyat, lacking the opening bayt and ending with four Shi'i abyat in praise of Ali that no edition has.

`abyat_in_full` is 255: al-Lakhmi's 254 and the bayt his editor adds from other transmissions (224 here).

## Readings settled by ear

Scores come from `scripts/variants.py` (run in one batch with the model loaded once, `/tmp/mib/vbatch.py`, same scoring) on the app audio; the gap is the other reading's score against the text's.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 18.2 | ضَرّاءَ (both) | صَرّاءَ (Ibn Khalawayh, preferred by al-Lakhmi) | −2.5 |
| 19.2 | المُنتَشى (al-Harbi) | المُنتَسى (al-Lakhmi) | −2.3 |
| 22.1 | أَنصَبتَني (both texts) | أَنضَيتَني (al-Lakhmi's commentary); أَضنَيتَني (his editor's note) | −8.1; −11.4 |
| 25.2 | غَما (al-Harbi; some manuscripts in al-Lakhmi's note) | عَمى (al-Lakhmi) | −3.3 |
| 58.2 | وَالسَّبعُ (both) | وَالسَّعيُ (al-Lakhmi's note) | −6.3 |
| 63.1 | صَلى الحَربِ (al-Harbi; «في رواية» in al-Lakhmi's note) | صَلى المَوتِ (al-Lakhmi) | −11.2 |
| 63.1 | بِخَدَّيهِ (both) | بِحَدَّيهِ (some manuscripts, al-Lakhmi's note) | −1.1 |
| 63.2 | لَظى الحَربِ (al-Harbi) | لَظى المَوتِ (al-Lakhmi) | −10.1 |
| 73.1 | وَصاحِبَيَّ (al-Harbi) | وَصاحِبايَ (al-Lakhmi) | 0.0, see below |
| 74.1 | إِذا (al-Lakhmi, the Doc) | إِذِ (al-Harbi) | −2.8 |
| 76.1 | أَثرَهُ (al-Lakhmi) | إِثرَهُ (al-Harbi; al-Lakhmi's note) | −4.5, see below |
| 88.2 | ذَأى (both) | دَأى (al-Lakhmi's note) | +9.1, see below |
| 95.2 | عَن شَنَأٍ أَصَدَّني (both) | عَن شَنَآنٍ صَدَّني (al-Lakhmi's note) | +5.1, see below |
| 107.2 | حَسوَةِ (al-Harbi) | حُسوَةِ (al-Lakhmi) | −7.5 |
| 124.2 | عَسا (al-Harbi) | غَسى (al-Lakhmi) | −11.4 |
| 124.2 | إِذا (al-Lakhmi, the Doc) | إِذِ (al-Harbi) | +1.8 |
| 129.1 | إِذا (al-Lakhmi, the Doc) | إِذِ (al-Harbi) | +0.3 |
| 147.1 | مَرِساً (both) | مارِساً (al-Lakhmi's note) | 0.0 |
| 150.1 | لَدنٌ (al-Harbi; al-Lakhmi's note) | لَينٌ (al-Lakhmi) | −5.2 |
| 163.2 | لَدناً (al-Lakhmi) | لَدنٌ (the Doc) | +1.6, see below |
| 164.2 | فيهِم (both) | عَنهُم (al-Lakhmi's note) | −23.4 |
| 170.1 | يَنفَعُ (both) | يَرفَعُ (al-Lakhmi's note) | −3.5 |
| 181.2 | مَخزولَ (both) | مَجزولَ (al-Lakhmi's note) | −9.7 |
| 182.2 | عَنا (both) | عَرا (al-Lakhmi's note) | −5.5 |
| 192.1 | ثَلَّةٍ (both) | ثُلَّةٍ (al-Lakhmi's note) | −7.9 |
| 193.1 | لِلأَمرِ (al-Harbi; al-Lakhmi's note) | لِلشَّيءِ (al-Lakhmi) | −27.2 |
| 197.2 | بِخُلقٍ (both) | لِخُلقٍ (al-Lakhmi's note) | −5.6 |
| 199.1 | يَحتازُ (Ibn Khalawayh) | يَجتازُ (both editions) | −3.2, see below |
| 204.1 | وَالدَّهرُ (al-Harbi) | فَالدَّهرُ (al-Lakhmi) | −4.2 |
| 208.1 | اِنتَضَت (both) | اِنتَصَت (Ibn Khalawayh; al-Lakhmi's note) | −3.7 |
| 209.2 | جالَسَهُم (al-Harbi; al-Lakhmi's note) | خالَطَهُم (al-Lakhmi) | −21.7 |
| 210.2 | مَوتُهُ أَسنى (both texts) | المَوتُ أَسناءَ (al-Lakhmi's commentary) | −24.0 |
| 213.2 | النَّومَ (both) | اللَّيلَ (a manuscript in al-Lakhmi's note) | −15.7 |
| 225.2 | مُحتَذى (al-Harbi; al-Lakhmi's note) | يُحتَذى (al-Lakhmi) | −6.1 |
| 226.2 | وَعَوى (both) | وَانضَوى (al-Lakhmi's note) | −6.4 |
| 228.2 | لِلقَلبِ (al-Harbi; al-Lakhmi's note) | لِلعَينِ (al-Lakhmi) | −20.3 |
| 234.2 | مُدَّرى (both) | مُذَّرى; مُزدَرى (al-Lakhmi's note) | −9.6; −6.3 |
| 238.2 | ثاقِبَةَ (both) | ناقِبَةَ (al-Lakhmi's note) | −7.7 |
| 240.2 | المُهتَدى (both) | المُقتَدى; المُعتَدى; المُفتَدى (al-Lakhmi's note) | −7.7; −8.0; −8.2 |
| 241.1 | أَشنَعَ (both) | أَسفَعَ (al-Lakhmi's note) | −7.5 |
| 245.2 | سِواهُ (al-Harbi) | سِواها (al-Lakhmi) | −2.9, see below |
| 248.2 | إِذا (al-Lakhmi, the Doc) | إِذِ | −4.4 |
| 252.2 | اِنتَشى (both) | اِنسَرى (al-Lakhmi's Medina copies) | −4.8 |

- **The reciter follows al-Harbi** wherever the two editions part, as the Google Doc does, with one doubtful exception (76.1): the scores are clear at 22, 63, 107, 124, 150, 193, 209, 225 and 228, and lean his way at 19, 25 and 204.
- **73.1:** al-Lakhmi prints «وصاحباي», al-Harbi «وصاحبيّ», and the Doc «وصاحبي», which is a syllable short for the meter. The aligner can't separate the two dual forms; the shorter «وصاحبي» scores 6.7 better, as a shorter candidate always does. The second transcriber hears «وصاحبيا», the first «وصاحبي»: the -ayya of «صاحبيّ», not the -āya of «صاحباي». The text follows the reciter and al-Harbi, with a note giving al-Lakhmi's regular nominative.
- **76.1:** the aligner prefers al-Lakhmi's «أَثرَه» by 4.5 over «إِثرَه»; both transcribers write «إثره» (one voweled), which can't tell the first vowel by ear from the common phrase. The text keeps al-Lakhmi's, which the score favours; the note gives al-Harbi's.
- **88.2:** the aligner writes ذ as "th" and scores it badly, so «دأى» wins by default; the transcript hears «باء». Both editions have «ذأى» (al-Lakhmi's editor: «وما في الشرح هو الصحيح»), and the text keeps it.
- **95.2:** the aligner prefers «عن شنآنٍ صدّني» by 5.1, but the full transcript hears «عن شنئ اصدني», with the alif of «أصدّني», and both editions print it; the text keeps it.
- **163.2:** a coin toss; the transcript hears «لدنا», al-Lakhmi's «لدناً» (a circumstantial accusative), against the Doc's «لدنٌ».
- **199.1:** the reciter departs from both editions: both transcribers of the clip (and the full transcript) hear «يحتاز», and the aligner agrees by 3.2. «يحتاز» is Ibn Khalawayh's reading («يحتاز يفتعل من حاز يحوز إذا ملك», scan leaf 436); the note gives the editions' «يجتاز».
- **245.2:** the shorter «سواه» would win by default; the transcript hears «سواه», and al-Harbi and the Doc have it.
- **إذا before an alif of wasl** (74, 116, 124, 129, 248): al-Harbi's full text prints «إذ», also at 150 and 143 where the meter needs «إذا», so his «إذ» looks like a printing habit; al-Lakhmi and the Doc have «إذا», and the scores (−2.8, +1.8, +0.3, −4.4) don't overturn it.

## Meter

The poem is rajaz (مستفعلن six times), rhyming on a long alif (ا or ى) throughout. Every half was scanned (`/tmp/shw/b3/tools/scan.py` with the rajaz feet: --u-, u-u-, -uu-, uuu-). What doesn't scan mechanically:

- **107:** the article of «كالحسوة» belongs to the sadr: both editions print «وكان كالـ / ـحسوة» (al-Lakhmi «وكان كالْ / حسوة»), and the text splits the word the same way («وَكانَ كَال / حَسوَةِ»), so both halves scan. The timeline for 107 was re-aligned on a clip after the split.
- **120:** «على النسرين» runs across the halves the same way (al-Harbi «على النـ / ـنسرين», al-Lakhmi «على / نْسرين»); the text keeps «النِّسرينِ» whole at the start of the ajuz. Read as one line («ʿalan-nisrīni») both halves scan.
- **104.1** «هُما اللَّذانِ سَمَوا بِناظِري» is a syllable short in its second foot as both editions print it (u-u- uu-u -u-); it scans only with the nun doubled, «اللذانِّ», a form the grammarians allow (Ibn Kathir's reading of 4:16). Neither edition writes it and the aligner can't hear a doubled nun (the word is as long as in 101.1 and 105.1), so the text keeps the editions' spelling.
- **Long mim:** «عَنهُمُ» (115.2), «هُمُ» (142.2) and «مِنهُمُ» (182.1) are said with a long final u, as the meter needs.
- **Short alif:** «أَنا» in 38.1 is read short (ʾana), as usual in verse.
- The scanner's own blind spots: the silent و of «عَمرٌو» (40.1), the ā of «لَكِنّي» (155.1) and «لِلَّهِ» (228.1), and «سَوا» (21.2), which it reads as a plural ending.

## Ear check

- **Alignment:** in six pieces of 2–5 minutes with `/tmp/shw/b3/tools/align-long.py`, cut at 247.6, 526.1, 779.6, 903.0 and 1169.0 s; each cut was checked to fall just before 40.1, 86.2, 131.1, 153.1 and 201.1 by transcribing a few seconds after it. The run was stopped by its time limit after four pieces, and the last two were aligned and stitched the same way by a small script (`/tmp/mib/finish_align.py`). After the split of 107 its two halves were re-aligned on a clip (643.5–649.8 s).
- **Weak words:** 177 of 2,507, nearly all short words (مِن 33, إِذا 20, إِن 11, أَو 9). The weakest are the last words of four pieces (39.2 «الثَّأى», 86.1 «مَتنِهِ», 152.2 «اِطَّبى», 200.2 «مُختَطى»), where the cut came right on the word's last syllable; verify.py hears them as «الثور», «مت», «اضطرب» and «مختصرا», the word cut short at the clip's end or misheard, and the next half starts clean in each case.
- **`scripts/verify.py`:** 175 of 508 clips differ from the text (282 of 2,507 words), all the transcriber's:
  - **the stretched rhyme heard as letters** (67 halves): 1.1 «بالمهر», 1.2 «النقر», 5.2 «الجوارح», 8.2 «الكرم», 22.2 «ملتحم», 25.2 «غمام», 27.2 «للبلاد», 47.2 «البراق», 76.2 «تراب», 128.2 «العلماء», 165.2 «السفاح», 210.2 «الرشاد», 254.2 «ومزدهرا» and the like, and at the end of a sadr 104.1 «بناظرهم», 165.1 «جانبهم», 207.1 «بهموم»;
  - **words run together or split:** 15.1 «مخلتها», 24.2 «عليهما», 54.1–56.1 «ثم تطاف … ثم تجاء … ثم تراح» for «ثُمَّتَ», 59.1 «في من», 67.1 «يعربها», 71.1 «ما حلوا», 83.1 «اعلي طين», 84.2 «مخ لولق», 102.1 «تلا فيا», 103.1 «الحيالي», 110.1 «مازال», 118.1 «ولا عبتني», 134.2 «فيها تا», 142.1 «الجدال», 160.1 «ومنهما», 173.1–2 «قاسما … اراهما … اليهما», 180.2 «بل هل قصار», 181.2 «من العبء» (the poet's «مِلعِبءِ» spelled out), 236.1 «لغر وان», 241.1 «اشنعها تزلتنا», 249.2 «انشدا»;
  - **misheard words:** 8.1 «واتخذت تسيد», 12.1 «اجرطتني», 19.1 «برد», 22.1 «وفه», 31.2 «سلقت», 35.2 «ام لها … المنتظم», 50.2 «تداي بالغدو», 55.1 «عمرته», 61.2 «من … الشباب», 69.2 «حاميه», 78.1–2 «خاض … عرض», 80.2 «امينه», 87.2 «بحسري … السحاب», 88.2 «باي … غدا», 91.1 «فاقدما», 92.2 «رحاب», 93.2 «ذا كالغي», 96.1 «ولطبع», 97.1 «المنيفه», 104.2 «ارضايي … القذر», 108.2 «لقال», 125.2 «من هوي», 136.2 «الحاد … حدت», 145.2 «مخضوعا», 146.2 «قد … السلام», 148.2 «والاستواء», 149.2 «والاريوب الراحل», 150.2 «موهوب», 152.2 «اضطرب», 153.2 «نبي», 156.2 «ان الله … وانتصار», 174.1 «من لك», 177.2 «فسيحه الخطاط», 183.2 «لما اقتنع», 186.1–2 «النبي … انبض … وامتضي», 189.1 «اهويته», 190.2 «لقد … اخلف», 192.2 «غبط مانه», 194.1 «بالشقيم لعرف», 195.2 «يردعه», 196.2 «جعلي», 200.2 «مختصرا», 201.2 «كنت الف امراه», 213.2 «غنوا الطلاق», 215.2 «نعيم», 227.1 «اوا», 229.2 «هو لدج … بري», 230.2 «انا» for «أَنّى», 235.2 «خذ», 252.1–2 «صاحمت … طوي … تشاء»;
  - **a short word swallowed by a wasl or a tanwin, or added:** 7.2 «ما», 12.2 «لي», 20.1 «للدهر», 36.2 «شأو» (the second transcriber hears «وشوى العلا»), 42.2 «مرتمي», 64.2 «ثني», 68.1 «إن» (the second hears «الألآئن»), 122.1 «أو» (the second hears it), 124.2 «الماء», 160.2 «ساغ», 161.2 «عاج», 246.1 «إن» (both transcribers drop it after the tanwin of «عهدٍ»; the meter needs it); extra 29.1 «في», 89.2 «أو», 99.1 «وان»;
  - **107.2 «الحسوه»:** the «كال» that ends the sadr runs into the clip;
  - **216.1 «فشايعتهم», 235.1 «ولابد»** (both transcribers): a sliver of the half before; a prefix would break the meter in both, and neither edition has one;
  - **hallucinations and empty clips,** checked with `--transcriber audar`, which hears every one as written: 44.2 (a blessing on the Prophet), 55.2 and 209.1 (lecture credits), 68.2 and 113.1 (unrelated phrases); 105.1, 132.2 and 185.2 came back empty.
- **Edges:** verify.py lists 13 halves that start or end with a sliver of the next or previous one (4.2 «في», 11.1 «إن», 16.2, 53.2, 66.2, 72.1, 91.2, 172.2, 177.2, 239.2, 240.1–240.2 «أن», 241.2): the reciter runs on across the halves, most of all where a word belongs to both (4.1 «حَلَّ في / أَرجائِهِ», 240.1 «أَن / يَقتادَكَ»). The timings are the aligner's.

## Commentary drawn on

- **Glosses and meanings** follow al-Lakhmi's commentary (Attar's edition), read on the page images where a meaning, credit or reading depends on it (19, 22, 37, 100, 104, 108, 210, and the full text for every reading), and Ibn Khalawayh's commentary where the sharh or notes name him. «المُنتَشى» as «المُستنشَق» is al-Harbi's gloss (p. 39), and «استقصاء الشرب» is al-Hariri's in *Durrat al-Ghawwas*, quoted in al-Lakhmi's editor's note (p. 147 n. 7).
- **The two emirs:** al-Mas'udi (*Muruj al-Dhahab*), quoted by Ibn Khallikan, names them as Abd Allah ibn Muhammad ibn Mikal and his son Abu al-Abbas Isma'il; al-Lakhmi, after al-Qali, calls them «ابنا ميكال الشاه وأخوه» (p. 285; on 108, «ابن ميكال هو الشاه», p. 289).
- **The occasion, the reward and the poem's fame:** Ibn Khallikan, *Wafayat al-A'yan*, vol. 4, pp. 323–329 (shamela 1000/1852–1858, `wafayat.txt`): al-Mas'udi's praise and «ويقال إنه أحاط فيها بأكثر المقصور», the ten thousand dirhams, the commentaries («اعتنى بهذه المقصورة خلق من المتقدمين والمتأخرين وشرحوها وتكلموا على ألفاظها»), and al-Qali's thought that the paralysis was a punishment for bayt 24.
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 6, p. 80 (shamela 12286/5197, `alam.txt`), and Ibn Khallikan (above) for the Zanj, Oman, the Mikalis, al-Muqtadir's fifty dinars, the paralysis, the day of his death and «اليوم مات علم اللغة والكلام».
