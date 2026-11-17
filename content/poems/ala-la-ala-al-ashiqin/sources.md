# أَلا لا عَلى العاشِقينَ جُناحُ

## Recording

- أسامة الواعظ, produced by استوديو القمة: https://www.youtube.com/watch?v=tNtwyDZnMQw (uploaded 2026-10-29, 6:02), «ألا لا على العاشقين جناح | إلقاء: أسامة الواعظ». The description names the poet, «إيهاب الشباطات», and links an explanation of the poem (`description.txt`).
- **Audio:** kept 0–349.9 s of the download (the poem starts at once; cut after the third saying of the last bayt, before a short tail and the closing silence), gain −4.8 dB, giving −20.1 LUFS with a peak of −4.5 dBTP.
- **Abyat recited:** all 40, in order. He says the first bayt twice and the last three times, and the timeline plays them so. The full-recording transcript has the last bayt four times; the fourth is a repeat at a chunk boundary of the transcript, and the aligner finds nothing in the last 3 s where it would be (confidence 0.0).

## Text

- **The explanation linked from the video** (Google Drive PDF, 16 pages, `drive/sharh.pdf`; page images `drive/p01.png` … `p16.png`): «ألا لا على العاشقين جناح», the full text fully voweled and numbered (pp. 1–2), then each bayt with a paraphrase and glosses (pp. 3–16). The text here is this one, in the house style, without its punctuation. The explanation doesn't name its author; the video's description links it: https://drive.google.com/file/d/1t1DR825L6tR2A5uKvPgcGcg75ZHKPvKG/view.
- **al-Diwan** has the poem on the poet's page (aldiwan.net, poem 173192); the site blocks fetching, so it was not collated.

`abyat_in_full` is 40.

## Readings

The recording follows the PDF's text word for word; there were no readings to settle. Points checked:

- **11.1 «حَمزَةٍ»** takes tanwin, as the PDF prints it; the meter needs it.
- **18.2 «دِما»** is shortened from دماء for the meter, as the explanation says.
- **12.1 «ذَروني»:** one clip transcriber missed the word and the aligner prefers the half without it (−16.2), but both transcribers hear «فلاح ذروني» in a clip across the two halves, and the full transcript has it. The aligner compares ذ ("th") badly, as in the Lamiyya of Ibn al-Wardi.

## Ear check

- **Alignment:** 9 weak words, all short (في, يد, عن, أم, من); the weakest is 33.2 «في» (0.01). The halves pass by ear.
- **`scripts/verify.py`:** 24 of 86 clips differ from the text, all the transcriber's:
  - **a stretched rhyme heard as extra letters:** 9.2 «جراحه», 21.2 «اصطباحكم», 23.2 «قراحه», 27.2 «صراحه», 40.2 «رواحهم» (all three times), 3.1 «بداجيتي», 22.1 «غيمته», 31.1 «السنه»;
  - **words run together or split:** 13.2 «وحرك بيدي», 14.1 «ما ضربت», 27.2 «وفي ها», 33.2 «اذا كان» (the second transcriber hears «فنداك له في الوجوه ارتشاح»);
  - **misheard words:** 1.1 «تلا», 6.1 «المسايل», 8.1 «حمت», 14.2 «بدل», 19.1 «ففديت», 26.1 «بلاغات … علي», 32.1 «وضل», 36.2 «رياح», 39.1 «وبيض»;
  - **12.1 and 18.2:** the clip transcriber's «والانسان ان» and «والانسان الا من اصبرهم» are noise; the second transcriber hears «… وهمي فإن الجفون» and «بأن دماء صغريه تساحوا».
- **10.2:** the clip transcriber hears «وَتَوبُ» as «هو توب»; the timing is the aligner's.

## Commentary drawn on

- **The sharh follows the linked explanation** closely: its paraphrases, its glosses (تُشاح, الداجية, الخسوف, الجناح, الوشاح, قُبيل, الهوينى, الهدء, الحمى, الغواني, الجلّ, التوب, الحيا, الشحاح, النوى, الظاعنون, ألاحوا, كُبيد, صاب, الكساح, عقبى, الغلاب, الصفاح, الأصغران, تُساح, الزناد, الاقتداح, مُيأّس, اللقاح, المنيّة, تأبّد, الاصطباح, حميت, الخفّ, البطاح, النقاوة, الحشا, الشهد, القراح, فساح, بنات اللسان, الوحيان, قبُح, الملاح, السبل, الدجى, صراح, الوشي, صباح, تلوّن, سحاح, يسود, الصحاح, أجلى, السنا, الجديدان, تُتاح, الشذا, يُفاح, الندى, الارتشاح, الشكيمة, الجماح, اللجام, الأفئدة, الرباح, المنائر, القفو, الصحاب, اللياح, البراح, النبل, الورى, المتون, المشرقان, علّ, الرواح) and its sources: Hamza as the Prophet's uncle and foster-brother (11); Quran 16:69 and al-Mutanabbi's «فإنّ المسك بعض دم الغزال» (23); the hadith «قد تركتكم على البيضاء ليلها كنهارها» (27); Quran 22:46 (30); 8:17 (38); the structure of 18 with 17, 20 with 21, 31 with 32, 37 with 14.
- **The poet:** al-Diwan's page for him blocks fetching, and the saved `aldiwan.html` is only its challenge page; the bio says no more than the video and the explanation do: a contemporary poet from Jordan.

## Review

A second reader checked the text against the explanation's page images, scanned every half, and checked the sharh, notes, intro and bio against the explanation and the saved files (2026-11-17). Fixed after the review:

- **Text:** the alif of wasl voweled in 11.1, 19.2, 21.2, 25.1 and 33.2.
- **Bayt 30:** «الصِّحاحُ» is the subject of the passive «أُخطِئَت», the true things the eyes miss, not "sound eyes"; the sharh, note and translation follow the explanation, with its hadith of the black spot on the heart.
- **Glosses:** 19 the زَندة as the lower fire-stick, 21.2 «تأبّد» as the explanation gives it, 33.2 «ارتشاح» as a modern sense of an old word; heads of 13.2 and 18.2; the explanation's other readings in 16, 18 and 37 added; four notes added (8.2, 13.2, 16.2, 31.2) and seven that glossed common words dropped.
- **English:** the sharh leads with what the bayt means (1, 13, 15, 25, 38, 40); 22 «خُفّ» is a shoe, not a sandal; 30 and nine other halves retranslated; «scattered homes» in the intro.
- **Poet:** the bio cut to what the sources support; the saved al-Diwan file is a challenge page, not his profile.
