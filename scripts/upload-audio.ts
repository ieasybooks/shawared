// Uploads each recording whose source is in media/audio to audio.shawared.com
// (the shawared-audio bucket) under its key, once, and writes the key into its
// recitation's `audio` field (scripts/recordings.ts). Commit the changed recitation
// files: CI never has the recordings, only their keys.
//
// Run it on the Mac with the recordings, with the bucket's upload keys from the
// vault. From an ieasybooks/infrastructure checkout:
//
//   mise run vault:run SHAWARED_AUDIO_ACCESS_KEY_ID SHAWARED_AUDIO_SECRET_ACCESS_KEY -- \
//     bun run --cwd ../shawared audio:upload
//
// A key already in the bucket holds the same bytes, so it's left alone.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { CONTENT_TYPE, IMMUTABLE, keyFor, recordings, root, sourcePath, type Recording } from "./recordings.ts";

export type Bucket = {
  exists(key: string): Promise<boolean>;
  put(key: string, bytes: Uint8Array): Promise<void>;
};

export type UploadResult = { uploaded: string[]; present: string[]; updated: string[]; noSource: string[] };

// The `audio` line of a recitation file, changed in place so the file keeps
// its formatting.
export function withKey(text: string, recording: Recording, key: string): string {
  const line = `"audio": ${JSON.stringify(recording.audio)}`;
  if (text.split(line).length !== 2) throw new Error(`${recording.file}: expected one ${line}`);
  return text.replace(line, `"audio": ${JSON.stringify(key)}`);
}

export async function uploadAudio(rootDir: string, bucket: Bucket, log: (line: string) => void): Promise<UploadResult> {
  const result: UploadResult = { uploaded: [], present: [], updated: [], noSource: [] };
  for (const recording of recordings(rootDir)) {
    const source = sourcePath(rootDir, recording.poem, recording.recitation);
    if (!existsSync(source)) {
      result.noSource.push(relative(rootDir, source));
      continue;
    }
    const key = keyFor(recording.poem, recording.recitation, readFileSync(source));
    if (await bucket.exists(key)) {
      result.present.push(key);
    } else {
      log(`uploading ${key}`);
      await bucket.put(key, readFileSync(source));
      result.uploaded.push(key);
    }
    if (recording.audio !== key) {
      writeFileSync(recording.file, withKey(readFileSync(recording.file, "utf8"), recording, key));
      result.updated.push(relative(rootDir, recording.file));
    }
  }
  return result;
}

// shawared-audio through R2's S3 API. Bun's S3 client can't set Cache-Control,
// so each upload is a presigned PUT that sends it, which R2 keeps as the
// object's own header.
export function r2Bucket(accessKeyId: string, secretAccessKey: string): Bucket {
  const client = new Bun.S3Client({
    accessKeyId,
    secretAccessKey,
    bucket: "shawared-audio",
    endpoint: "https://aaed7434338705aa46de5e4e3575e02b.r2.cloudflarestorage.com",
    region: "auto",
  });
  return {
    exists: (key) => client.exists(key),
    async put(key, bytes) {
      const response = await fetch(client.presign(key, { method: "PUT", expiresIn: 600 }), {
        method: "PUT",
        headers: { "Content-Type": CONTENT_TYPE, "Cache-Control": IMMUTABLE },
        body: new Uint8Array(bytes),
      });
      if (!response.ok) throw new Error(`uploading ${key}: HTTP ${response.status}`);
    },
  };
}

if (import.meta.main) {
  const id = process.env.SHAWARED_AUDIO_ACCESS_KEY_ID;
  const secret = process.env.SHAWARED_AUDIO_SECRET_ACCESS_KEY;
  if (!id || !secret) {
    console.error(
      "SHAWARED_AUDIO_ACCESS_KEY_ID and SHAWARED_AUDIO_SECRET_ACCESS_KEY must hold the bucket's upload keys; see the top of this file.",
    );
    process.exit(2);
  }
  const rootDir = root();
  const r = await uploadAudio(rootDir, r2Bucket(id, secret), (line) => console.log(line));
  console.log(`audio: ${r.uploaded.length} uploaded, ${r.present.length} already there, ${r.updated.length} recitation files updated`);
  for (const file of r.updated) console.log(`  updated ${file}: commit it`);
  if (r.noSource.length) console.warn(`no source, so not uploaded: ${r.noSource.join(", ")}`);
}
