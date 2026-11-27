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

Completed independent rechecks of the tools/contracts/routes, player/saved/downloads,
and listening/preferences boundaries. The final review resolved these remaining
links and ineffective tests:

1. Recording identity now includes its immutable audio key. Replacing a recording
   cannot reuse the former audio's clock/timings; changing language for the same
   audio still preserves playback. A later bundle can supply missing timings
   without restarting audio or seeking.
2. Preference restoration uses a private apply operation; the public continuous
   playback command always persists. Tests start fresh player/queue modules,
   removing the private-state reset and test-only queue-reset API.
3. Panel measurements are invalidated if scrolling changes their coordinates
   before asynchronous measurement finishes. They do not trigger automatic
   scrolling after a manual scroll. Verse cleanup clears cancelled frame state
   so an Expo Activity route can resume its reveals after returning.
   Verse following now distinguishes reader scroll input from the browser's
   automatic offset adjustments when translations resize the list. Native drag,
   web touch, wheel and scrolling keys initiate the five-second pause; momentum
   extends it. Layout changes still bring the current verse fully into view.
4. Browser tests share an explicit hydration signal, independent of React's
   private DOM properties and network idleness. The baseline phone-search race
   is covered by this readiness contract; first-paint tests assert the signal
   remains false while scripts are held back.
5. Search ranking now has competing title/opening matches and ordering ties.
   Kashida tests require an actual stretch and a real wide-space report. Android
   signing tests assert preservation of unrelated configuration. Audio publishing
   tests use synthetic content instead of copies of editorial poems. Deployment
   decisions remain tested through the public workflow; the duplicate mapping
   test and its test-only export are gone.
6. Saved-list browser coverage now verifies the active Media Session title and
   reordered next poem, rather than a poem title that was already in the list.
   Implementation-restatement comments are removed; external constraints and
   domain rules remain documented.

Independent reviewers found no remaining issue worth fixing in their scopes.
All 663 published JSON files remain byte-identical, and the application import
graph has no cycles. Final validation is recorded below.

## Final validation

- Content validation, both TypeScript projects, 230 TypeScript tests and 9
  standard-library Python tests pass. Authoring content, audio/timing manifests
  and artwork have no diff.
- The test production export succeeds, with 796 sitemap pages. All 663 published
  JSON files retain their original paths and SHA-256 digests.
- Reviewed 76 before/after screenshots in Arabic and English on phone and desktop,
  including night mode, searches, filters, sort menus, directory/detail pages,
  poem views and information panels. 70 pairs are pixel-identical; the other six
  differ only at 1–27 antialiased edge pixels each (less than 0.01% per image),
  with unchanged content and layout. No runtime errors occurred during capture.
  Sheet comparisons wait for the animation to finish; original captures are
  preserved alongside the settled ones.
- iOS and Android production JavaScript/Hermes exports both pass. These are bundle
  checks, not physical-device checks. Native background/lock-screen audio and
  offline behavior still use the device checklist in `docs/playback.md`.
- The full production browser/hosting run passed 288 cases and skipped 22
  platform-specific cases. Its two failing translation-layout cases led to a
  corrected behavioral assertion and the scroll-intent fix above. The final
  listening rerun passes all 38 cases, including translation resizing, real
  phone touch swipes, desktop wheel input, keyboard scrolling, and the existing
  playback, panel, retained-route and geometry checks. No failures remain from
  the full run. Typechecking and formatting also pass after the final fix.
- The production release build and Wrangler deployment dry run pass. The export
  contains no recordings and points to `https://audio.shawared.com` as required.

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
