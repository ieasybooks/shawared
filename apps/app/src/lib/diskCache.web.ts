// On the web the browser's HTTP cache keeps the files and revalidates them with
// their ETag (see `cache: "no-cache"` in content.ts), so there is nothing to store.
export async function readCached(_path: string): Promise<{ text: string; etag?: string } | null> {
  return null;
}

export async function writeCached(_path: string, _text: string, _etag: string | null) {}
