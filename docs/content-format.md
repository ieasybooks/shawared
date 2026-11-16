# Content format

The Arabic text is the backbone. Translations, explanations, word meanings and audio timings are layers pinned to it by address. `bun run content:check` enforces everything below.

## Layout

```
content/
  poems/<poem>/
    poem.json                 the Arabic text, as the recordings say it
    ar.json, en.json          one language from one source
    ar.<source>.json          a second source in the same language
    recitations/<reciter>.json
  poets/<poet>/poet.json, ar.json, en.json
  reciters/<reciter>/reciter.json, ar.json, en.json
```

## Addresses

| Address | Points at |
| --- | --- |
| `7` | bayt 7 |
| `7.1`, `7.2` | its sadr, its ajuz |
| `7.1.2` | the 2nd word of the sadr (words split on spaces, counted from 1) |
| `7.1.2-3` | a phrase: words 2 to 3 |

Every word note repeats the Arabic it points at (`word`), so a later text edit can't leave a note on the wrong word. `head` is the form shown on the card when it differs, for example the dictionary form.

## Files

- **poem.json**: `id`, `poet`, `title`, `meter`, `rawiy` (rhyme letter), `abyat_in_full`, `added` (the ISO date it joined the library; the home page lists the newest first), and `abyat` as `{ n, sadr, ajuz }`. Verse text is Arabic letters, harakat and single spaces only.
- **&lt;lang&gt;.json**: `lang`, `source.name` (shown as the explanation's name), optional `title` and `intro`, then `abyat` keyed by bayt number, each with an optional `translation` (a pair, one per half, or one sentence) and `sharh`. `words` holds notes keyed by address, each with `word`, optional `head` and `root`, and `meaning`. Arabic files have no translation.
- **recitations/&lt;id&gt;.json**: `reciter`, `audio` (`<poem>/<id>.m4a`), `duration`, optional `source`, and `timeline`: `[address, start, end]` in the order the audio says them. Repeats and skips are allowed.
- **poet.json**: `id`, `name` (how readers know them), optional `full_name` and `died` (`{ hijri, ce }`).
- **reciter.json**: `id`, `name`, optional `full_name` and `links` (`{ youtube: url }`).
- **poets and reciters' &lt;lang&gt;.json**: `lang`, optional `name` in that language and `bio`.

If a language is missing, the app shows nothing for it: no fallback.

## Publishing

`bun run content:build` checks the content, then writes the files the app downloads:

- `v1/catalog.json`: every poem, newest first, with its title, poet, meter, opening bayt (with its measure and kashida), recordings, the date it was added and a hash that changes with any of its files; every poet and reciter with how many poems they have; and how many poems each meter has.
- `v1/poems/<poem>/<lang>.json`: everything one reader needs, which is the Arabic text, that language's sources, the timings, the poet and the reciters. It also carries how the verses are set: the width every half shares (`measure`) and each half's kashida (`kashida`), worked out from the text ([typography](typography.md#verses-at-one-width)).
- `v1/poets/<poet>/<lang>.json`, `v1/reciters/<reciter>/<lang>.json`: a person's page, which is their names, dates, bio and links in that language, and their poems.

Audio is copied from `media/audio` alongside them. Schemas are in `packages/contracts/src/published.ts`. Apps keep a copy of every file they have read and ask once per session whether it changed. The web site is rendered from these files ahead of time (`bun run web:build`), so a content change on the web means a new build.

## Making a poem

1. Download the recording: `uvx --from 'yt-dlp[default]' yt-dlp -f 'bv*+ba/b' ...` into `media/sources/`.
2. Make the app audio: mono AAC at 96 kbps with a plain volume gain only, into `media/audio/<poem>/<reciter>.m4a`.
3. Transcribe it (tafrigh, Cohere), research the text and settle the disputed readings with `scripts/variants.py`.
4. Write the files, align with `scripts/align.py`, and check each half by re-transcribing its clip.
5. `bun run content:check`, then `bun run content:preview <poem>` to listen through.
