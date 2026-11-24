# الثَّعلَبُ وَالدّيكُ

## Recording and extent

Alqimmah Studio published «حكايات أحمد شوقي» on 3 March 2023, crediting Osama Al-Waaedh with recitation and editing. The source lasts 966.844 seconds. Chapter 5 keeps **490.58–547.56 seconds of the original compilation** in one continuous cut. The source voice measurements place the first and last pitched sound of this chapter at approximately 491.10 and 546.17 seconds. The cut admits the entry and the decay of the final rhyme. [Compilation, chapter 5](https://www.youtube.com/watch?v=r6VpT0Lid0E&t=491s)

All 13 couplets occur once. The switch from fox to narrator at 7 and from messenger to cock at 9 can be followed on the studio cards. The 519–522-second sequence actually prints «عرض الأمر عليه» between the messenger’s arrival and the cock’s reply. Studio layout and the diwan divide the sermon differently on the screen.

## Printed text and interpretation

- Ahmad Shawqi, *al-Shawqiyyat*, part IV, «الحكايات», Dar al-Awda, Beirut, 1988. The references follow the pagination of part IV. [p. 150](https://archive.org/details/BBib-Alex-02915/page/n345/mode/1up)
- Ahmad Shawqi, *al-Shawqiyyat*, «الحكايات», Hindawi Foundation for Education and Culture, Cairo, deposit 19938/2012, ISBN 978-977-719-166-1. The page images and the electronic chapter were compared. [p. 884](https://archive.org/details/alshawkeyat/page/n884/mode/1up) · [Electronic text](https://www.safahat.org/books/70706142/143/)

The first edition of *al-Shawqiyyat* (part I, Cairo, Matbaʿat al-Adab wa-l-Muʾayyad, 1898) provides an earlier text. Cairo prints «فهو كهف التائبينا» at 4.2. The two later printings retain the cave. Al-Waaedh says «مأوى». At 8.1 the first printing has «عرض الأمر عليه», without a prefixed conjunction. [p. 177](https://books.google.com/books?id=QIyl-Nj9R6UC&pg=RA1-PA177) · [p. 178](https://books.google.com/books?id=QIyl-Nj9R6UC&pg=RA1-PA178)

Both printings use تدوير, in which a word crosses the metrical break. In 3 they divide لله, in 5 the article of العيش, and in 12 the article of القول. Al-Waaedh sings straight through these words. The display follows the metrical divisions in the two printings: join «لِلَّ / هِ» in 3, «ال / عَيشَ» in 5 and «ال / قَولِ» in 12. The studio arranges the captions by speech, placing «ويقول» on its own in verse 3 and starting its second line with «إن العيش» in verse 5. The recording has the same words. «التيجان» refers to the cocks’ combs, and «دخل البطن» supplies the family experience behind the mocking chain of authorities. The fox’s formula of praise echoes the familiar opening of the Fatiha, while the two diwans and the sound here give «إله العالمين». [Qur’an 1.2](https://quran.com/1/2)

The two printings transmit the same diwan tradition. The page reproductions and the word-by-word output from `scripts/collate.py` are in `media/research/al-thalab-wal-dik/`. The studio captions are performance evidence. The glosses and bilingual commentary are editorial close readings of the cited text.

## Metre and rhyme

Short ramal (مجزوء الرمل), two feet per half. *Ba-ra-zath-thaʿ | la-bu-yaw-man* scans **⏑ ⏑ – – | ⏑ ⏑ – –**, the makhbun form of both feet. *Fī-shi-ʿā-ril | wā-ʿi-ẓī-nā* answers **– ⏑ – – | – ⏑ – –**, two full فاعلاتن. In 7, *fa-a-tad-dī | ka-ra-sū-lun* and *min-i-mā-min | nā-si-kī-nā* give the same two contrasting patterns. The rawiy is nūn. In الواعظينا and الماكرينا an open alif follows it in rhyme. The final «دينا» makes an independent noun sound like the succession of human plurals.

## Readings against the performance

Both printings have «فهو كهف التائبينا», which makes the haven a cave. Both full transcribers and the chapter take give «مأوى». It is good Arabic, has the same metrical value here and makes sense in the sermon. The verse and both word cards therefore carry the performed «مأوى» and give the cave as the printed reading. At 8.1 Cohere suggests an extra ف, while full Audar and the studio text begin «عرض». The little run عَرَضَ الأَمْرَ supplies a complete makhbun first foot in the printed reading. Evidence from the beginning of the word and the construction is recorded below.

Same-word-count alternatives were scored on the performed half with the repository’s `scripts/variants.py`. Times below are seconds in the full compilation. Equal scores can reflect identical romanisation.

| Half | Source seconds | Alternative readings and scores |
| --- | --- | --- |
| 2.1 | 495.32–497.16 | «فَمَشى في الأَرضِ يَهدي» -32.24 · «فَمَشى في الأَرضِ يَهذي» -35.97 |
| 4.2 | 505.68–507.62 | «فَهوَ مَأوَى التّائِبينا» -56.11 · «فَهوَ كَهفُ التّائِبينا» -58.56 |
| 8.1 | 520.42–522.20 | «عَرَضَ الأَمرَ عَلَيهِ» -32.80 · «فَعَرَضَ الأَمرَ عَلَيهِ» -41.92 |

## Half-verse verification

The verifier transcribed 26 performed halves separately with Cohere. Its final report reads “26 clips, 8 with differences; 11 of 85 words differ (12.9%)”. The table records the narrow clip and the independently widened Audar clip. Times refer to the full source. Spelling and rhyme vowels in machine transcripts are left as returned.

| Half | Source seconds | Narrow / widened transcript | Decision |
| --- | --- | --- | --- |
| 2.1 | 495.32–497.16 | «فَمَشَا فِي الْأَرْضِ يَهْدِي» / «فمشى في الأرض يهذي» | The wider clip and the 492–513-second source window recover «يهذي». Both diwans have the same verb. The forced comparison favours «يهدي» by 3.73. Its romanisation renders ذ as th, which poorly represents the voiced consonant here. An independent phoneme trace has /h ð i/ at 496.97–497.13 seconds. It is the narrator’s estimate of the fox’s rambling, just before he quotes the sermon. |
| 3.1 | 499.54–501.40 | «ويقول الحمد لله» / «ويقول الحمد لله» | Both decoders write the whole word «لله» at the end of the clip. The two printed pages put its last syllable at the start of the second half. Across the two halves the fox says «الحمد لله إله العالمين». |
| 3.2 | 501.64–503.48 | «الحمد لله إله العالمين» / «الله إله العالمين» | The widened clip recovers «الله إله العالمين» and the longer sermon window also has «إله». Both decoders supply words from the first half to interpret the isolated syllable «هِ». The fox invokes God once in the complete phrase. |
| 5.2 | 509.88–511.84 | «العيش عيش الزاهدين» / «إن العيش عيش الزاهدين» | Both clips restore the article to «العيش». Its letters close the first printed half and the noun continues into the second. The longer window gives «إن العيش عيش الزاهدين». The fox urges the birds to lead the life of ascetics. |
| 7.2 | 518.24–520.16 | «من إمام الناس كينا» / «قول من إمام الناس كنا عدوهم» | Both short decoders divide «الناسكينا» into unrelated words. On the card at 519 seconds the word is complete. The genitive plural identifies the supposed religious following of the fox and belongs with the other plurals in the rhyme. |
| 8.1 | 520.42–522.20 | «فَعَرَضَ الْأَمْرَ عَلَيْهِمْ» / «وعرض الأمر عليه وهو» | The short recognisers disagree on both the supposed prefixed particle and a final m. Neither full Audar nor the 513.4–526-second Cohere window supplies a prefix. The 522-second card reads «عرض الأمر عليه». The no-prefix reading leads by 9.12 points. The messenger lays the request before one cock. |
| 12.1 | 536.94–539.14 | «(( أَنَّهُمْ قَالُوا وَخَيْرُ الْقَوْلِ )» / «وعلينا أنهم قالوا وخير القول» | Both decoders complete «القول» from the article at the end of the first printed half. With 12.2 the reading is «وخير القول قول العارفين». The cock distinguishes a particular saying from the judgement of those who know the fox. |
| 12.2 | 539.26–541.18 | «والقول قول العارفين» / «ويسر القول قول العارفين» | The clips agree on «القول قول العارفين». Their extra opening sounds come from the end of «وخير القول» at the join. Both texts print the break between the article and the noun, and both instances of «قول» belong in the verse. |

The separate edge report records 11.2 starts with «ان». The nasal at the end of «مِمَّن» in 11.1 carries into «دخل». The full 11th bayt and both printed lines have one relative expression, «ممن دخل».
