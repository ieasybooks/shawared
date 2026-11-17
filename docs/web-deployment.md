# Web deployment

shawared.com is the Expo app's web export, every page rendered ahead of time in both languages, served by the `shawared-web` Worker's static assets (`apps/app/wrangler.jsonc`). Recordings come from `audio.shawared.com`, the `shawared-audio` R2 bucket. [ieasybooks/infrastructure](https://github.com/ieasybooks/infrastructure) owns the zone, the bucket and the Worker's custom domain ("Shawared hosting" in its README); this repository owns the Worker's code and assets.

## Builds

| Command | For | Audio |
| --- | --- | --- |
| `bun run web:build`, then `bun run web:serve` | Looking at the site on the tailnet, through Caddy on port 8090 | The recordings in `media/audio`, copied into the export |
| `bun run web:build:test`, then `bun run test:release` | The browser and hosting tests, against the export as Cloudflare serves it (`wrangler dev` on 8787) | Silent stand-ins of each recording's length (`scripts/test-audio.ts`), on 127.0.0.1:8788, which answers Range requests as `audio.shawared.com` does and `wrangler dev` doesn't |
| `bun run web:build:release`, then `bun run deploy:check` | What deploys, and Wrangler's dry run of the upload | None in the export: the pages play `audio.shawared.com` |

The test and release builds export with an empty Metro cache (`export:web:clean`). Metro's transform cache is shared by every checkout on a machine and keeps the absolute paths of the files with loaders (Expo 58), so a cache filled by another checkout leaves the pages without their data and the export fails ("Failed to load loader data").

`scripts/web-release.ts` finishes the test and release exports:

- `404.html`, the not-found page, which Cloudflare serves with a 404 for any unknown address.
- `_headers`. Files whose names carry their content's hash (`_expo/static`, `assets`) are cached for a year as immutable, each by its own rule: a rule with `*` would also mark the 404 page served for a missing one immutable. It fails the build if a file there has no hash, or if the rules pass Cloudflare's 100. Loaders (`_expo/loaders`) are served as JSON. Everything else (pages, loaders, `content/`, the sitemap) keeps Cloudflare's `public, max-age=0, must-revalidate`, so a deploy shows at once.
- For the release build, a check that the export holds no audio and that every page's `og:audio` points at `audio.shawared.com`.

`tests/hosting.spec.ts` checks each kind of file's status, type and caching, including names with `+`, `[id]` and `@`, a missing hashed file and an unknown page.

## Audio

Each recording is uploaded once, under a key with its content's hash, which never takes other bytes, so `audio.shawared.com` caches it as immutable. A new recording gets a new key. `scripts/audio.ts` names a recording two ways:

- its source, `media/audio/<poem>/<recitation>.m4a`, on the Mac with the recordings;
- its key, the recitation's `audio` field: `<poem>/<recitation>.m4a` until it's uploaded, then `<poem>/<recitation>.<hash>.m4a`, with the first 12 hex digits of the source's SHA-256.

To publish recordings, upload them where they are, with the bucket's upload keys from the vault, then commit the recitation files the upload changed. From an ieasybooks/infrastructure checkout:

```sh
mise run vault:run SHAWARED_AUDIO_ACCESS_KEY_ID SHAWARED_AUDIO_SECRET_ACCESS_KEY -- \
  bun --cwd ../shawared run audio:upload
```

It uploads each recording whose key isn't in the bucket yet, with `Content-Type: audio/mp4` and `Cache-Control: public, max-age=31536000, immutable`, and writes its key into the recitation's `audio` field. A key already there holds the same bytes, so it's left alone.

`bun run content:check` warns about a recording that isn't uploaded yet, and fails when the local source isn't the uploaded recording its key names. `bun run audio:verify` asks `audio.shawared.com` for every recording the content names as shawared.com's player does, a ranged request from its origin, and fails unless each is uploaded and served with CORS for shawared.com and its immutable cache. Deploys run it first, so a recording that isn't uploaded stops the deploy instead of breaking the player.

## Checks

`.github/workflows/check.yml` runs on pull requests: `bun run check`, the test build and `bun run test:release`, and the release build with `bun run deploy:check`.
