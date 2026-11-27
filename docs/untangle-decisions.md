# Untangling Shawared

This refactor starts from `cc6e49d` and preserves the Arabic and English interfaces,
mobile and desktop layouts, routes, published content, saved data, and playback
controls. It follows three rounds of the `untangle-codebase` skill. Comment and
test cleanup are included; existing regression coverage stays in place until the
structural changes have been checked.

## Baseline and invariants

- Content check: 211 poems, 109 poets, 11 reciters. Local recording files are
  absent in this worktree; the existing audio-duration warnings are expected.
- TypeScript and all 174 existing unit tests pass.
- Preserve the 663 published JSON files byte for byte.
- Compare production-build screenshots in Arabic and English at phone and
  desktop widths, including search, filters, menus, collections, and poem panels.
  The baseline contains 76 screenshots and no browser runtime errors.
- The baseline browser suite passes 267 cases and skips 22 platform-specific cases.
  One phone search case failed because typing raced hydration; its isolated retry
  passed. The final test pass will replace its network-idle readiness assumption.
- Keep the web's CSS-driven first paint, hydration, asynchronous navigation,
  native audio adapters, and published-v1 compatibility.
- Keep all poetry, translations, explanations, timing manifests, and artwork
  unchanged.

## Round 1: stable rules and data boundaries

Completed: content/type checks, 190 TypeScript tests and 9 Python tests pass.
All 663 regenerated content files match the baseline. The application import
graph has no cycles. Source-language filename/discovery rules remain for the
final tools pass; the root and audio identity boundary is now shared.

1. Put shared language, catalog, meter, and location rules below their consumers.
   - Person-name fallback is duplicated in cards, playback metadata, screens,
     and server metadata; some consumers import a whole card module for it.
   - Meter IDs, names, and feet live in separate schema and interface tables.
   - Catalog selection is repeated in server rendering and client collections.
   - Site/audio origins recur in publishing scripts and application routing.
2. Keep route parsing separate from platform navigation and content transport.
   - Language-prefix parsing is repeated in navigation, page metadata, and
     settings; stable server code inherits platform imports from route helpers.
   - Content caching also decides which navigable page should be prefetched.
   - Tab registration repeats the navigation table's five mobile entries.
3. Give editorial tools explicit shared infrastructure.
   - Alignment and pronunciation comparison repeat Arabic romanization and
     acoustic-model setup; comparison relies on alignment having cached a model.
   - Local recording paths and immutable published audio keys are confused by
     preview and verification; timing-only alignment can replace a published key.
   - Repository discovery is imported through recording logic; source audio-key
     validation and parsing duplicate the same convention.

## Round 2: feature ownership and explicit lifecycle

Implemented: content/type checks, 225 TypeScript tests and 9 Python tests pass.
The 663 published content files still match the baseline, and the import graph
has no cycles. Production browser and screenshot validation follows the third
review, including asynchronous panel layout and retained-route playback.

1. Let each reusable piece own the behavior that changes with it.
   - Saved lists import `PersonRow` from a whole people-screen module.
   - Playlists import `PlayAll` from the library screen.
   - Directory grids, sort popovers, and collection links share one module despite
     unrelated reasons to change.
   - Era grouping is pure catalog logic located inside a visual filter module.
   - `ListPage` carries unused multi-column configuration and layout branches.
2. Represent playback readiness and timing rules explicitly.
   - Catalog entries use an empty timeline as a stand-in for an unloaded bundle;
     the queue then considers that item loaded and skips its timings.
   - Seek/repeat rules and clamping are repeated across controls and playback.
   - Unused player actions and impossible fallbacks obscure the live behavior.
3. Make saved-list changes depend on poem identity, not a filtered row index.
   - Withdrawn poems remain in storage but disappear from the rendered list;
     reorder controls currently apply visible indices to the stored list.
   - Saved persistence and feature actions have an inverted ownership boundary.
   - Playlist creation returns before its serialized local mutation finishes;
     navigation needs the completed mutation, not a guessed delay.
   - Download-reading hooks belong with the data rather than the download button,
     and every reader must initiate the idempotent device scan.
   - Download completion must distinguish successfully retained text from a loader
     that resolves without a bundle after a network failure.
4. Request word-note reveal through the panel lifecycle.
   - A word note waits 60/380 ms for measurements while its sheet independently
     animates for 340 ms. Reveal should follow layout/animation readiness.
   - The panel selector and complete open/follow actions belong to listening state,
     and hover state belongs to the poem page rather than a shared module global.
   - Verse reveal after typography changes should follow row/viewport measurement.
5. Put the settings storage/prepaint contract in a pure preferences module.
   - The server document imports the React settings provider just for its key;
     the screenshot tool repeats that key, and document/provider share an unnamed
     night-theme readiness protocol.

## Round 3: independent recheck and regression cleanup

Re-audit the resulting boundaries and special cases, then address remaining
worthwhile findings. Review comments for implementation restatement and tests
for real regression protection. In particular, inspect the search-ranking test's
single matching fixture, kashida assertions that accept empty output, the signing
test's newline-count proxy, and recording tests tied to live editorial files.

Keep required exceptions: native/web audio and disk adapters; offline stale data;
old catalogs without newer optional fields; Arabic verse direction inside English
pages; Expo route twins and server-only dynamic imports; first-paint and hidden
route layout safeguards; deliberate tooltip and audio timing behavior.

Downloaded audio must continue to match the exact published key used by its
timings. Retaining a prior file until replacement succeeds does not authorize
playing old bytes with new verse timings; an automatic fallback by poem ID would
change that guarantee and is not part of this refactor.

Detailed audit reports, command logs, dependency snapshots, and before/after
screenshots are kept locally under `media/review/untangle/`.
