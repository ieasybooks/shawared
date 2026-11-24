# خَلِّ جَنبَيكَ لِرامٍ

## Recording and extent

Abd al-Rahman al-Saeed recites nine abyat, once each, on the upload credited to موقع الشنكبوتية, 4 May 2014. The full 85.38 s source includes «قال أبو نواس واسمه الحسن بن هانئ» before the verse. The recorded keep is 23.84–69.96 s, one continuous 46.12 s take from «خلّ» through «للأنام». The app master measures −20.0 LUFS after −4.4 dB gain. Both complete transcriptions are beside the original PCM in `media/work/8Shrl5IiTUk`. [Recording](https://www.youtube.com/watch?v=8Shrl5IiTUk)

The full-source transcript in `media/work/8Shrl5IiTUk/transcript.txt` joins any word split at the metrical break. Its first line is the spoken attribution outside the app cut. The nine lines after it are the poem.

## Text and explanation

- Ewald Wagner, ed., *Der Dīwān des Abū Nuwās*, II (Wiesbaden, 1972), pp. 164–165, chapter seven. The scan has «وقال أبو نواس [من الرمل]», eight lines on p. 164 and the ninth on p. 165. Its order supplies all nine positions here. A marginal gloss marked P explains the first line by «أي لا تشتغل بالجواب». At 4 the text has «فئام وفئام», with «نيام وقيام» recorded in the apparatus. At 7 the text has «للجمام». [Scan, item do-nowas](https://archive.org/details/do-nowas)
- Ibn Aydamur, *al-Durr al-farid*, 9, p. 228, no. 13535, files «مت بداء الصمت» under Abu Nuwas. The accompanying «أبيات أبي نواس» gives our 1–7, including «بالنطق» at 3, «فئام وفئام» at 4, a shorter 6 without «منهم» and «للحمام» at 7. Al-Tawhidi, *al-Basa'ir wa-l-dhakha'ir*, 2, p. 57, has al-Jammaz explicitly recite our opening two as Abu Nuwas's before another speaker parodies them. These are independent witnesses to the circulation of the opening. [Ibn Aydamur](https://shamela.ws/book/20762/4096) · [Al-Tawhidi](https://shamela.ws/book/26423/300)
- Al-Khatib al-Baghdadi, *Tarikh Baghdad*, ed. Bashshar Awwad Ma'ruf, preserves two different occasions of quotation. In the biography of Yahya ibn Aktham, the young Yahya answers Sufyan ibn Uyayna, who falls silent and quotes Abu Nuwas’s first two verses. In the account of Bashshar ibn Musa al-Khaffaf, **Bashshar** is the speaker. He names al-Hasan ibn Hani' and recites our 1, 2, 5, 8 and 9, with «إنما العاقل» at 5, followed by his words about meeting Yahya at the Resurrection. This Yahya is Ibn Ma'in. [Bashshar, 7, p. 621](https://shamela.ws/book/736/4153) · [Sufyan and the young Yahya, 16, pp. 283–284](https://shamela.ws/book/736/9163)
- Al-Suyuti, *Husn al-samt fi al-samt*, p. 110, gives three lines corresponding to 1, 2 and 5, with «إن السالم». The report places them on Sufyan ibn Uyayna's lips and mentions their transmission under Abu Nuwas's name. In this edition the full nine and the narrative credited to al-Khatib al-Baghdadi are in **the modern editor's note 8**. In the narrative Sufyan quotes an existing poem after the young Yahya ibn Aktham answers him. The footnote's nine-line text has «نيام وقيام» and «للحمام». Al-Bakri also quotes the opening in a discussion of bridling the tongue, *Fasl al-maqal*, p. 22. [Al-Suyuti and note 8](https://shamela.ws/book/36951/102) · [Al-Bakri](https://shamela.ws/book/1025/34)

The translation follows the developing figures. The archer's shot can draw a reply, a joke unlocks death, then the mouth that could be bridled gives way to Death's own mouths eating and drinking. At 6 «فالبس الناس» asks the hearer to wear people's company as it comes, with health and illness alike. These links are the editor's reading. The abridged selections above leave different lines out. The recording includes every bayt in Wagner's sequence. The transcriptions and output of `scripts/collate.py` are in `media/research/khalli-janbayka`. Word divisions in the shorter witnesses have been aligned to the metrical break for comparison.

## Metre and readings

The metre is *majzu' al-ramal*, two feet to each half, with final mīm and a sustained kasra. At 1 the sadr runs «خَلْلِ جَنْبَيْ / كَ لِرَامِنْ», فاعلاتن / فَعِلاتن. At 6 «فَلْبَسِنْنَا / سَ عَلَصْصِحْ / حَتِ مِنْهُمْ / وَسْسَقَامِي» gives فاعلاتن / فَعِلاتن in the first half and فَعِلاتن / فاعلاتن in the second. Tawdir carries a word across the division at 3 (المزح), 4 (آجال), 5 (ألجم), 6 (الصحّة), 7 (القصد) and 8 (تترك). The audio runs through these joins.

Equal-word candidates were scored on the aligned app master. Scores are log scores, with the larger value favoured. Both complete original-audio transcriptions support the joke at 3 and rest at 7. Cohere also recognises the two crowds in continuous speech.

| Address | Candidates and scores | Adopted reading |
| --- | --- | --- |
| 3.1.3 | بالمز −14.57, بالنط −24.71 | «بالمزح», as in Wagner, an apparently harmless joke. |
| 4.1.3 | ساق −7.28, سقى −7.28 | Both romanise as *saqa*. Wagner and Ibn Aydamur have ساق. A word brings whole groups to their appointed deaths. The full Cohere pass’s verb for giving water cannot express that construction. |
| 4.2.2–3 | فئام وفئام −38.02, نيام وقيام −38.48 | The score is inconclusive. Wagner, Ibn Aydamur and the full Cohere transcript agree on the repeated crowd. |
| 5.1.2 | السالم −11.63, العاقل −40.15 | The safe person, as in Wagner and Ibn Aydamur. Al-Khatib’s first report makes the same practice the mark of a sensible person. |
| 7.2.3 | للجمام −7.29, للحمام −13.90 | «للجمام», strength restored by rest. This also fits the advice to economise one's effort. |

## Verification

The narrow comparison flagged 10 of 18 halves. Each row gives the independent widened Audar result from the same source. A full-length transcription supplies the syllables beyond the window when the word spans the two halves.

| Half | Widened transcription | Decision |
| --- | --- | --- |
| 3.1 | ربما استفتحت بالمزح | The isolated cut invented «بالمسجد». The wider clip completes «بالمزح» as Wagner does. |
| 3.2 | مزح مغاليق الحمام | Initial ح belongs to المزح. Both nouns after it are intact. |
| 4.2 | جال في آمن وفي آميه | The beginning completes «آجال». The engine breaks فئام into several smaller words. The full Cohere pass and both witnesses with this reading settle it. |
| 5.1 | إنما السالم من الجمال | The extended sound supplies the rest of «ألجم», which the engine expanded into «الجمال». The next words are the mouth and its bridle. |
| 5.2 | الجم فاهو بلجام | The wider onset recovers the whole verb. The long sound after فاه is the rounded ending of the possessive pronoun. |
| 6.2 | بالصحة منهم والصقام | The false «النفس» disappears in context. Full Cohere gives «الصحة منهم والسقام», the contrast and the pronoun printed by Wagner. |
| 7.1 | وعليك القصد إن القصد | The cut stopped after إن. Widening restores the second «القصد», whose article ends the first metrical half. |
| 8.1 | شفت يا هذا وما تترك | The verb carries into the next half. Both full passes give «شبت» at the start, the grey hair that prompts the rebuke. |
| 8.2 | تترك أخلاق الغلام | The whole word is audible to the wider recogniser. Its beginning has already been assigned to 8.1. |
| 9.1 | والمنايا آكلات | The wider clip drops the added ه of the narrow pass. The feminine plural participle pairs with شاربات. |
