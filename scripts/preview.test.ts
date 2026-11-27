import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { afterAll, expect, it } from "vitest";

const scratch = mkdtempSync(join(tmpdir(), "shawared-preview-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

it.each(["poem/take.m4a", "poem/take.0123456789ab.m4a"])("previews the local source when the published key is %s", (key) => {
  const root = mkdtempSync(join(scratch, "root-"));
  const dir = join(root, "content/poems/poem");
  mkdirSync(join(dir, "recitations"), { recursive: true });
  writeFileSync(join(dir, "poem.json"), JSON.stringify({ id: "poem", title: "قصيدة", poet: "poet", abyat: [] }));
  const recitation = JSON.stringify({ reciter: "performer", audio: key, timeline: [] });
  writeFileSync(join(dir, "recitations/take.json"), recitation);
  const source = join(root, "media/audio/poem/take.m4a");
  mkdirSync(join(source, ".."), { recursive: true });
  writeFileSync(source, "local source");

  const result = spawnSync("bun", [join(import.meta.dirname, "preview.ts"), "poem"], {
    encoding: "utf8",
    env: { ...process.env, SHAWARED_ROOT: root },
  });
  expect(result.status, result.stderr).toBe(0);
  const html = readFileSync(join(root, "media/preview/poem.html"), "utf8");
  const audio = { src: "" };
  const nodes: Record<string, object> = {
    "#audio": audio,
    "#title": {},
    "#meta": {},
    "#main": { addEventListener() {}, insertAdjacentHTML() {} },
  };
  runInNewContext(/<script>([\s\S]*?)<\/script>/.exec(html)![1]!, {
    document: { querySelector: (selector: string) => nodes[selector], querySelectorAll: () => [] },
    addEventListener() {},
    requestAnimationFrame() {},
  });

  expect(audio.src).toBe("../audio/poem/take.m4a");
  expect(readFileSync(join(root, "media/preview", audio.src), "utf8")).toBe("local source");
  expect(readFileSync(join(dir, "recitations/take.json"), "utf8")).toBe(recitation);
});
