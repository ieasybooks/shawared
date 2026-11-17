// Checks that audio.shawared.com serves every recording the content refers to
// as shawared.com's player asks for it: a ranged request from its origin,
// answered with the start of the recording, CORS for shawared.com, and the
// immutable cache its hashed key allows. The web workflow runs it before each
// deploy, so a recording that isn't uploaded stops the deploy instead of
// breaking the player. It needs no credentials.
//
//   bun scripts/verify-audio.ts
import { relative } from "node:path";
import { AUDIO_HOST, CONTENT_TYPE, IMMUTABLE, parseKey, recordings, root, SITE, type Recording } from "./recordings.ts";

export async function audioProblems(rootDir: string, list: Recording[], fetchFn: typeof fetch = fetch): Promise<string[]> {
  const problems: string[] = [];
  for (const r of list) {
    const where = relative(rootDir, r.file);
    const key = parseKey(r.audio);
    if (!key?.hash) {
      problems.push(
        `${where}: ${r.audio} isn't uploaded yet; run bun run audio:upload where the recordings are, and commit the key it writes`,
      );
      continue;
    }
    const url = `${AUDIO_HOST}/${r.audio}`;
    let response: Response;
    try {
      response = await fetchFn(url, { headers: { Range: "bytes=0-0", Origin: SITE }, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      problems.push(`${url}: ${(error as Error).message}`);
      continue;
    }
    await response.body?.cancel();
    const headers = response.headers;
    const wrong: string[] = [];
    if (response.status !== 206) wrong.push(`HTTP ${response.status}, not 206`);
    else {
      if (!/^bytes 0-0\/[1-9]\d*$/.test(headers.get("content-range") ?? "")) wrong.push(`Content-Range ${headers.get("content-range")}`);
      if (headers.get("access-control-allow-origin") !== SITE)
        wrong.push(`Access-Control-Allow-Origin ${headers.get("access-control-allow-origin")}`);
      if (headers.get("content-type") !== CONTENT_TYPE) wrong.push(`Content-Type ${headers.get("content-type")}`);
      if (headers.get("cache-control") !== IMMUTABLE) wrong.push(`Cache-Control ${headers.get("cache-control")}`);
    }
    if (wrong.length) problems.push(`${url} (${where}): ${wrong.join(", ")}`);
  }
  return problems;
}

if (import.meta.main) {
  const rootDir = root();
  const list = recordings(rootDir);
  const problems = await audioProblems(rootDir, list);
  if (problems.length) {
    console.error(`audio.shawared.com doesn't serve every recording:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`audio.shawared.com serves all ${list.length} recording${list.length === 1 ? "" : "s"}.`);
}
