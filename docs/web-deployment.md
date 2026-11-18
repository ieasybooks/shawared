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

- Asset addresses. Expo names the files of packages under `node_modules/.bun` by their folders, with `@` and `+` (`@expo-google-fonts+amiri@0.4.1`), and Cloudflare answers such an address with a 307 to its percent-encoded form: a round trip before each font, and text waits for its font. Those files move to the same path with each such character made `_`, and every page, script and style sheet names the new address.
- Font preloads. Expo preloads every face the app loads, on every page. A page keeps the preloads of the faces its markup draws with, inline or through a class it uses; the others (English on an Arabic page) load when the app asks for them, out of the way of those it needs and of the scripts.
- `404.html`, the not-found page, which Cloudflare serves with a 404 for any unknown address.
- `en.html`, the English home page, moved from `en/index.html`. Cloudflare serves `/x` from `x.html` but redirects it to `/x/` when the page is `x/index.html`, and the sitemap and the pages' canonical links name `/en`.
- `_headers`. Files whose names carry their content's hash (`_expo/static`, `assets`) are cached for a year as immutable, each by its own rule: a rule with `*` would also mark the 404 page served for a missing one immutable. It fails the build if a file there has no hash, or if the rules pass Cloudflare's 100. Loaders (`_expo/loaders`) are served as JSON. Everything else (pages, loaders, `content/`, the sitemap) keeps Cloudflare's `public, max-age=0, must-revalidate`, so a deploy shows at once.
- For the release build, a check that the export holds no audio and that every page's `og:audio` points at `audio.shawared.com`.

`tests/hosting.spec.ts` checks each kind of file's status, type and caching, including names with `+`, `[id]` and `@`, a missing hashed file and an unknown page, and that every address in the sitemap and every file a page loads, its fonts included, answers without a redirect.

## Audio

Each recording is uploaded once, under a key with its content's hash, which never takes other bytes, so `audio.shawared.com` caches it as immutable. A new recording gets a new key. `scripts/recordings.ts` names a recording two ways:

- its source, `media/audio/<poem>/<recitation>.m4a`, on the Mac with the recordings;
- its key, the recitation's `audio` field: `<poem>/<recitation>.m4a` until it's uploaded, then `<poem>/<recitation>.<hash>.m4a`, with the first 12 hex digits of the source's SHA-256.

To publish recordings, upload them where they are, with the bucket's upload keys from the vault, then commit the recitation files the upload changed. From an ieasybooks/infrastructure checkout:

```sh
mise run vault:run SHAWARED_AUDIO_ACCESS_KEY_ID SHAWARED_AUDIO_SECRET_ACCESS_KEY -- \
  bun run --cwd ../shawared audio:upload
```

It uploads each recording whose key isn't in the bucket yet, with `Content-Type: audio/mp4` and `Cache-Control: public, max-age=31536000, immutable`, and writes its key into the recitation's `audio` field. A key already there holds the same bytes, so it's left alone.

`bun run content:check` warns about a recording that isn't uploaded yet, and fails when the local source isn't the uploaded recording its key names. `bun run audio:verify` asks `audio.shawared.com` for every recording the content names as shawared.com's player does, a ranged request from its origin, and fails unless each is uploaded and served with CORS for shawared.com and its immutable cache. Deploys run it first, so a recording that isn't uploaded stops the deploy instead of breaking the player.

## Checks

`.github/workflows/check.yml` runs on pull requests, and on each commit pushed to main before it deploys: `bun run check`, the test build and `bun run test:release`, and the release build with `bun run deploy:check`.

## Deploys

Each commit pushed to main deploys once its checks pass. When a release pull request's merge tags the apps, the same run deploys that commit and releases the apps from it ([releasing](releasing.md)). `.github/workflows/release-please.yml` runs `check.yml` on it, marks it with a **Checks** status saying how they ended, and once they passed calls `.github/workflows/web.yml`, which:

1. gets `SHAWARED_WEB_DEPLOY_TOKEN` from the vault, a token that can deploy the `shawared-web` Worker and nothing else;
2. compares the commit with the one live (`scripts/deploy-order.ts`);
3. checks `audio.shawared.com` serves every recording (`audio:verify`), builds the release, and deploys it with `wrangler deploy --message <commit> --tag <its first 12 digits>`;
4. checks shawared.com serves it (`scripts/check-live.ts`).

The site only moves forward along main. Each deploy records its full commit SHA as its Worker version's message, and `deploy-order.ts` reads the commit of the version serving all of the site's traffic, then asks GitHub how the new commit compares:

| The commit, against the live one | What happens |
| --- | --- |
| Newer | It deploys. |
| The same | Nothing uploads; the site is checked again, which is what re-running a deploy whose live check failed does. |
| Older | It's skipped: a newer commit is live. |
| Diverged, or the live version records no commit, or traffic is split between versions | The run fails; sort the site out by hand first. |

Deploys wait for each other in one queue (`queue: max`, up to 100) from reading the live commit to checking the site, so none can go live in between. GitHub starts queued runs roughly in order but doesn't promise it, so a commit that waited behind a newer one is skipped instead of putting the site back.

`check-live.ts` checks that the home page loads the new build's scripts, then that the sitemap and the published catalog are this build's, every address in the sitemap answers in its language without a redirect, a poem's loader is JSON, a hashed script is cached as immutable, an unknown address is a 404, and the recording a poem page links plays from `audio.shawared.com`. A deploy takes a few seconds to reach every location, and one that changes no script looks like the last until it has, so while the scripts and then anything else are off, it asks again every 10 seconds, for up to two minutes each.

### Who deploys

The vault serves the deploy token only in runs Ali (AliOsm) started: his pushes to main, and his runs of the workflows by hand. When someone else pushes, the checks still run and set the status, and the run ends with a note instead of deploying. Re-running it doesn't help, as a re-run keeps the pusher's identity. Ali deploys it by running **Release web** on main (Actions, Run workflow), which deploys main's newest commit once its **Checks** passed.

### By hand

With your Wrangler login, from a clean checkout of a main commit:

```sh
bun run audio:verify && bun run web:build:release
bun run --cwd apps/app deploy --message "$(git rev-parse HEAD)" --tag "$(git rev-parse --short=12 HEAD)"
bun scripts/check-live.ts
```

Always pass the full SHA as the message: without it, the next deploy stops because the live version doesn't record its commit.

To go back, revert the change on main: the revert is a new commit and deploys like any other. `bun run --cwd apps/app wrangler rollback` goes back at once, to a version that recorded its commit; the next push deploys main again.

### Vault access check

Run **Release please** on main with **access-check** ticked. It deploys nothing: it checks that the vault gives `web.yml`'s jobs Shawared's deploy token, and refuses them Mofied's, the store secrets and the audio upload keys.
