# Shawared

Arabic poetry as it is recited: audio with the verses lighting up, translations, explanations and word meanings. One Expo codebase for iOS, Android and web. Content is JSON in git; there is no database yet.

## Where code lives

- `content/` – the poems, poets and reciters, written by hand. Format: [docs/content-format.md](docs/content-format.md).
- `apps/app` – the Expo Router app. `src/app` holds routes only; screens live in `src/features/<feature>`, shared pieces in `src/components/ui`, plumbing in `src/lib`.
- `packages/contracts` – zod schemas: the strict authoring format (`source.ts`), the lenient published format the app downloads (`published.ts`) and addresses.
- `packages/listening` – pure playback logic: timelines, the line being recited, previous/next/repeat, word-note lookup. No React, tested with vitest.
- `packages/design` – colours, fonts, the mark, the follow-pause rule.
- `scripts/` – `check.ts` (content checker), `build-content.ts` (publishes content into `apps/app/public`), `align.py` and `variants.py` (forced alignment, picking readings), `preview.ts` (a review page per poem).
- `design/` – the HTML prototypes the app follows (0.3 identity, 0.4 listening).
- `media/` – downloads, app audio and work files. Gitignored; audio will move to R2.

## Commands

Run through mise so bun, node and caddy match `mise.toml`: `mise exec -- bun run <script>`.

- `bun run dev` – publishes content, then starts Expo for web on port 8081.
- `bun run check` – content check, typecheck, unit tests.
- `bun run test:e2e` – Playwright against the dev server; `BASE_URL=http://localhost:8090` tests the production build instead.
- `bun run web:build`, then `bun run web:serve` – the exported site through Caddy on port 8090.

## Rules

- The verse text follows the recording. Where editions differ, `scripts/variants.py` decides what the reciter says; word cards show the dictionary form in `head`.
- Arabic verses are always on screen and always right-to-left. The UI flips with the language: English is left-to-right, including the progress bar and controls.
- Saffron (`accent`) is for the nuqta and active marks, never body text.
- Use `Dir` for a box with its own direction. React Native Web ignores the `direction` style.
- Under `Link asChild`, pass a flattened style object, never an array or a function.
- Fast-changing values (the playback clock) go through `lib/store` with a selector, so only what reads them re-renders.
- Published files are read leniently. A change older apps can't read goes in a new `v2/` folder.
- Report web checks and native device checks separately. Native audio (background, lock screen) is untested so far.
