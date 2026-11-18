# Releasing

shawared.com deploys every commit pushed to main ([web deployment](web-deployment.md)). The iOS and Android apps are released: [release-please](https://github.com/googleapis/release-please) versions them from the commit messages, and each version goes to the App Store, Google Play and AppGallery, whose reviewers publish it.

| Component                          | Folder                                                   | Tag                | Ships                                                                       |
| ---------------------------------- | -------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| apps                               | `apps/app`, with the store listing in `apps/app/store`   | `v0.2.0`           | The iOS and Android apps to the stores (`Release apps`, `release.yml`)      |
| contracts, design and listening    | `packages/*`                                             | `listening-v0.2.0` | Nothing themselves: their release raises the apps, which use every package |

Each component's version is its `package.json`'s. `release-please-config.json` sets the components up and `.release-please-manifest.json` holds their released versions. The iOS build number and the Android version code follow from the apps' version ([ieasybooks/release](#the-shared-release-tooling): 1.2.3 builds as 1002003), so a release never needs one raised by hand. The poems aren't part of any release: the apps load them from shawared.com, so a new poem reaches the apps once the site deploys.

## Commit messages

Commit titles follow [Conventional Commits](https://www.conventionalcommits.org/), and they decide the versions, whether a commit comes through a pull request or is pushed to main. With rebase merges every commit title counts; with squash merges, the pull request's title.

- `fix:` raises the patch version (0.2.0 → 0.2.1), and `feat:` the minor one (0.2.0 → 0.3.0). Before 1.0, a breaking change (`feat!:`, or a `BREAKING CHANGE:` footer) raises the minor version too.
- `chore:`, `docs:`, `test:`, `ci:`, `build:`, `refactor:`, `style:` and `content:` release nothing. A title that isn't a Conventional Commit releases nothing either, so a change to the apps under one never reaches the stores until a later `fix:` or `feat:` does.
- A commit counts for each component whose folder it changes. Changing a shared package releases that package, then the apps.

A scope (`fix(player): …`) only labels the changelog entry.

So everything that ships in the apps lives in `apps/app` or `packages/`. The root holds tooling: the pinned tools, tests, CI, scripts, content and its publishing. A `fix:` that changes only the root releases nothing, and the **Commits** check on pull requests (`.github/workflows/commits.yml`, `ieasybooks-release routing`) fails on one: every releasing commit, and a releasing title across the pull request's files, must change a component. Give such a change a type that releases nothing, or move what ships into its component.

## Releasing

1. Merge commits to main. After each push, the **Release please** workflow (`.github/workflows/release-please.yml`) opens or updates the release pull request, **chore: release main**, with each raised component's new version and its `CHANGELOG.md`.
2. When it raises the apps, write that version's store release notes in `apps/app/store/release-notes/<version>/ar.txt` and `en.txt` (at most 500 characters each), and anything else in `apps/app/store/` that should change, such as redrawn screenshots (`bun run store:screenshots`), in an ordinary pull request (`docs: …`, which releases nothing). The release pull request's **Release check** status fails until main has them. `bun run store:check` checks the same on your Mac, once `apps/app/package.json` has the new version.
3. Ali (`AliOsm`) squash-merges the release pull request. release-please tags the apps and creates their GitHub release. In the same run, the workflow runs every check (`check.yml`) on the commit it tagged, marks the commit with a **Checks** status saying how they ended, and once they passed deploys the commit to shawared.com (`web.yml`) and releases the apps (`release.yml`). Each release job checks out exactly that commit, never the tag by name, and first checks that the tag still points at it and that no newer apps release exists.

GitHub's checks on the release pull request wait for someone to approve them, since GitHub Actions opened it. They're not needed: the merge is checked on main before anything ships, and its **Release please** run keeps `bun.lock` in step with the new versions and sets the **Release check** status.

Only Ali's merge ships, because the vault serves the release secrets only in runs he started. If someone else merges the release pull request, the tag, the GitHub release and the checks still run, and the run ends with a note instead of shipping. Ali then runs **Release apps** (with **dry-run** unticked) on the `v` tag and **Release web** on main from the Actions tab.

Pushing a version tag by hand releases too: `v<version>`. The tag must match the apps' version on that commit, the commit's **Checks** status must say main's checks passed on it, so tag a commit from main, and no newer apps release may exist. The **Checks** status is the latest run's: a re-run whose checks fail, or that is cancelled, turns an earlier success into a failure or error.

## What the apps workflow does

| Job           | Runner | What it does                                                                                                                                                                                                                                                                                                                                                                              |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Check         | Linux  | Checks that the tag points at the commit being released (and, for a tag pushed by hand, that main's checks passed on it) and that no newer apps release exists, checks the version and `apps/app/store/` with the version's release notes, then runs the typecheck and unit tests.                                                                                                       |
| Build iOS     | macOS  | Generates the Xcode project, signs the App Store build with the Apple Distribution certificate in a throwaway keychain (creating or reusing an App Store provisioning profile through the App Store Connect API), and uploads it to App Store Connect, leaving the App Store version to the next job.                                                                                     |
| App Store     | Linux  | Waits for Apple to process the build, pulls an older version still waiting for review or in review back out and waits until Apple has finished (giving up, without submitting, after 15 minutes), then sends the listing, screenshots and reviewer notes and submits the version for review, released automatically once approved. A newer version in review stops it instead, untouched. |
| Build Android | Linux  | Generates the Android project and builds the AAB and APK for `armeabi-v7a`, `arm64-v8a` and `x86_64` (no phone runs 32-bit `x86`), signed with the apps' shared upload key (`apps/app/plugins/with-release-signing.js`), and checks the signer.                                                                                                                                          |
| Google Play   | Linux  | Sends the AAB to the production track with the listing, release notes and changed images. Managed Publishing is off, so Google publishes it once approved. Google Play takes only a draft for an app it has never published, so the app's first release goes up as a draft: send it for review in Play Console's Publishing overview.                                                                                                                                                                                                                                |
| AppGallery    | Linux  | `ieasybooks-release appgallery publish`: uploads the APK, updates the texts and any changed images, and submits the version, released once approved. While a version is still in review it stops before changing anything: the Publishing API can't cancel a review, so cancel it in AppGallery Connect and re-run the job.                                                               |

The store jobs are independent: one failing doesn't stop the others. The native builds run only here, in releases and dry runs, never in a push's checks, which keeps the macOS minutes for releases; `check.yml` only checks that fastlane loads the lanes.

## When a release fails

A re-run keeps the identity of whoever started the run, so it gets the release secrets only for a run Ali started.

Every job that uploads first checks that no newer apps release exists (`ieasybooks-release not-superseded`), and stops if one does. So re-running an older release's failed job after a newer release can't pull the newer one out of App Store review, and an older release whose checks finished after a newer one's uploads nothing. Re-run the newer release instead, or release a newer version.

| What failed                             | What to do                                                                                                                                                                                                                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The checks on the release commit        | If it was a flaky check, **Re-run failed jobs** in that run: it re-runs the checks, then the release jobs. If the commit is broken, fix it with a `fix:` commit and release the next version. The tag and GitHub release of the version that didn't ship stay; note that in its release notes. |
| A store job                             | Fix the cause and **Re-run failed jobs** in the run that failed. The table below says what each job does again.                                                                                                                                                                                |
| Nothing shipped: someone else merged    | Run **Release apps** (dry-run unticked) on the `v` tag, and **Release web** on main.                                                                                                                                                                                                           |
| Re-running the whole Release please run | Releases nothing: release-please has already created the release, so it finds nothing new.                                                                                                                                                                                                      |

| Job           | On a re-run                                                                                                                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build iOS     | Builds and uploads the IPA again. App Store Connect refuses a build number it already has, so once an upload went through, a failure after it means releasing the next version. The IPA, its dSYMs and `release.json` are kept for 14 days as the run's `ios` artifact. |
| App Store     | Reuses the uploaded build. If this version and build is already in review, it stops there without submitting again. If a newer version is in review, it stops without touching it.                                                                                      |
| Build Android | Builds the AAB and APK again; nothing reaches a store.                                                                                                                                                                                                                  |
| Google Play   | Uploads the AAB again, in a new edit. That works when the failed run's edit wasn't committed; once Google has the version code, it refuses it, and the next version is the way out.                                                                                     |
| AppGallery    | Uploads and binds the APK again. While a version is in review it stops before changing anything: cancel that review in AppGallery Connect, then re-run.                                                                                                                 |

## Rolling back

The stores don't take an older version than one they have, so fix forward with a `fix:` commit and release the next version. A version still in review can be pulled out in App Store Connect, Google Play Console or AppGallery Connect. The site rolls back on its own ([web deployment](web-deployment.md)).

## Dry runs

Any other `v*` tag is a dry run of the apps: push a throwaway one, such as `git tag v0-dry-run && git push origin v0-dry-run`, on the commit to test. Running the **Release apps** workflow by hand on a `v*` tag is a dry run too, unless **dry-run** is unticked. A dry run builds and signs both apps and checks everything without releasing:

- App Store Connect validates the signed IPA without taking it, and the App Store job only reads the app, saying which version it would pull out of review.
- Google Play checks the AAB and listing in an edit it never commits.
- AppGallery reports what it would upload, change and submit, or that a version in review would stop the release, and issues an upload URL without taking the APK.

A dry run uses no build number and needs no **Checks** status, but it needs the release notes of `apps/app/package.json`'s version, as `store check` does. Delete the throwaway tag afterwards: `git push origin :v0-dry-run && git tag -d v0-dry-run`. A dry run spends about 20 macOS minutes on the iOS build, the most expensive part of the Actions budget.

## Secrets

The workflows get everything from the ieasybooks vault through [`ieasybooks/vault`](https://github.com/ieasybooks/vault). `cloudflare/vault-secrets.tf` in ieasybooks/infrastructure lists them (`local.release_apps.shawared`) and shares them only with runs Ali started:

- the store secrets and the upload key with `release.yml`, on `v*` tags and as called by `release-please.yml` on main;
- the web's deploy token with `web.yml`, dispatched on main and as called by `release-please.yml` on main.

So each release workflow gets only its own secrets, even when `release-please.yml` calls both.

| Secret                                                                      | Used for                                                                                |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `APPLE_API_KEY`                                                             | App Store Connect: profiles, upload, listing and submission                             |
| `APPLE_DISTRIBUTION_CERTIFICATE`, `APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD` | Signing the iOS app                                                                     |
| `ANDROID_UPLOAD_KEYSTORE`, `ANDROID_UPLOAD_KEYSTORE_PASSWORD`               | Signing the AAB and APK: the upload key the ieasybooks apps share, except Mofied        |
| `GOOGLE_PLAY_SERVICE_ACCOUNT`                                               | Google Play                                                                             |
| `APPGALLERY_CONNECT_SERVICE_ACCOUNT`                                        | AppGallery                                                                              |
| `SHAWARED_WEB_DEPLOY_TOKEN`                                                 | Deploying shawared.com from `web.yml`: it can edit `shawared-web` and no other Worker |

To check those rules, run **Release please** by hand on main with **access-check** ticked (`gh workflow run release-please.yml --ref main -f access-check=true`). It releases nothing: `release.yml`'s and `web.yml`'s jobs each ask the vault for their own secrets, which must be served, and for the other's, Mofied's and the audio upload keys, which must be refused because no rule matches (the vault action's `expect-refused`). Its jobs have their own concurrency groups, so they neither wait for a release nor cancel one waiting. Run it after changing the vault's rules.

## Before the first release

Done once, by hand, in each store's console, with the bundle ID and package name `com.shawared.app`:

- **App Store Connect:** register the bundle ID in Certificates, Identifiers & Profiles, then create the app (primary language Arabic) with the name in `apps/app/store/ar/app-store-name.txt`, which must be free across the store. Fill in App Privacy (no data collected), the age rating, the price (free) and the availability.
- **Google Play Console:** create the app, enrol it in Play App Signing with the shared upload key, and upload the first AAB by hand (Google takes later ones through the API). Fill in the data safety form (no data collected or shared), the content rating, the target audience, and the foreground service declaration for media playback, which the background recitation uses.
- **AppGallery Connect:** create the app, sign it with the shared upload key as the APK is signed, and add its app ID to `apps/app/store/store.json` as `"appGallery": { "appId": "…" }`.

Then push a dry run tag (above) to check everything before the first release.

## The shared release tooling

The release commands and the App Store review helper come from [ieasybooks/release](https://github.com/ieasybooks/release), which ieasybooks apps share, pinned to one commit in three places:

- `@ieasybooks/release` in `package.json`, for the `ieasybooks-release` command;
- `@ieasybooks/release` in `apps/app/package.json`, whose `app.config.ts` imports the build numbers;
- the `ieasybooks-release` gem in the `Gemfile`, which the Fastfile's submit lane uses.

The workflows run the command from `node_modules/.bin`, never through `bunx`, which would download whatever npm has under that name if the package were missing. To take a newer version, change all three to the same commit in one pull request, then run `mise exec -- bun install` and `mise exec -- bundle lock`. Its README describes each command and the store folder's format.

## Running the steps on a Mac

fastlane runs on Ruby (pinned in `mise.toml`): `mise exec -- bundle install`. With the secrets from `mise run vault:run` in ieasybooks/infrastructure, the lanes in `fastlane/Fastfile` and `node_modules/.bin/ieasybooks-release appgallery publish --app apps/app <apk>` run as they do in the workflow; pass `dry_run:true` (or `--dry-run`) to check without releasing. `bun run fastlane:check` loads the Fastfile with its gems, as the checks do.
