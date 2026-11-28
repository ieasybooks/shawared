// The web doesn't download recordings: browsers stream them, and their own cache keeps what they
// can. The apps' version is downloads.ts.
import type { Catalog } from "@shawared/contracts";
import { ARTWORK_URL } from "./content";
import type { Downloads } from "./downloads";

export type { Downloads } from "./downloads";

export const canDownload = false;
const emptyDownloads: Downloads = { done: {}, active: {} };
export const useDownloads = <S>(select: (state: Downloads) => S): S => select(emptyDownloads);
export const useDownload = (_key: string | undefined): { done: boolean; progress: number | null } => ({ done: false, progress: null });
export const localAudio = (_key: string): string | null => null;
export const artworkUrl = () => ARTWORK_URL;
export const download = async (_poemId: string, _key: string, _langs: readonly string[]) => false;
export function cancel(_key: string) {}
export function remove(_key: string) {}
export async function refreshDownloads(_catalog: Catalog) {}
