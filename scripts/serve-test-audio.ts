// Serves the stand-ins scripts/test-audio.ts makes on http://127.0.0.1:8788, as
// audio.shawared.com serves the recordings: by key, with Range requests (which
// the player needs to seek, and wrangler dev's local assets don't answer), for
// any origin. playwright.release.config.ts starts it.
import { existsSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import { TEST_AUDIO } from "./test-audio.ts";

Bun.serve({
  hostname: "127.0.0.1",
  port: 8788,
  fetch(request) {
    const key = decodeURIComponent(new URL(request.url).pathname).slice(1);
    // Playwright waits for the root to answer.
    if (key === "") return new Response("test audio");
    const file = normalize(join(TEST_AUDIO, key));
    if (!file.startsWith(`${TEST_AUDIO}/`) || !existsSync(file) || !statSync(file).isFile())
      return new Response("not found", { status: 404 });
    return new Response(Bun.file(file), { headers: { "Content-Type": "audio/mp4", "Access-Control-Allow-Origin": "*" } });
  },
});
console.log(`test audio on http://127.0.0.1:8788 from ${TEST_AUDIO}`);
