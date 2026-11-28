import { Directory, File, Paths } from "expo-file-system";

// Published content kept on the device, with the ETag it was served with, so the
// app opens instantly and offline, and asks the server only whether it changed.
const root = new Directory(Paths.document, "content");

function files(path: string) {
  const parts = path.split("/");
  return { body: new File(root, ...parts), etag: new File(root, ...parts.slice(0, -1), `${parts.at(-1)}.etag`) };
}

export async function readCached(path: string): Promise<{ text: string; etag?: string } | null> {
  try {
    const f = files(path);
    if (!f.body.exists) return null;
    const text = await f.body.text();
    const etag = f.etag.exists ? await f.etag.text() : undefined;
    return etag ? { text, etag } : { text };
  } catch {
    return null;
  }
}

export async function writeCached(path: string, text: string, etag: string | null): Promise<boolean> {
  try {
    const f = files(path);
    const dir = new Directory(root, ...path.split("/").slice(0, -1));
    dir.create({ intermediates: true, idempotent: true });
    await f.body.write(text);
    if (etag) await f.etag.write(etag);
    else if (f.etag.exists) f.etag.delete();
    return true;
  } catch {
    return false;
  }
}
