# الشَّهيدُ

## Recording

- أسامة الواعظ, on his own channel: https://www.youtube.com/watch?v=JcGj8Aj91oI (uploaded 2023-10-19, 3:05), «سأحمل روحي على راحتي | عبدالرحيم محمود». The description reads «قصيدة: الشهيد / للشاعر عبدالرحيم محمود / إلقاء: أسامة الواعظ» and gives a 19-bayt text that mixes the readings of al-Sawafiri's edition (4.2 «فَخَوفَ», a slip for his «فمخوف»; 7.1 «مَقتَلي»; 9.1 «فَوقَ الهِضابِ»; 18.2 «وَقَلبي»; 19.2 «بِأَنّي») with others (8.2 «يَهيِّجُ», 16.1 «الحَقودِ»), and voweled slips (1.2 «وَأَلقي», 4.1 «عِشتَ»). It was not the starting text.
- **Audio:** kept 9.8–182.5 s of the download (`media/work/JcGj8Aj91oI/audio.json`; the digital silence before the first word, which starts at 10.3 s, and after the last, from 182.1 s, cut), gain −6.6 dB, giving −20 LUFS with a peak of −6.3 dBTP. The gaps between ajuz and the next sadr sit near −40 to −45 dB (reverb or a faint bed); the aligner managed on the mix, with one weak word (4.1 «إِن», 0.20).
- **Abyat recited:** all 19, in order. He then says bayt 1 again and bayt 2 twice more (148.0–171.4 s of the app audio), and the timeline plays them as said. Both transcribers hear all three closing repeats.
- **Timeline** (`scripts/align.py`, then edited; the aligner's own file is `media/research/al-shahid/_scratch/recitation.aligner.json`, the edits are `_scratch/bin/fixedges.py`):
  - every ajuz now ends where the voice stops before the pause (the energy falls below −33 dB for 0.1 s), 0.3–0.6 s after the aligner's end, which stopped on the stretched rhyme; the last half ends at 171.40 s, where the voice stops (−40 dB from 171.4 s);
  - 5.1 starts at 31.86 s, not 31.44, and 17.1 at 124.72 s, not 124.02: the aligner had put their first words inside the rhyme of 4.2 and 16.2, whose voice runs to 31.50 and 124.36, with a clean pause after each;
  - 13.1 ends at 97.56 s and 13.2 starts at 97.60 s (the aligner had 97.30 and 97.58): the first verify run heard «من» at the start of 13.2's clip, the tanwin of «اِبتِسامٌ», which runs at a lower level from 97.25 to 97.55 s. The second run is below.
  - Sadr ends were left where the aligner put them: the reciter runs each sadr into its ajuz with no pause.

## Editions

- **D58: ديوان عبد الرحيم محمود**, «تولّت نشره لجنة تكريم ذكرى الشاعر الشهيد», 1958, p. 13: archive.org `1958_20260107`, leaf 12, read from the page image. The first collected edition (al-Manasra calls it «الطبعة الأردنية», p. 17 of his edition). Headed «الشهيد», 19 abyat in three groups divided by dots (1–5, 6–14, 15–19), nearly unvoweled.
- **S80: ديوان عبد الرحيم محمود**, ed. Kamil al-Sawafiri, 2nd ed., Dar al-Awda, 1980, pp. 120–123, poem 3, «الشهيد»: archive.org `2-1980_202601`, leaves 119–122, read from the page images. Lightly voweled, one half to a line, 19 abyat. Its footnote on p. 120: «نظم الشاعر هذه القصيدة ابان ثورة فلسطين الكبرى ١٩٣٦ – ١٩٣٩ التي اشترك فيها مع المجاهدين الأحرار ونشرها في مجلة الأمالي البيروتية . وقد تعددت المصادر التي نشرتها واتفقت على أبياتها البالغ عددها تسعة عشر», then the sources: Muhammad Ahmad Hammad, لباب الثقافة والأدب, pp. 334–335; Isa al-Na'uri, الجديد في الأدب العربي للصف الأول الثانوي, 2nd ed., pp. 133–134; «الديوان ص ١٣» (D58); Nasir al-Din al-Asad, الشعر الحديث في فلسطين والأردن, p. 174. None of these four was available to read except D58.
- **M09: الأعمال الكاملة: عبد الرحيم محمود، الديوان والمقالات النقدية**, «جمع وتحقيق» Muhammad Izz al-Din al-Manasra, Dar Jarir, Amman, 1st ed., 1430 AH / 2009 CE (his earlier editions: Dar al-Jalil, Damascus, 1988; Dar al-Karmil, Amman, 1993, p. 12 n.), pp. 37–38, poem 1, «الشهيد»: archive.org `a1605n_202508`, leaves 38–39, read from the page images and zoomed where the vowels mattered. Fully voweled, 19 abyat. Footnote 1: «مجلة (الأمالي)، السنة الأولى، عدد – 21، سنة 1938.» Footnote 2 glosses «الصحصحان: الأرض المستوية أو الأرض الجرداء. مخوف الجَناب: يهابهُ الناس. أَغُذُّ: أُسرِعُ. حياضي: أرضي. تجدّلَ: ارتمى أرضاً.» On pp. 25–26 he prints a letter of Omar Farrukh, al-Amali's editor, dated 18 June 1954, listing what al-Amali printed by the poet; its item 13 is «سأحمل روحي على راحتي – العدد 21 – شعر», in the first year. On p. 17 al-Manasra says al-Sawafiri never saw al-Amali, though his footnote names it. **The reciter follows M09** everywhere except 9.2 «تُناوِشُهُ» and 10.2 «الشَّرى» (below), and its text, put in the house style, is the starting text; the text also leaves M09 at 14.1 «لِيَحلُمَ», a coin toss settled by the lexicon, and in the spelling of 13.2 «الدُّنى».
- **R49: مجلة الرسالة**, no. 829 (23 May 1949), pp. 25–27, Muhammad Salim al-Rashdan, «ثلاثة جاهدوا فصدقوا»: shamela 29674/54217–54219 (`risala-829.txt`). Quotes abyat 1, 2, 3, 7 and 15, in that order, in his account of the poet's death. Its readings: 7.1 «أرى مقتلي» (as D58, S80), 15.2 «موتا كريماً» (every diwan: «شريفاً»); its 1.1 «سأحمل روحي راحتي», 1.2 «وألقي بها مهاوي الردى» and 3.2 «ورد المنايا» break the meter, and 2.1 «فأما حياة تسر صديق» drops the article: misprints or slips of memory, not readings.
- al-Amali itself (Beirut, 1938–1941, M09 p. 18), and the editions of the Nablus Municipal Library (1975) and Nafi' Abd Allah (1979) that M09 pp. 17–18 describes, were not found.

The three editions are transcribed from their page images in `media/research/al-shahid/` (`d58.txt`, `sawafiri.txt`, `manasra.txt`, keeping the vowels each prints), and `scripts/collate.py` against the text (`collate.txt`) lists exactly the differences in the table and under Spelling below.

`abyat_in_full` is 19, the count in all three editions; al-Sawafiri's footnote says the sources agree on it.

**Attribution:** the three editions of the diwan; R49, a year after the poet's death, by a man who says he knew him («ثلاثة عرفتهم بنفسي، وصحبتهم عمرا من دهري», p. 25), names him and quotes five abyat as his; Farrukh's 1954 letter (in M09) lists it among his poems in al-Amali. No other attribution was found.

**Title:** every edition heads the poem «الشهيد», and al-Sawafiri (p. 26, below) names it so among his best-known poems; the video's description also calls it «الشهيد». Farrukh's letter lists it by its first half, as it lists every item. So the title is «الشَّهيدُ», "The Martyr".

## Readings settled by ear

Scores come from `scripts/variants.py`'s scoring on the app audio, all rows with one model load (`/home/alifadel/.cache/shw-tmp/b4/tools/vbatch.py`; tests in `media/research/al-shahid/tests.txt`, output in `variants.txt`), each candidate the same number of words; the gap is the other reading's score against the text's.

| Half | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 1.2 | وَأُلقي (M09; أَلقى يُلقي) | وَأَلقي (the description) | −0.7 (coin toss; the grammar decides) |
| 2.2 | يُغيظُ (M09) | يَغيظُ (the description; the common form) | −2.9, −2.1, −4.1 (its three sayings) |
| 4.1 | لا عِشتُ (M09) | لا عِشتَ (the description) | −3.7 |
| 5.2 | مَقالِيَ (M09; the meter) | مَقالي | +2.3 for the shorter reading (see below) |
| 7.1 | مَصرَعي (M09) | مَقتَلي (D58, S80, R49) | −18.5 |
| 8.2 | وَيُبهِجُ (S80, M09) | وَيَبهَجُ; يُهَيِّجُ (the description) | −6.0; −12.3 |
| 9.1 | تَجَدَّلَ في الصَّحصَحانِ (M09) | تَجَدَّلَ فَوقَ الهِضابِ (S80); تَجَندَلَ (D58, which has «تجندل فوق الهضاب») | −46.9; −2.5 |
| 9.2 | تُناوِشُهُ (the reciter) | تَناوَشُهُ (M09; S80 «تَناوشُهُ») | −5.6 |
| 10.1 | لِأُسدِ (S80, M09) | لِطَيرِ (D58) | −17.6 |
| 10.2 | الشَّرى (S80; both transcribers) | الثَّرى (D58, M09) | −3.9 |
| 12.2 | عُفاراً (M09) | عَفاراً; عِفاراً | −1.3; −4.7 |
| 14.1 | لِيَحلُمَ (Lisan) | لِيَحلَمَ (M09) | −0.6 (coin toss; the lexicon decides) |
| 16.1 | الحَقودِ (S80, M09, unvoweled) | الحُقودِ; العَدُوِّ (D58) | −5.2; −20.2 |
| 18.2 | فَقَلبي (D58, M09) | وَقَلبي (S80) | −4.6 |
| 19.2 | قَومِيَ أَنّي (M09) | قَومي بِأَنّي (D58, S80) | −8.9 |
| 6.1, 15.1 | لَعَمرُكَ (M09; Lisan) | لَعُمرُكَ (S80 at 15.1, «لَعُمرك») | −4.5; −6.8 (`variants2.txt`) |
| 13.1 | اِبتِسامٌ (S80, M09) | اِبتِسامُ | −3.7 (`variants2.txt`) |

- **Where the reciter departs from every edition:** 9.2 «تُناوِشُهُ» (−5.6, a clear gap; S80 and M09 print a fatha on the ta, M09 also on the waw: «تَناوَشُهُ», form VI with one ta dropped; D58 is unvoweled). The text follows him, and the note gives the editions' form; the sense is the same (Lisan, vol. 6, p. 362: النَّوش التناول, and «المناوشة في القتال»).
- **10.2 «الشَّرى»** against D58's and M09's «الثَّرى» (the soil): the aligner leans to ش by 3.9, but it scores ث badly; both transcribers hear «الشرى» (cohere «الشَّرَىٰ», audar «الشرى»), as does the full transcript, and S80 prints «الشّرى». The text follows the recording; the note gives «الثَّرى». «أُسد الشرى» is a set phrase (Lisan, vol. 14, p. 431); «الثرى» would set earth against the sky of 10.1, which may be the poet's word, but the recording does not say it.
- **2.2 «يُغيظُ».** M09 prints the damma; the audio leans to it at each of the three sayings (2.1–4.1), and cohere, which vowels some clips, writes «يُغِيظُ» twice. Lisan (vol. 7, p. 451, `lisan-ghayz.txt`): «وحكى الزجّاج: أغاظه، وليست بالفاشية. قال ابن السكّيت: ولا يقال أغاظه. وقال ابن الأعرابي: غاظه وأغاظه وغيّظه بمعنى واحد». The note says so.
- **5.2 «مَقالِيَ».** The meter needs the ya voweled («مَقالي بَينَ» leaves «بَينَ الوَرى» as − − u −, where the ajuz needs u − − u −); M09 prints «مقالِيَ»; the aligner favours the shorter candidate by default, and both transcribers hear a vowel after the ya (audar «مقاليا», cohere «قالِيَ»).
- **12.2 «عُفاراً»** (M09's damma; cohere also writes «عُفَارًا») is a coin toss against «عَفاراً». The lexicons have العَفْر and العَفَر for dust (Lisan, vol. 4, p. 583; al-Qamus, p. 442) but no عُفار or عَفار in that sense (Lisan has العِفار for the tree whose wood makes the upper fire-stick, vol. 3, p. 54, and Ibn al-A'rabi's العَفار for leaving palms unwatered for forty days after watering, vol. 4, p. 589); the word reads as the poet's noun from عَفَر, on the pattern of غُبار. The note says so without claiming a source for it.
- **14.1 «لِيَحلُمَ»:** M09 prints «لِيحلَمَ»; the audio can't tell (−0.6), and Lisan (vol. 12, p. 145) has «حَلَمَ يَحْلُمُ إذا رأى في المنام». The text follows the lexicon.
- **16.1 «الحَقودِ»** (the rancorous man; Lisan, vol. 3, p. 154, «رجل حقود: كثير الحقد») rather than «الحُقود» (hatreds): −5.2, and D58's «العدوّ» confirms that a person is meant.
- **Spelling, not readings:** 13.2 «الدُّنى» (D58 «الدنى»; S80, M09 «الدُّنا»): the plural of دنيا is written with ya (al-Qamus, p. 1283, «ج: دُنًى»). 6.1 «إِنّي» after the oath (D58 «أني»). 4.2: S80's «فمخوفَ» would break the meter (u u − u −), a misprint; the description's «فَخَوفَ» comes from it.

**Meter:** mutaqarib, فعولن ×4, the ajuz ending فعو and the sadr in فعو, فعولُ or فعولن; rawiy the alif (الرَّدى, العِدى, المُنى, … الفَتى), a maqsura like `maqsurat-al-mutanabbi`. `/home/alifadel/.cache/shw-tmp/b4/tools/scan.py` scans all 38 halves with no flag. Scanned by hand: 1.1 (u−u u−− u−− u−) and 9.1 (u−− u−u u−− u−−). Licences: the first-person ya with fatha in 5.1 «لِيَ», 5.2 «مَقالِيَ» and 19.2 «قَومِيَ» (each needed for the meter, each printed so in M09), and the mamdud shortened at the rhyme in 8.2 «الدِّما», 12.2 «البَها» and 17.2 «الإِبا».

## Ear check

- **`scripts/verify.py`** (cohere, first run, `verify-1.txt`): 9 of 44 clips differ from the text, 19 of 183 words. Each is the transcriber's:
  - the stretched end of 2.1 heard as «الصديقات» (all three sayings) and 2.2's ظ as ض («يغيض», the first saying);
  - 4.2 «ان خوف» for «مَخوفَ» (audar hears «النخ ف الجنابي», the full transcript «مخوف الجناب»); 5.2 «ودوام قالي» (a split; see 5.2 above); 11.1 «كسادمه» (run together); 13.2 «بهذه» for «بِهَذي»;
  - 13.2 starting with «من»: the tanwin of 13.1, fixed in the timeline (above);
  - **17.1**: the clip came back as a hallucination («ان الله يوم المومنون» twice). Audar hears «أخوفا وعندي تهون الحياة», the half as written, and the full transcript has «اخوفا وعندي تهون الحياه».
- **Second run** after the timeline edits (`verify.txt`): the same 9 clips and 19 words, for the same reasons. 13.2 still starts with «من»: the tanwin of «اِبتِسامٌ» runs into the mim of «مَعانيهِ» (n before m is merged, «اِبتِسامُم مَعانيهِ»), so there is no silent point between the halves, and any cut hears a nasal before «معانيه». 17.1 is still the same hallucination on a clip that now starts 0.7 s later, outside 16.2's rhyme.
- **Audar** on the same 44 clips (`media/work/JcGj8Aj91oI/audar/`): noisier, and each difference is its own: dropped or stretched letters (1.2 «مهاو», 8.1 «الصلي», 8.2 «الدماء», 12.2 «البهاء», 17.2 «الإباة», 18.2 «لذاع» for «لَظى»), splits (7.1 «مصر عيدون», 16.1 «اصطبأ ريلي كيد»), mishearings (3.2 «يروض» for «وُرودُ», 11.2 «وأثقال … ريحا», 14.1 «ليحلو ما حلم الخلد», 38: 1.1 «وأنا أحمل روحي على راحتك»); cohere hears each of these as the text.
- Read together, the two transcribers settle 9.1 (both «في الصحصحان»), 7.1 (both «مصرعي»), 10.1 («لأسد السماء»), 10.2 (above), 16.1 («الحقود»), 18.2 («فقلبي») and 19.2 («قومي أني»).

## Commentary drawn on

There is no classical or modern commentary on the poem beyond M09's five glosses (above), which the notes on 4.2, 6.2, 9.1 and 19.1 cite. The sharh is the drafter's reading of the Arabic, checked against the lexicons; where it goes beyond them it says so («ولعلّ…», «وقد يُقرأ…»). The readings that are the drafter's own:

- **5:** a boast of his standing, or (the other reading, given in the sharh) one more condition of the life he will accept, after 4; the bayt is grammatically independent.
- **9:** «وجسمٌ» is coordinated with «مسيلُ الدما» of 8.2, the subject of «يُبهج»: the sight of a felled body also delights him. From here to 14 the poem describes the martyr in the third person.
- **10:** «أُسد السماء» read as birds of prey, set against the lions of the earth; the idea that only the strongest feed on him is the drafter's.
- **12:** «عفّر» has no stated subject (the likeliest is «دمُه», the subject of «كسا» and «أثقل» in 11); the sharh and the translation ("It dusted") leave it open. That rolling a face in the dust humiliates its owner comes from Lisan, vol. 4, p. 583 (Abu Jahl's «لأُعفّرنّ وجهه في التراب»; «يريد إذلاله»).
- **11:** the scent of the martyr's blood read as an echo of the hadith in al-Bukhari, Sahih (al-Sultaniyya print), vol. 1, pp. 56–57, no. 237 (shamela 1681/412, `bukhari.txt`): «كل كلم يكلمه المسلم في سبيل الله، يكون يوم القيامة كهيئتها، إذ طعنت، تفجر دما، اللون لون الدم، والعرف عرف المسك».
- **14:** the sleep of immortality read as an echo of Quran 3:169, quoted exactly.
- **19:** guarding the trough as the old image of defending one's own: Zuhayr's Mu'allaqa, «وَمَنْ لَمْ يَذُدْ عَنْ حَوْضِهِ بِسِلاحِهِ ... يُهَدَّم», with al-Zawzani's comment «واستعار الحوض للحريم» (شرح المعلقات السبع, p. 151, bayt 56; shamela 11253/161, `zawzani.txt`).
- **7.1.3 «دونَ»:** the hadith «من قُتل دون ماله فهو شهيد», al-Bukhari, vol. 3, p. 136 (shamela 1681/3946).
- **18.2:** «كلّا إنّها لظى» is Quran 70:15; Lisan (vol. 15, p. 248) «ولظى: اسم جهنم».

**Lexicons for the notes** (Lisan al-Arab, shamela 1687; al-Qamus al-Muhit, shamela 7283; printed pages):
راحة: al-Qamus p. 221 («والأكفّ كالراحات … واحدتهما راحة»); مهاوي: Lisan 15/370 (al-Azhari: «المهواة موضع في الهواء مشرف ما دونه من جبل وغيره»), 15/374 (الهوّة); الرّدى: Lisan 14/316; أغاظ: Lisan 7/451; العِدى: Lisan 15/35 («وقد جاء في الشعر العدى بمعنى الأعداء»); وُرود: Lisan 3/456–457; المنايا: Lisan 15/292 («والمنى والمنيّة: الموت لأنه قُدّر علينا»); الجناب: Lisan 1/279; الحِمى: Lisan 14/199; أصغى: Lisan 14/461; دوّى: Lisan 14/281; الورى: Lisan 15/390; لعمرك: Lisan 4/601–602 («فإذا أقسموا فقالوا: لعمرك فتحوا لا غير»); أغذّ: Lisan 3/501 and M09; السليب: Lisan 1/472 (فعيل بمعنى مفعول, as «شجرة سليب»); الصليل: Lisan 11/382; أبهج: al-Qamus p. 181 («وكمنع: أفرح وسرّ، كأبهج»); تجدّل: Lisan 11/104 (الجدالة: الأرض; الجدل: الصرع) and M09; الصحصحان: Lisan 2/508 and M09; ناوش: Lisan 6/362; جارحة: Lisan 2/423; الشرى: Lisan 14/431; الأرجوان: Lisan 14/311–312; الصبا: Lisan 14/451; عفّر, العَفَر: Lisan 4/583, al-Qamus p. 442; البهاء: Lisan 1/36; الهزء: Lisan 1/183; الدّنى: al-Qamus p. 1283; حلم: Lisan 12/145; هنأ: al-Qamus p. 57; الرؤى: Lisan 14/297; رام: Lisan 12/258; الكيد: al-Qamus p. 316; الحقود: Lisan 3/154; سام: Lisan 9/68; هان: al-Qamus p. 1240; الإباء: Lisan 14/4 («والإباء: أشدّ الامتناع»); العُداة: Lisan 15/36; لظى: Lisan 15/248; الحوض: al-Qamus p. 641 and M09; الحسام: Lisan 12/134; الفتى: Lisan 15/147.

## The intro and the poet

- **The poem's date and occasion:** S80 p. 120 n. 1 (the 1936–1939 revolt; al-Amali); M09 p. 38 n. 1 (al-Amali, first year, no. 21, 1938) and pp. 25–26 (Farrukh's letter: issue 21, first year). Farrukh's list numbers the issues weekly (no. 45 is 7 July 1939, no. 48 28 July, no. 50 11 August, no. 51 18 August), so if the numbering ran weekly from the start, no. 21 would fall about January 1939; that is the drafter's inference, so the intro gives the issue and says that al-Manasra dates it to 1938.
- **Schoolchildren:** S80 p. 26: «وأبدع اغاريده الحماسية التي وعاها وحفظها طلبة وطالبات فلسطين ممن تعلموا في مدارس فلسطين بعد ثورة سنة ١٩٣٦ وفي مقدمتها رائعتاه: الشهيد، والشعب الباسل». The intro paraphrases it.
- **The last battle:** R49 p. 26 (al-Rashdan's account; the quotation «أتفر وأنت القائل: سأحمل روحي على راحتي» is exact). It is one account among several (below), and the intro gives it as his.
- **Poet: name and dates.** al-Zirikli, al-A'lam, vol. 3, p. 348 (shamela 12286/2957, `alam.txt`): «عبد الرحيم بن محمود بن عبد الرحيم، أبو الطيب العنبتاوي … (١٣٣١ - ١٣٦٧ هـ = ١٩١٣ - ١٩٤٨ م)»; `full_name` and `died` follow it, as writing.md asks. Mu'jam al-Shu'ara al-Arab, p. 1594 (shamela 2114/1594, `mujam-shuara.txt`) repeats al-A'lam almost word for word and is not an independent source.
- **Poet: life** (each sentence of the bio): Anabta, al-Najah, teaching there, the 1936 revolt, the British pursuit, Iraq, the Baghdad military college, Basra, Rashid Ali al-Kaylani's revolt of 1941, the return to al-Najah, the Arab Liberation Army as a lieutenant, the battle in the Nazareth area, the diwan collected after his death: al-A'lam, above. Born 1913 in Anabta: also S80 p. 21 and M09 p. 11. Ibrahim Tuqan among his teachers at al-Najah: M09 p. 12 (list of teachers) and S80 p. 24. Taught Arabic at al-Najah after graduating: S80 p. 24. Left teaching to fight in 1936: S80 p. 25. Iraq, the military college («تخرج منها برتبة ضابط ملازم»), teaching in Baghdad and Basra, al-Kaylani's revolt: S80 pp. 27–28; M09 p. 11 (quoting Marwan al-Tahir). Return to al-Najah: S80 p. 30; M09 p. 12. The line to Prince Saud: al-A'lam (quoted exactly: «المسجد الأقصى أجئت تزوره أم جئته قبل الضياع تودعه؟»; al-Zirikli: «وما زال يرنّ في أذني قوله»); R49 p. 27 has the same line with «أتيت». Killed on 13 July 1948 at al-Shajara and buried in Nazareth: S80 pp. 33–34, quoting Arif al-Arif, al-Nakba, vol. 3, pp. 621–627, and p. 233; M09 p. 12 (Marwan al-Tahir: «حتى استشهاده في معركة الشجرة في 1948/7/13. وقد دفن في مدينة الناصرة»).
- **Where the sources differ** (the bio keeps to what they share):
  - **His grandfather:** al-A'lam «بن محمود بن عبد الرحيم»; S80 p. 21 names the father «الشيخ محمود عبد الحليم», and M09 p. 11 «الشيخ محمود عبد الحليم عبد الله (والد الشاعر)». `full_name` follows al-A'lam by the house rule; the two editors of the diwan give a different grandfather.
  - **The battle's name:** al-A'lam «معركة (عين الشجرة) بمنطقة الناصرة»; S80, M09, Mu'jam al-Shu'ara and Farrukh (M09 p. 26) «معركة الشجرة». S80 p. 32 calls al-Shajara «قرية عربية من أعمال طبرية». The bio says "al-Shajara near Nazareth".
  - **How he died:** al-A'lam: hit by a shell fragment, carried by his comrades in a jeep towards the hospital in Nazareth, «ولكن السيارة هوت في واد سحيق، ففاضت روحه»; Arif al-Arif (S80 p. 34): «أصابته رصاصة», carried on a stretcher towards the field hospital; R49: he charged into the gunfire and fell. The bio says only that he was killed in the battle.
  - **Dates of teaching and of Iraq:** al-A'lam: taught at al-Najah until 1936; M09 (Marwan al-Tahir): 1933 to late 1937, then the revolt, Damascus and Baghdad, the college 1939–1940, Basra 1940–1941, back to al-Najah in October 1941; S80: left al-Najah when the revolt broke out in 1936, went to Iraq when it ended in 1939, stayed «زهاء ثلاث سنوات من ١٩٣٩ الى ١٩٤٢», returned «في أعقاب سنة ١٩٤١». The bio gives no years for these.

## Review

Checked by the drafter, 2026-11-18: every half collated again, letter by letter, against D58, S80 and M09 from their page images (zoomed where a dot or a vowel decides: 2.2 «يُغيظُ», 5.2 «مقالِيَ», 9.2 «تَناوَشُهُ», 10.2 «الثرى» and «الشّرى», 12.2 «عُفاراً», 14.1 «ليحلَمَ», 15.1 «لَعُمرك», 16.1 «الحَقود»), with `scripts/collate.py` listing nothing that is not recorded above; `scan.py` on all 38 halves, and 1.1 and 9.1 by hand; `tashkeel.ts` clean; the oath vowel of 6.1 and 15.1 and the tanwin of 13.1 scored (`variants2.txt`); the first and last halves, every ajuz end and the three closing repeats checked against the energy envelope and both transcribers' clips; every note and every sharh against Lisan, al-Qamus and M09's glosses (the list above), and each allusion against its text (al-Bukhari no. 237 and the hadith on «دون ماله», Quran 3:169 and 70:15, al-Zawzani on Zuhayr); the intro and both bios sentence by sentence against al-A'lam, S80, M09 and R49; heads, romanization, British spelling, no note repeated in a sharh (no run of four words shared). Fixed in this pass:

- **Timeline:** the 13.1/13.2 boundary moved to the tanwin (above), and verify run again.
- **Notes:** the heads of «لَعَمرُكَ» (6.1, 15.1) are «عَمر», without the article the verse word lacks; 4.1.3-4 places «لا عشتُ» between «وما العيش» and the condition, not "its answer".
- **English:** 9.2 "hunting creatures" (jawarih are birds and beasts of prey, as 10 goes on to say), 19.1 "watering places" for حِياض (troughs and pools, not wells).
- **Arabic sharh:** 7, 13, 15 and 18 were under 100 letters and are deepened (7 ties the bayt to the death-place of 6; 18 explains the fa of «فقلبي»).
- **Intro:** the sentence on Palestinian schoolchildren now keeps al-Sawafiri's limit, those taught after 1936, and says it was his rousing poems they learned, this one foremost.
