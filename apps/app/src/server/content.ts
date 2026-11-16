import { bundlePath, Catalog, catalogPath, PersonBundle, personPath, PoemBundle, type PersonKind, type UiLang } from "@shawared/contracts";
import type { z } from "zod";

// The published content (public/content), read while web pages are rendered ahead of time:
// by `expo export`, and by the dev server. Route files reach this only from `loader`,
// `generateMetadata` and `generateStaticParams`, which never run in a browser or an app.
// Node's modules are looked up at run time, so no bundle ever tries to include them.

const ROOT = "public/content";
const cache = new Map<string, { mtime: number; data: unknown }>();

// The little of Node we use, typed here: the app has no Node types (it runs in browsers and apps).
type Fs = {
  statSync(path: string): { mtimeMs: number };
  readFileSync(path: string, encoding: "utf8"): string;
};
type NodeProcess = { cwd(): string; getBuiltinModule(id: string): unknown };
const node = () => process as unknown as NodeProcess;
const fs = () => node().getBuiltinModule("node:fs") as Fs;

/** A published file, or null when there is none. Re-read when it changes (the dev server). */
function read<S extends z.ZodType>(rel: string, schema: S): z.infer<S> | null {
  const file = `${node().cwd()}/${ROOT}/${rel}`;
  let mtime: number;
  try {
    mtime = fs().statSync(file).mtimeMs;
  } catch {
    return null;
  }
  const hit = cache.get(rel);
  if (hit?.mtime === mtime) return hit.data as z.infer<S>;
  const data = schema.parse(JSON.parse(fs().readFileSync(file, "utf8")));
  cache.set(rel, { mtime, data });
  return data;
}

export function catalog(): Catalog {
  const c = read(catalogPath(), Catalog);
  if (!c) throw new Error(`No published catalog in ${ROOT}: run \`bun run content:build\` first.`);
  return c;
}

export const poemBundle = (id: string, lang: UiLang) => read(bundlePath(id, lang), PoemBundle);

export const personBundle = (kind: PersonKind, id: string, lang: UiLang) => read(personPath(kind, id, lang), PersonBundle);
