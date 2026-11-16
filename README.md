# Shawared · شوارد

Arabic poetry as it is recited: hear it, read it, understand it. Each recording plays with its verses lighting up half by half, with translations, explanations and word meanings alongside.

One Expo app for iOS, Android and web, with content as JSON in git. See [AGENTS.md](AGENTS.md) for the layout and [docs/content-format.md](docs/content-format.md) for the content.

```sh
mise install
mise exec -- bun install
mise exec -- bun run dev        # web on http://localhost:8081
mise exec -- bun run check      # content, types, unit tests
```
