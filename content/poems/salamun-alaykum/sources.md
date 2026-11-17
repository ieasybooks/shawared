# سَلامٌ عَلَيكُم لا وَفاءٌ وَلا عَهدُ

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=F7628VinddA (uploaded 2025-03-29, 6:16). The description gives the title, the poet and the reciter, no text.
- **Audio:** kept 2.9–374.3 s of the download (the silence before the first word and after the last cut), gain −7.8 dB, giving −20.1 LUFS with a peak of −7.6 dBTP.
- **Music bed:** under the voice the whole way through. The aligner managed on the mix; the clip-by-clip transcriber struggled on a few halves (below).
- **Abyat recited:** 40 of al-Sayrafi's 41, in order. He leaves out al-Sayrafi's bayt 36, «أَفي العَدلِ أَن يَشقى الكَريمُ بِجَورِها / وَيَأخُذَ مِنها صَفوَها القُعدُدُ الوَغدُ», with no gap in the audio where it would be. He repeats the last two abyat (39–40 here) at the end; the timeline plays them twice.

## Editions

- **Hasan Kamil al-Sayrafi**, ديوان البحتري (Dar al-Ma'arif, Cairo), poem 289, vol. 2, pp. 740–745: 41 abyat, with variants from his manuscripts, glosses, and the poem's context. Scan: archive.org `20230507_20230507_1209`, leaves 804–809.
  - His heading: «وقال يصف الذئب ولقاءه إياه». He dates the poem to the poet's youth, about 226 AH, and identifies the sons of al-Dahhak as the kin of al-Hasan ibn Raja' ibn Abi al-Dahhak.
  - He reports that al-Kushajim quoted abyat from it in المصايد والمطارد (pp. 107–108) with the note «وقد شك فيها أنها له لقربها من ألفاظ الأوائل ومعانيهم».
  - His headnote also reports al-Buhturi's son Abu al-Ghawth saying that people gave the poem to Abu Tammam, and his note on bayt 31 quotes Ibn Rashiq: «ويُروى لعمارة بن عقيل».
  - Most of his manuscripts have «صرامتي» in 14.1 and «طوته الليالي» in 12.2; the reciter says صَريمَتي and المَنايا, as al-Sayrafi prints.
  - On bayt 9 he prints «بني واصل» and argues for «بني وائل».
- **ديوان البحتري** on old shamela (book 4410): an incomplete copy that lacks the poem.
- **The web texts** (sh6r.com, poetspedia, aldiwan.net): the Abu Dhabi encyclopedia's text, with all 41 abyat and the same readings as al-Sayrafi in 3.1, 4.1, 19.2 and 35.1.
- **Quoted in:** al-Hatimi, الرسالة الموضحة (shamela 777, p. 31), «من أحسن ما قيل»; Abu Hilal al-Askari, ديوان المعاني (shamela 6909, vol. 2, p. 135), who gives three of the wolf abyat to «أعرابي»; ابن أيدمر, الدر الفريد (shamela 20762, vol. 7, p. 320).

`abyat_in_full` is 41, as in al-Sayrafi.

## Readings settled by ear

Scores come from `scripts/variants.py` on the app audio; the gap is the other reading's score against the text's.

| Bayt | Text | Other reading | Gap |
| --- | --- | --- | --- |
| 3.1 | العامِرِيَّةِ (al-Sayrafi, all sources) | العامِرِيّاتِ (heard by both transcribers) | 0.0 |
| 4.1 | الصَّريمَةِ (al-Sayrafi, all sources) | الصَّريماتِ (heard by both transcribers) | 0.0 |
| 4.2 | رَسيسَ (al-Sayrafi) | رَسيسُ (the web texts) | −1.5 |
| 5.1 | بِنَفسِيَ مَن (al-Sayrafi) | بِنَفسي يا مَن (what the transcriber heard) | −1.3 |
| 11.2 | أَجَأٍ (al-Sayrafi) | أَجاءٍ | −1.1 |
| 14.1 | وَإِيّاهُم (al-Sayrafi) | وَإِيّايَ (what the transcriber heard) | −10.6 |
| 19.2 | حُشاشَةُ (al-Sayrafi, all sources) | حُشاشاتُ (heard by both transcribers) | 0.0 |
| 21.1 | جَثَماتِهِ (al-Sayrafi) | جاثِماتِهِ (what the transcriber heard) | −4.6 |
| 25.2 | أَرعَدَهُ (al-Sayrafi) | أَرعادُهُ (what the transcriber heard) | −5.2 |
| 27.2 | يُتعِسُهُ (al-Sayrafi) | يَتعَسُهُ | −3.0 |
| 29.1 | تَحسِبُ (al-Sayrafi; the transcriber's vowels) | تَحسَبُ | −0.2 |
| 33.1 | وَاشتَوَيتُهُ (al-Sayrafi) | فَاشتَوَيتُهُ (his other manuscripts) | −8.1 |
| 35.1 | بِحُكمِها | بِجَورِها (al-Sayrafi, all sources) | −19.8 |
| 39.2 | يُنَثَّ (al-Sayrafi) | يُثنى | −10.3 |
| 40.2 | وَالجَهدُ (al-Sayrafi) | أَوِ الجَهدُ (his manuscript ه) | −12.7 |

- **3.1, 4.1, 19.2:** the aligner can't hear vowel length, so ـة and ـات score the same once a voweled ة is read as t (the fix to `align.py` and `variants.py` made for this poem; before it, ة was dropped and every ـات reading won by 5 to 13 points). Two transcribers, Cohere and Audar, each hear ـات in all three. But all three words end the short foot فَعولُ (u – u), and the same reciter stretches that last short syllable throughout his recitation of «عيون المها», where the transcriber hears الرصافات, الخليفات and الصنيعات for words that can only be singular. What the transcribers hear is that stretch, not a plural, so the text keeps al-Sayrafi's singulars, which every source has.
- **35.1:** the reciter clearly says بِحُكمِها where every source has بِجَورِها; the text follows him, and the note gives the editions' reading. Of the length variants, حَكَمَت and حاكَمَت score the same: Audar hears حكمت, Cohere حاكمت, so the text keeps al-Sayrafi's حَكَمَت.
- **36:** both halves need the long ī of the pronoun read as a syllable, «ذَرينِيَ مِن» and «فَعَزمِيَ لا», as al-Sayrafi prints the second; without it each half is a syllable short. The aligner prefers the shorter forms (by 1.9 and 5.2), but a shorter candidate scores better by construction, so the meter decides.
- **11.2:** وَهدُ (the collective of وَهدة) over وُهدُ by 5.8.
- **Meter decides where the aligner can't:** 2.1 أَأَحبابَنا and 3.1 أَأَطلالَ need their first hamza (without it the half starts long); 1.2 لَكُمُ and 2.2 مِنكُمُ need the long mim (لَكُمو); 11.2 أَجَأٍ needs its tanwin; 4.2 رَسيسَ is the accusative an exception takes when it comes first, as al-Sayrafi prints it.

## Ear check

- **Alignment:** `scripts/align.py` flagged 25 weak words, nearly all short (لَهُ, مِن, بِهِ, وَإِن, اِبنِ) or under the music; the lowest whole halves are 17.1 (اِبنِ, 0.17) and 26.1 (بِهِ, 0.16). Their halves passed the ear check.
- **`scripts/verify.py`:** 20 of 84 clips differ from the text. Each difference is the transcriber's:
  - the stretched endings and readings settled above (3.1, 4.1, 5.1, 19.2, 35.1);
  - words split or misheard under the music: «عضب المضارب» as «عض النضاريب», «انتثر» as «تاثر», «رشادك» as «وشاداك», «وسنان هاجع» as «وسنانها جع», «يقضقض» as «يقطض», «كقضقضة» as «انك قد قاضت», «رغد» as «راد», «ذرى أجأ» as «اذ راءي جان»;
  - words carried over from the next or previous half, or a stretched rhyme: «اخذريني» (14.1), «النهد» (22.2), «فرده» (34.2), «الغدا» (40.2), «امالاكم» (1.2);
  - 3.1 and 4.1, where the transcriber added words that aren't there («واللهم ان يعملون الا», «والحمار الارض والارض»); clips cut wider read correctly («أطلال دار العامريات باللواء», «أدار اللواء بين الصريمات والحمى»);
  - 26.1 and 32.2, where the clip came back empty. A wider clip of 26.1 reads «سما لي وبي من شدة الجوع ما به»; 32.2 still fails on the clip, but its words align at 0.44–0.59 and the full-recording transcript has them in place («على غامئ لو انه عاذب الورد»).

## Commentary drawn on

- **Glosses** follow al-Sayrafi throughout, and the dictionaries where he is silent (لسان العرب on الرُّبد, which he glosses as lions or snakes).
- **The wolf passage:** Shawqi Dayf, تاريخ الأدب العربي (shamela 11996, vol. 4, pp. 236–237); Abdallah al-Tayyib, المرشد إلى فهم أشعار العرب (shamela 150936, vol. 4, pp. 876–878), for the comparison with the older wolf poems (al-Muraqqish, al-Farazdaq) and the suggestion that the wolf of bayt 31 stands for a man.
- **Bayt 18** has no commentary in any source found. The sharh reads «والكرى عبدُ» as its own clause, sleep the slave of the free man: الكرى is the only subject the grammar leaves for عبدُ, and the antithesis حُرّاً … عَبدُ fits it.
- **The name:** al-Murshid calls the poem «ذئبية البحتري»; no other book on shamela does, so it keeps its first half as its title.
- The poet's dates and life follow al-Zirikli's *al-A'lam* (shamela 12286, vol. 8, p. 121).

## Review

A second reader checked the text against al-Sayrafi's scan and the sharh, notes, intro and bio against the sources (2026-11-17). Fixed after the review:

- **Text:** bayt 36's meter (ذَرينِيَ, فَعَزمِيَ) and 11.2 وَهدُ.
- **Intro:** the date given as al-Sayrafi's opinion; al-Hatimi's words quoted as he wrote them; the sons of Wasil as the poet's mother's kin.
- **Notes:** the descent of Shayban from Wa'il, al-Hasan ibn Raja' no longer called an official, heads that only repeated the word, new notes on Hind, al-Hima and غَدا.
- **English:** abyat 7, 11, 25, 31–34, 36 and 39, which said more than the bayt or the source.
- The three "plurals" first taken from the transcribers (3.1, 4.1, 19.2) went back to the editions' singulars, for the reason given above.

