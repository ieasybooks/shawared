# Shawared · شوارد

Arabic poetry as it is recited: hear it, read it, understand it. Each recording plays with its verses lighting up half by half, with translations, explanations and word meanings alongside.

One Expo app for iOS, Android and web, with content as JSON in git. See [AGENTS.md](AGENTS.md) for the layout and [docs/content-format.md](docs/content-format.md) for the content.

```sh
mise install
mise exec -- bun install
mise exec -- bun run dev        # web on http://localhost:8081
mise exec -- bun run check      # content, types, unit tests
```

## License

- **Code:** [PolyForm Noncommercial License 1.0.0](LICENSE.md). You may use, change and share it for any noncommercial purpose, and commercial use needs our permission. Required Notice: Copyright 2026 الكتب المُيسّرة (EasyBooks).
- **Content:** [CC BY-NC-SA 4.0](LICENSE-CONTENT.txt), with attribution, noncommercially, and sharing changes under the same terms. That covers everything in `content/`: the edited and vowelled texts, explanations, word meanings, translations, notes, sources and timings. It also covers our store listings, screenshots and design images.
- **Not covered by either:**
  - The Shawared name and mark.
  - The classical poems themselves, which are in the public domain.
  - The recordings, which belong to their reciters and aren't in this repository.
  - The fonts, from Google Fonts under the SIL Open Font License.
  - Third-party dependencies, under their own licenses.
