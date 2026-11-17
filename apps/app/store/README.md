# Store listings

Everything the App Store, Google Play and AppGallery show besides the apps themselves, in Arabic and English. Each release sends it to the three stores and overwrites edits made in their consoles, so change the listings here. The format is [ieasybooks/release](https://github.com/ieasybooks/release)'s, which Mofied shares; its README lists every file, the stores' limits and the image sizes. `bun run store:check` checks this folder against them, with the release notes of `apps/app/package.json`'s version.

- `store.json`: the app's name in messages, each language's locale code in each store, and the App Store's links: support is [About Shawared](https://shawared.com/about), privacy is [the privacy policy](https://shawared.com/privacy) (both `apps/app/src/features/about/texts.ts`). The AppGallery app ID joins it once the app exists in AppGallery Connect.
- `ar/`, `en/`: the name, the App Store's name and subtitle, the short and full descriptions, and the App Store's keywords.
- `release-notes/<version>/<language>.txt`: what's new in each release, at most 500 characters.
- `review-notes/`: what App Review and AppGallery's reviewers read.
- `screenshots/`: drawn by `bun run store:screenshots` from the test build (`bun run web:build:test` first), so redraw them when the app's look changes:
  - five scenes per language: the library, a poem playing, a word's meaning at night, a poet, the meters;
  - sizes: an iPhone 6.9" (1320x2868) and an iPad 13" (2064x2752) for the App Store, and a 1080x1920 phone for Google Play and AppGallery;
  - the stores' icons, drawn from the mark;
  - Google Play's feature graphic.
