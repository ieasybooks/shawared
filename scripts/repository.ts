import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** SHAWARED_ROOT selects a fixture tree; otherwise scripts use this checkout. */
export const root = (): string => process.env.SHAWARED_ROOT ?? join(import.meta.dir, "..");

const isDirectory = (path: string) => existsSync(path) && statSync(path).isDirectory();

export const directories = (path: string): string[] =>
  isDirectory(path)
    ? readdirSync(path)
        .filter((name) => isDirectory(join(path, name)))
        .sort()
    : [];

/** Keep malformed JSON filenames visible to authoring diagnostics; optional directories may be absent. */
export const jsonFiles = (path: string): string[] =>
  isDirectory(path)
    ? readdirSync(path)
        .filter((name) => name.endsWith(".json"))
        .sort()
    : [];

type LanguageFile = { lang: string; source?: string };

export function parseLanguageFile(name: string): LanguageFile | null {
  const match = /^([a-z]{2})(?:\.([a-z0-9-]+))?\.json$/.exec(name);
  return match ? { lang: match[1]!, ...(match[2] ? { source: match[2] } : {}) } : null;
}

/** Source precedence belongs to the publisher; authoring tools keep the directory's order. */
export const languageFiles = (path: string): string[] => readdirSync(path).filter((name) => parseLanguageFile(name) !== null);
