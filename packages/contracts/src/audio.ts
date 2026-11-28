/** A recording's published key, before or after its immutable upload. */
export const AUDIO_KEY_RE = /^([a-z0-9-]+)\/([a-z0-9-]+)(?:\.([0-9a-f]{12}))?\.m4a$/;

export type AudioKey = { poem: string; recitation: string; hash?: string };

export function parseAudioKey(key: string): AudioKey | null {
  const m = AUDIO_KEY_RE.exec(key);
  if (!m) return null;
  return { poem: m[1]!, recitation: m[2]!, ...(m[3] ? { hash: m[3] } : {}) };
}

/** Local sources keep this name even after their published key gains a hash. */
export const audioSourceKey = (poem: string, recitation: string): string => `${poem}/${recitation}.m4a`;
