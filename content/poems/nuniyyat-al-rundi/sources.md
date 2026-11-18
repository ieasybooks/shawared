# نونِيَّةُ الرُّندِيِّ

## Recording

- أسامة الواعظ, on his own channel: https://www.youtube.com/watch?v=12ahz197wow (uploaded 2020-02-14, 7:34), «رثاء الأندلس | لأبي البقاء الرندي | بصوت أسامة الواعظ». The description prints a 42-bayt text (Nafh al-Tib's, with «وأين عادٌ وشدادٌ وقحطانُ» at 8.2 and «جورٌ» at 35.2) and marks some abyat with an asterisk, without saying why.
- **The same recording elsewhere.** استوديو القمة Alqimmah Studio uploaded it four months earlier: https://www.youtube.com/watch?v=-xsmrhQS5Io (2019-10-09, 7:34), «إخراج: خالد الشرفي», with the text voweled and «وعدنانٌ» at 8.2. The two downloads (both Opus at about 161 kbps) are the same master: 453.8 s each, envelope correlation 0.97 and sample correlation 0.98 at a constant 6 ms offset in every 5 s window tested (`media/research/nuniyyat-al-rundi/_scratch/alq16k.wav`, `media/research/nuniyyat-al-rundi/tools/cmp.py`). Neither copy is better, so the approved link, the reciter's own upload, is kept.
- **A different performance:** https://www.youtube.com/watch?v=CQ_y__yvZ8E (the reciter's channel, 2024-08-12, 6:45), «نسخة مختلفة من قصيدة رثاء الأندلس … سجلتها أثناء أحداث قصف غزة». A later recording, shorter by 49 s; not used.
- **Audio:** kept 6.7–450.3 s of the download, gain −5.4 dB, giving −20.1 LUFS with a peak of −5.4 dBTP. Cut: the digital silence of the first 1.7 s, then about 5 s of a quiet bed (around −40 dB, no speech in the transcript) before the first word at 7.1 s; and the digital silence after 450.2 s. A low bed runs under the voice the whole way; the aligner managed on the mix.
- **Abyat recited:** all 42 of Nafh al-Tib's text, in its order. He says the last bayt twice, the second time about 12 dB softer, and the timeline plays it twice (422.4–432.3 s and 433.1–442.7 s of the app audio). Both transcribers miss the soft repeat of 42.1 (cohere «من كامد», audar «من كان مدنيا»); a copy raised 14 dB (`media/research/nuniyyat-al-rundi/_scratch/rep/`) is heard by both as the whole bayt («بمثل هذا يذوب القلب من كمد إن كان في القلب إسلام وإيمان», cohere «…من كمد…»).
- **Timeline:** the reciter runs his halves together with no silence. Where the aligner started a half on the held rhyme of the half before (it can't place a word-initial hamza), the start was moved to the energy dip and pitch reset that mark the new half (`media/research/nuniyyat-al-rundi/tools/bounds.py`, `pitch.py`): 6.1 52.98→53.44, 7.1 63.54→63.94, 8.1 74.10→74.48, 9.1 84.74→85.16, 16.1 157.00→157.40, 26.2 264.50→264.58, 31.1 309.86→310.22, 34.1 340.50→340.90, the first 42.2 427.16→427.40, the second 437.54→438.06; the half before each now ends 0.02 s earlier. 23.1 ends at 233.88, after its last word «ما». The clips cut at the new times hear each half's first word whole.

## Title

The sources call the poem by its rhyme and its poet: Ihsan Abbas heads it «[نونية الرندي وشيء من شعره]» in his edition of Nafh al-Tib (vol. 4, p. 486, read on the page image); the editor's introduction to al-Busili's *Nukat wa-Tanbihat* says of Ibn al-Abbar's sinniyya «والتي لا تضارعها إلا نونية الرندي» (shamela 1731/18, vol. 1, p. 26); al-Zirikli calls it «قصيدته النونية» (*al-A'lam*, vol. 3, p. 198). «نونية أبي البقاء» has no hit in shamela's full-text search. «رثاء الأندلس» describes the subject rather than naming the poem: the Azhar al-Riyad editors' margin has «قصيدة الرندي في رثاء الأندلس» (vol. 1, p. 47), Bulut's catalogue «رثاء الأندلس = القصيدة النونية في رثاء الأندلس» (shamela 148091/1301), and the same words title another upload by this reciter, the elegy by Abu al-Fadl al-Walid already in the app (`ya-arda-andalus`). So the title is «نونية الرندي», like «نونية البستي».

## Attribution

Confirmed in two independent lines of transmission:
- **al-Dhakhira al-Saniyya fi Tarikh al-Dawla al-Mariniyya** (anonymous Marinid chronicle), ed. Muhammad Ibn Abi Shanab (Algiers: Jules Carbonel, 1920), pp. 127–129, read on the page images (archive.org `ar120vieux191`, leaves 125–128). Under the year 665, after Ibn al-Ahmar's peace with the king of Castile: «ولما أعطى ابن الأحمر البلاد المذكورة للأفنش قال الفقيه أبو محمد صالح بن شريف الرندي يرثي بلاد الأندلس ويستنصر بأهل العدوة من مرين وغيرهم بهذه القصيدة». (It gives him the kunya Abu Muhammad.)
- **al-Maqqari**, *Nafh al-Tib*, vol. 4, p. 486: «ومن مشهور ما قيل في ذلك قول الأديب الشهير أبي البقاء صالح بن شريف الرندي»; and *Azhar al-Riyad*, vol. 1, p. 47: «أبي الطيب صالح ابن شريف الرُّندي … إذ قال يندب بلاد الأندلس».
- **The long version is attributed to someone else.** al-Khafaji's *Rayhanat al-Alibba* (shamela 1522/364–368, printed pp. 370–374) gives a 61-bayt version under the entry «السيد يحيى القرطبي», who «أُسِرَ بالأندلس» and «أرسل قصيدة نعى بها الإسلام، ونادى ملوكَ الرُّوم وعلماءها … وذلك في عهد السلطان سليمان». That version is the one with Granada, Malaga, Baza and Almeria in it (below). The 42 abyat recited here are not in dispute.

## Editions and the text's history

- **Nafh al-Tib**, ed. Ihsan Abbas (Beirut: Dar Sadir, 1968), vol. 4, pp. 486–489: archive.org `5541pdf`, leaves 2582–2585, read as page images (zoomed crops in `_scratch/nafh487a.png` … `nafh488b.png`); shamela 1002/2508–2511 has the same text (`nafh-shamela.txt`). 42 abyat, lightly voweled. **The base text**, and the recording's: the reciter says its 42 abyat in its order and nothing else. `abyat_in_full` is 42. After the poem al-Maqqari writes (p. 488–489): «انتهت القصيدة الفريدة، ويوجد بأيدي الناس زيادات فيها ذكر غرناطة وبسطة وغيرهما مما أخذ من البلاد بعد موت صالح بن شريف، وما اعتمدته منها نقلته من خط من يوثق به على ما كتبته، ومن له أدنى ذوق علم أن ما يزيدون فيها من الأبيات ليست تقاربها في البلاغة، وغالب ظني أن تلك الزيادة لما أخذت غرناطة وجميع بلاد الأندلس إذ كان أهلها يستنهضون همم الملوك بالمشرق والمغرب، فكأن بعضهم لما أعجبته قصيدة صالح بن شريف زاد فيها تلك الزيادات، وقد بينت ذلك في "أزهار الرياض"». Abbas's note 1 (p. 486) gives the poet's name and books.
- **Azhar al-Riyad fi Akhbar Iyad**, ed. Mustafa al-Saqqa, Ibrahim al-Abyari and Abd al-Hafiz Shalabi (Cairo, 1939), vol. 1, pp. 47–50: archive.org `Ayade_85`, PDF pages 54–57, read as page images (`_scratch/azhar/`). Partly voweled, with the editors' notes on their manuscripts ت and ط and on Nafh al-Tib. 43 abyat: Nafh's 42 and, after 27, «يأيها المَلِكُ البيضاءُ رايتُه / أدرك بسيفك أهل الكفر لا كانوا», with the editors' note «هذا البيت ساقط من نفح الطيب». The reciter does not say it, so it is not shown. The Azhar text gives the poem without the discussion of the additions that the Nafh promises; the editors' note on p. 50 points back to the Nafh. (Shamela 26350/47–50 has this edition's text with many typos; it was not used for readings.)
- **al-Dhakhira al-Saniyya** (above), pp. 127–129: the oldest witness and a different recension. Its own text lacks much of al-Maqqari's, and the editor prints the missing abyat in square brackets (4, 8, 9, 11, 12, 14, 18, 19, 24, 29, 30, 36–38, 40.2, 41.1; the edition gives no note on the brackets here, and every bracketed line is al-Maqqari's). Its unbracketed text has abyat of its own: «تحمّلوا عِبَرًا وأصبحوا خَبَرًا / كما حكى عن خيال النوم وسنانُ» in place of 10; «على بيوتٍ من الإسلام عاطلةٍ / كأنها لم تكن بالذكر تزدانُ» and «صارت كنائسَ قد طال الضلال بها / فليس إلا نواقيسٌ وصُلبانُ» in place of 22–23; «يا من لِعِزّة قوم بعد عزّتهم / كأنهم وهمُ الأحرارُ عُبدانُ» in place of 35, before 34; and «كم من أسيرٍ بحبل الذلّ معتقلٍ / كأنه ميّتٌ والذلّ أكفانُ» before 39. Its readings: 2.1 «كما تدري لها دُوَلُ», 13.2 «وبعضها فوقَ بعضٍ وهي ألوانُ», 21.2 «كما بكت لرسول الله أجفانُ», and the rest in the table.
- **al-Khafaji**, *Rayhanat al-Alibba* (above): the expanded version al-Maqqari warns about, 61 abyat. Besides readings of its own (table), it puts Cordoba in 17.2 and Toledo in 18 («كذا طليطلةُ دارُ [العلوم] فكم / من فاضلٍ قد سما فيها له شانُ»), has 22–24 in the order 24, 22, 23, and adds 19 abyat: «وأين غرناطةٌ دارُ الجهاد…», «وأين حمراؤها العليا…», «والماء يجري بساحات القصور بها…», «ونهرها العذب يحكي في تسلسله…», «وأين جامعها المشهور…», «وعالمٌ كان فيه…», «وعابدٌ خاضعٌ لله…», «وأين مالقةٌ مرسى المراكب…», «وكم بداخلها من شاعرٍ…», «وكم بخارجها من منزهٍ…», «وأين جارتها الزهراء…», «وأين بسطةُ دار الزعفران…», «وكم شجاعٍ زعيمٍ…», «كم جندلت يده…», «ووادياً من غدت بالكفر عامرةً…», «كذا المريّةُ دار الصالحين…», and three at the end, «هل للجهاد بها من طالبٍ…», «وأشرف الحورُ والولدان…», «ثم الصلاة على المختار من مضرٍ…». **These are the later additions** al-Maqqari describes: they name Granada, Baza and other cities that were still Muslim when al-Rundi died in 684 (al-Tayyib: «يعني من كانت أوطانهم لم يستلبها الكفرة حينئذٍ مثل غرناطة», on 26). None is recited.
- **Other additions:** al-Zirikli (*al-A'lam*, vol. 3, p. 198) notes that abyat of al-Busti's nuniyya, in the same meter and rhyme, were mixed into the poem, and that abyat Abdallah Kannun published from a manuscript are unlikely to be al-Rundi's («يستبعد كثيرا أن يكون من نظم الرندي أو من كلام عصره»). Kannun's article was not found. **One half is al-Busti's:** 2.2 «مَن سَرَّهُ زَمَنٌ ساءَتهُ أَزمانُ» is word for word the second half of al-Busti's «لا تحسبن سرورًا دائمًا أبدًا» (bayt 53 of `nuniyyat-al-busti`; in his diwan, ed. al-Khatib and al-Saqqal, and in al-Tha'alibi's *Nathr al-Nazm*: `media/research/nuniyyat-al-busti/diwan.txt`, `tha-alibi-nathr.txt`). All three witnesses of al-Rundi's poem have it, and the reciter says it, so it stays; the sharh of 2 says where it comes from. No other recited half is in al-Busti's poem.
- **Modern witnesses checked:** Abdallah al-Tayyib, *al-Murshid ila Fahm Ash'ar al-Arab*, vol. 4, pp. 414–419 (shamela 150936/1866–1871, `murshid.txt`), quoting Nafh al-Tib's text with comments; Muhammad Abdallah Inan, *Dawlat al-Islam fi al-Andalus*, vol. 5, pp. 49–50 (shamela 1009/2523–2524, `inan-dawla-v5-49.txt`), abyat from Nafh.
- **Starting text:** the video description, checked word by word against the Nafh page images and put in the house style.

## Readings settled by ear

Scores come from `variants.py`'s scoring on the app audio, all rows in one batch (`/home/alifadel/.cache/shw-tmp/b4/tools/vbatch.py`; `tests.txt` → `variants.txt` on whole halves, `tests2.txt` → `variants2.txt` on the words in question, from `align.json`). The gap is the other reading's score against the text's; every pair has the same number of words. "Azhar's ت/ط" are the manuscripts its editors cite in their notes.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 1.2 | يُغَرُّ (al-Khafaji; both video descriptions) | يُغَرَّ (the prints of Nafh and Azhar) | −2.0 (words 1–3); see below |
| 2.1 | شاهَدتَها (Nafh, Azhar, al-Khafaji) | شَهِدتَها (the full transcript) | −7.2 |
| 3.1 | تُبقي (Azhar) | تَبقى (al-Murshid's print) | −6.0 |
| 4.2 | خُرصانُ (Nafh's print; Ibn Abi Shanab's) | خِرصانُ (Azhar's print and its editors' note «بكسر الخاء»; Lisan's plural) | −4.0; −3.4 on the two words, with خَرصانُ −2.4 |
| 5.2 | وَالغِمدَ (Azhar) | وَالغِمدُ (al-Khafaji) | −7.0 |
| 7.2 | الفُرسِ (Nafh, Azhar, al-Khafaji) | المُلكِ (al-Dhakhira) | −16.1 |
| 8.2 | وَعَدنانٌ (the Alqimmah description) | وَشَدّادٌ (Nafh, Azhar, al-Dhakhira, al-Khafaji) | −13.2 |
| 9.2 | القَومَ; قَضَوا | الكُلَّ (al-Khafaji); مَضَوا (al-Murshid) | −9.8; −6.0 |
| 11.1 | وَقاتِلِهِ (Nafh's print) | وَقاتَلَهُ (Azhar's print) | −4.3; −4.8 on the two words |
| 12.2 | وَلا مَلَكَ | وَلَم يَملِكِ (al-Khafaji) | −24.1 |
| 14.1 | وَلِلحَوادِثِ … يُسَهِّلُها (Nafh) | يُهَوِّنُها (Azhar); وَلِلمَصائِبِ (Azhar's ت, al-Khafaji) | −16.2; −29.4 |
| 15.1 | أَمرٌ | خَطبٌ (al-Dhakhira, al-Khafaji) | −17.8 |
| 16.1 | فَامتُحِنَت (Nafh; Azhar's ط; al-Dhakhira, al-Khafaji) | فَارتُزِئَت (Azhar, its ت, and the Nafh it collated) | −25.2 |
| 16.2 | أَقطارٌ | أَوطانٌ (al-Dhakhira) | −11.2 |
| 17.1 | فَاسأَل (Nafh, Azhar) | فَسَل (al-Dhakhira, al-Khafaji) | see below |
| 17.2 | شاطِبَةٌ | قُرطُبَةٌ (al-Khafaji) | −17.5 |
| 19.1 | حِمصُ (Nafh's print) | حِمصٌ (al-Khafaji, al-Murshid) | see below |
| 20.1 | فَما | وَما (al-Dhakhira) | −5.5 |
| 20.2 | البَقاءُ | البُكاءُ (al-Khafaji) | −10.7 |
| 21.1 | الحَنيفِيَّةُ | الحَنيفِيَّةَ (both video descriptions) | −2.7 |
| 22.2 | أَقفَرَت وَلَها (Nafh) | أَسلَمَت (Azhar); فَلَها (Azhar's ط) | −19.2; −9.5 |
| 23.1 | صارَت | أَمسَت (al-Khafaji) | −19.8 |
| 23.2 | فيهِنَّ | بِهِنَّ (al-Khafaji) | −4.6 |
| 24.2 | حَتّى … تَرثي | حَيثُ (Azhar's ت); تَبكي (al-Khafaji) | −14.3; −10.1 |
| 25.1 | الدَّهرِ | العَيشِ (al-Dhakhira) | −22.4 |
| 26.2 | حِمصٍ (Nafh's print); المَرءَ | حِمصَ; القَومَ (al-Dhakhira) | −4.4 (−3.0 on the words); −18.5 |
| 28.2 | السَّبقِ | السَّيفِ (al-Dhakhira) | −14.6 |
| 29.2 | النَّقعِ | اللَّيلِ (al-Khafaji) | −15.2 |
| 30.1 | البَحرِ في | النَّهرِ; مِن (al-Khafaji) | −6.7; −6.5 |
| 31.1 | نَبَأٌ مِن أَهلِ | خَبَرٌ (al-Dhakhira); أَمرِ (al-Khafaji) | −19.6; −14.1 |
| 32.1 | بِنا المُستَضعَفونَ (Nafh; Azhar's ت) | بَنو المُستَضعَفينَ (Azhar, al-Dhakhira) | −16.8 |
| 32.2 | قَتلى وَأَسرى فَما (Nafh) | أَسرى وَقَتلى (Azhar, al-Dhakhira, al-Khafaji); فَلا (al-Dhakhira, al-Khafaji) | −20.7; −5.9 |
| 33.1 | التَّقاطُعُ | التَّنافُرُ (Azhar's ط) | −14.9 |
| 35.2 | جَورٌ (the reciter's description) | كُفرٌ (Nafh, Azhar, al-Khafaji, al-Murshid); قَهرٌ (Azhar's ت) | −18.6; −10.6 |
| 36.2 | بِلادِ | قُيودِ (al-Khafaji) | −20.6 |
| 37.1 | فَلَو (Nafh, Azhar) | وَلَو (Azhar's ط) | −2.7 |
| 38.1 | وَلَو | فَلَو (al-Khafaji) | −8.3 |
| 39.1 | أُمٍّ وَطِفلٍ | طِفلٍ وَأُمٍّ (al-Khafaji) | −20.5 |
| 39.2 | تَفَرَّقُ (Nafh's print) | تُفَرَّقُ | −6.2 |
| 40.1 | مِثلِ حُسنِ الشَّمسِ إِذ طَلَعَت (Nafh) | ما رَأَتها الشَّمسُ إِذ بَرَزَت (Azhar; al-Dhakhira and al-Khafaji close to it) | −24.2 |

- **Where the reciter departs from every edition:** 8.2 «وَعَدنانٌ» (both transcribers hear it: cohere «وَعَدْنَانُ», audar «وعدن»; the editions repeat 7.1's Shaddad) and 35.2 «جَورٌ» (both transcribers hear «جور»). Each has a word note giving the editions' reading, in both languages.
- **4.2 «خُرصانُ»** leans to the damma by 3.4–4.0 against the kasra, and both video descriptions print it; Nafh (Abbas) and Ibn Abi Shanab print the damma too. Lisan gives the plural as «خِرْصان» (vol. 7, p. 21), and the Azhar editors' note says «بكسر الخاء». The text follows the reciter and the note gives Lisan's form.
- **1.2 «يُغَرُّ»** is the lean of the audio (2.0 on the three words), cohere's vowel, al-Khafaji's print and both video descriptions; Abbas and the Azhar editors print «يُغَرَّ», reading «لا» as prohibitive. The meaning is the same; the word note gives both.
- **17.1 «فَاسأَل»:** on the two words, «فَسَل» scores 8.9 better, but the same-length controls show the aligner's bias for the shorter form (control «فَقُل» beats «فَاسمَع» by 4.4), and both transcribers hear «فاسأل», as does the full transcript. The text keeps Nafh's and Azhar's «فَاسأَل».
- **19.1 «حِمصُ»:** tanwin leans by 1.6 on the half and 3.4 on the words, but the aligner can't hear tanwin, cohere hears «حِمْصُ», and the meter allows both. The text keeps Nafh's «حِمصُ». In 26.2 Nafh prints «حِمصٍ», and the text keeps that too.
- **Tanwin and vowels the meter decides** (the scores can't): 5.2 «يَزَنٍ» (Azhar; «يَزَنِ» +0.7 by ear would leave the second foot short), 7.1 «شَدّادُ» without tanwin (Nafh; «شَدّادٌ» +1.6 would make the third foot four long syllables) and «إِرَمٍ» (−1.0 for «إِرَمِ»), 17.1 «مُرسِيَةٍ» (Azhar; best by 1.2–5.3 against «مُرسِيَةِ، مُرسِيَةَ، مُرسِيَه»).
- **Long vowels not taken from the transcripts** (the reciter stretches short syllables, and every edition and the meter have the short one): 10.1 «مالك» for «مَلِكٍ», 12.2 «مالك» for «مَلَكَ», 26.1 «مارحا» for «مَرِحاً», 28.1 «راكبينا», 29.1 «حاملينا», 30.1 «راتعينا», 31.1 «نابأ» for «نَبَأٌ», 35.1 «لذلات» for «لِذِلَّةِ», and 40.1 «طالعت» (both transcribers) for «طَلَعَت», the shortened last foot of the sadr.

## Meter

Basit, with the ʿarud makhbuna (فَعِلُن) and the darb maqtuʿ (فَعْلُن); rawiy ن, «ـانُ». `scan.py` passes 83 of the 84 halves. It flags 11.2 only because it can't read a word-initial bare «إي» (it passes «إِيوانُ» and «وَإيمانُ»); by hand: «وَأَمَّ كِسرى | فَما آ | واهُ إيوا | نُ» u-u- | -u- | --u- | --.

- **Diptotes given tanwin, which the meter needs:** 6.2 «أَكاليلٌ», 17.1 «بَلَنسِيَةً» and «مُرسِيَةٍ», 17.2 «شاطِبَةٌ», 18.1 «قُرطُبَةٌ», 20.1 «قَواعِدٌ», 23.2 «نَواقيسٌ», 31.1 «أَندَلُسٍ», 7.1 «إِرَمٍ»; the notes say so where the word has a note. Azhar prints the tanwin on «مُرسِيَةٍ» and «قَواعِدٌ».
- **A noun left without its tanwin:** 7.1 «شَدّادُ» (Nafh's vowel), against 8.2's editions' «وشدّادٌ».
- **The plural mim long:** 33.1 «بَينَكُمُ», 33.2 «وَأَنتُمُ», 35.1 «عِزِّهِمُ», 35.2 «حالَهُمُ», 37.2 «عَلَيهِمُ», 38.1 «بَيعِهِمُ»; silent in 36.1 «مَنازِلِهِم».
- 34.1 «أَبِيّاتٌ» needs its shadda (Nafh and Azhar print it); the transcribers' «ابيات» would break the second foot.

## Ear check

- **Alignment:** `align.py` (`align.txt`) flagged 9 weak words, all short (مِن, لَهُ, إِن, هُم, اِبنِ, حَيثُ) except the first word of the soft repeat of 42.1 (0.03), settled above.
- **`verify.py`** (cohere, after the timeline changes; `verify2.txt`): 17 of 86 clips differ from the text, 27 of 444 words. Each difference is the transcriber's:
  - **a stretched vowel or rhyme heard as letters:** 3.2 «يدوبوا», 10.2 «وسنانه», 11.2 «اوانه», 26.2 «اوطانه», 27.1 «المصيبات», 35.1 «لذلات»;
  - **words run together or split:** 7.1 and 8.1 «واينما», 27.2 «ما عطول», 38.2 «لها لك», 4.2 «ما شرفيه»;
  - **misheard:** 7.1 «رمضان» for «إرم» (audar «إيرمن»), 25.2 «يقضان», 29.2 «نقع» without the article, 34.2 «انما» (audar «أما»);
  - **dropped at a clip's edge:** 2.1 «دول» (audar hears «شهدت هدول»), 15.1 «دهى» (audar «دها الجزيرة»);
  - **42.1, the soft repeat:** above.
- **The second transcriber** (audar on the same clips, `media/work/12ahz197wow/audar2/`) hears every flagged half as the text apart from its own slips of the same kinds (6.1 «ذهوا تجانب ياما», 30.1 «داعتين», 31.1 «أندا لوس»).
- **Edges:** 23.2 starts with «ما» in cohere's clip and audar's 23.1 ends with «في»: the clips' 0.05 s padding overlaps the boundary between «ما» and «فيهنّ».

## Commentary drawn on

- **No classical commentary on the poem was found.** The sharh rests on the text, the lexicons and these:
  - **Abdallah al-Tayyib**, *al-Murshid*, vol. 4, pp. 414–419: the reading of 5 (every sword drawn to destroy is itself destroyed; Sayf ibn Dhi Yazan; Ghumdan), Shaddad and Iram (7), «الكل» (9), the party kings (10, quoted), Uhud and Thahlan as Islam and Arabism (15), the full river (19), the Quran in 22 (9:18) and 38 (6:71), the weeping palm trunk (24), Granada in 26 (quoted), «ألا» (34), the maidens of paradise (40, quoted), the girl's bewilderment (41), al-Shatibi and Ibn Malik (17), Seville as Hims (19).
  - **The Azhar al-Riyad editors' notes** (vol. 1, pp. 47–50): السابغة، المشرفيات، الخرصان (4), Sayf ibn Dhi Yazan and Ghumdan (5), Dara (11), Uhud and Thahlan (15), Hims as Seville (19).
- **Lexicons:** Ibn Manzur, *Lisan al-Arab* (shamela 1687; `lisan-*.txt`): دولة 11:252–253, أبقى عليه 14:80, الشأن 13:230, السابغة 8:433, نبا السيف 15:301, المشارف 9:174, الخرص 7:21–22, انتضى 11:666, غمدان 3:327, الإكليل 11:595, قضى نحبه 1:750, الطيف 9:228, الوسن 13:449, السلوان 14:394–395, المحراب 1:305, الحنيفية 9:57–58, الهيمان 12:627, المرح 2:591, العتيق 10:236, ضمر 4:491, العقاب 1:621, المرهف 12:99, النقع 8:362, الرتع 8:112, الدعة 8:381, الأبيّ 14:5, الهمّة 12:621, المرجان 2:366 and 13:406, العلج 2:326–327, الكمد 3:381; the Quran for 7 (89:6–7), 8 (28:76–81; 69:6), 12 (18:84; 38:35), 25 (2:255), 26 (17:37), 32 (4:75), 38 (6:71), 40 (55:58).
- **Places and people:** Yaqut, *Mu'jam al-Buldan* (shamela 23735, `yaqut.txt`): Iram 1:155, al-Iwan 1:294, Thahlan 2:88, Hims of al-Andalus 2:304 («دخل جند من جنود حمص إلى الأندلس فسكنوا إشبيلية فسمّيت بهم», after Ibn Bassam), Xativa 3:309, Ghumdan 4:210; al-Tabari, *Tarikh*, vol. 1, p. 574 (shamela 9783/571, `tabari-dara.txt`): Dara stabbed by two of his guards when his army broke before Alexander; al-Maqrizi, *al-Khitat*, vol. 1, p. 416 (shamela 11500/538): Ibn Abbas's «من حمير، هو الصعب بن ذي مراثد»; al-Farid's commentary on the Alfiyya, vol. 1, p. 324 (shamela 174/320): «عدنان: أبو معد. قحطان: أبو اليمن»; Nashwan, *Shams al-Ulum*, vol. 8, p. 5383: «[قَحْطان]: أبو اليمن»; al-Umari, *Masalik al-Absar*, vol. 3, p. 393 (shamela 11790/898): «دولة آل ساسان» and the Kisras; al-Shatibi, *al-I'tisam*, vol. 1, p. 65: «تركتكم على البيضاء» behind the gloss of البيضاء (21).
- **The fall of the cities** (notes on 17–19 and 23): Inan, *Dawlat al-Islam*, vol. 5, p. 34 (Cordoba, 23 Shawwal 633, and its mosque made a church at once, «وقد كان هذا شعارهم كلما دخلوا قاعدة أندلسية»), vol. 5, p. 92 (Valencia, 17 Safar 636), vol. 4, p. 460 (Murcia's treaty with Castile, 10 Shawwal 640) and p. 463 (Murcia taken by James of Aragon, 664), p. 468 (Jaen ceded, late 643), p. 486 (Seville entered by Ferdinand III, early Ramadan 646), vol. 2, p. 352 (Seville's river, the Guadalquivir); `inan-falls.txt`.
- **The occasion and date** (intro): al-Dhakhira al-Saniyya, pp. 126–127 (the year 665, the towns Ibn al-Ahmar gave the Castilian, the poem's heading); Inan, vol. 5, p. 49 (665 AH = 1267 CE; «من أروع المراثي القومية وأبلغها تأثيراً في النفس») and p. 50 n. 1 (the Dhakhira's dating); al-Maqqari on the additions (Nafh 4:488–489).
- **The poet's life:** al-Zirikli, *al-A'lam*, vol. 3, p. 198 (shamela 12286/2515, `alam.txt`): 601–684 AH (1204–1285 CE), name, kunyas, Nafza, Ronda, Granada, al-Wafi; Ibn al-Khatib, *al-Ihata*, vol. 3, pp. 275–287 (shamela 11682/1068–1080, `ihata.txt`): «يكنى أبا الطيب», Ibn al-Zubayr on his months at Malaga, Ibn Abd al-Malik's «كان خاتمة الأدباء بالأندلس», his books, «كثير الوفادة على غرناطة … يسترفد ملوكها، وينشد أمراءها», born Muharram 601, died 684; al-Safadi, *al-Wafi bi-l-Wafayat*, vol. 16, p. 160 (`wafi.txt`); Abbas's note in Nafh 4:486; Inan, vol. 5, p. 457 («مرثيته الشهيرة … والتي خلدت ذكره إلى يومنا»).

## Review

Checked by the drafter, 2026-11-18, point by point against the second reader's list: every half collated word by word against Nafh al-Tib (script against the shamela text, which matches the page images; it differs only at 8.2 and 35.2) and read again on the Nafh and Azhar page images for the vowels; al-Dhakhira's and al-Khafaji's differences listed; every half scanned (`scan.py`, 11.2 by hand) and every case ending read for its grammar; `tashkeel.ts` clean; the doubtful vowels scored with same-length controls and checked against both transcribers; the cut, the first and last halves, the repeat and every boundary checked on the energy and pitch tracks and the clip transcripts; every sharh against al-Tayyib and the Azhar editors' notes, every gloss against Lisan al-Arab or Yaqut, every date against Inan and al-A'lam, every quotation against its page. Fixed in this pass:

- **Text:** 1.2 «يُغَرُّ», as the reciter says it, once al-Khafaji's print turned up with the same vowel (Nafh's «يُغَرَّ» in the note); 19.1 back to Nafh's «حِمصُ», since the aligner can't hear tanwin and cohere hears none; 4.2 «خُرصانُ» with Lisan's «خِرصان» in the note.
- **Audio:** the 5 s intro bed cut from the start; ten half starts moved off the previous rhyme (above); 23.1 extended over its last «ما».
- **Sources:** al-Dhakhira al-Saniyya found and read (the oldest witness and the date 665); al-Khafaji's 61-bayt version identified as the one al-Maqqari warns about, with its attribution to «السيد يحيى القرطبي»; 2.2 found to be a half of al-Busti's nuniyya; the claim that Granada fell in 897 removed (only a typo-ridden shamela text for it).
- **Notes:** heads without an article the verse lacks («شَأن», «إيوان», «سِنَة», «دَعَة», «بُكا», «مَرجان», «وَسنان»), heads for nouns that differ from the verse only by their case ending, 16.1 under the active «اِمتَحَنَ»; 8.2 «عدنان» and «قحطان» glossed as the sources gloss them (no "northern" and "southern" Arabs); «يزن» no longer called a licence.
- **Sharh:** 12 no longer states in the sharh what the note says; 34 without an indirect question; 33 «وعبادٌ لإلهٍ واحد» and «في الأندلس»; six thin Arabic entries deepened; English entries that repeated a note (8, 15, 19, 35) rewritten, and al-Tayyib credited in 38.
- **English:** 4.2 "even when swords and spears glance off it" (إذا, not a relative clause); 28 without "hard", which the Arabic doesn't have; romanization without a leading ' (Itaq, Iqban, Ilj).
