import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const cloudStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const blobKey = (name: string) => `portfolio/${process.env.VERCEL_ENV || "development"}/${name}`;
export class SaveConflict extends Error {}
export function editorConfigurationError() {
  if (!process.env.EDITOR_PASSWORD_HASH || !process.env.EDITOR_SESSION_SECRET) return "Editor setup needed: configure EDITOR_PASSWORD_HASH and EDITOR_SESSION_SECRET in the server environment.";
  if (process.env.NODE_ENV === "production" && !cloudStorage()) return "Editor setup needed: connect a private Vercel Blob store to this project, then redeploy.";
  return "";
}

export async function readBlobRecord(name: string) {
  const result = await get(blobKey(name), { access: "private", useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error("Unable to read saved content.");
  return { text: await new Response(result.stream).text(), etag: result.blob.etag };
}
export async function writeBlobRecord(name: string, text: string, etag?: string) {
  try {
    await put(blobKey(name), text, { access: "private", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 60, ...(etag ? { ifMatch: etag } : { allowOverwrite: false }) });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || (error instanceof Error && /already exists/i.test(error.message))) throw new SaveConflict("Content changed in another editor. Reload before saving.");
    throw error;
  }
}
export type ContentFile = "projects.json" | "photography.json" | "site-settings.json";
export async function readContent(name: ContentFile) {
  if (cloudStorage()) {
    const saved = await readBlobRecord(`content/${name}`);
    if (saved) return saved.text;
  }
  // Existing checked-in content is the initial value; never seed or reset a live store.
  return readFile(path.join(process.cwd(), "content", name), "utf8");
}
const normalized = (value: string) => value.replace(/\r\n/g, "\n");
let localSave = Promise.resolve();
export async function saveContent(name: ContentFile, text: string, version: string) {
  const save = async () => {
    const record = cloudStorage() ? await readBlobRecord(`content/${name}`) : null;
    const current = record?.text ?? await readFile(path.join(process.cwd(), "content", name), "utf8");
    if (normalized(version) !== normalized(current)) throw new SaveConflict("Content changed since you opened the editor. Reload before saving.");
    if (cloudStorage()) return writeBlobRecord(`content/${name}`, text, record?.etag);
    const destination = path.join(process.cwd(), "content", name);
    const temporary = `${destination}.${randomUUID()}.tmp`;
    await writeFile(temporary, text); await rename(temporary, destination);
  };
  if (cloudStorage()) return save();
  const pending = localSave.then(save);
  localSave = pending.catch(() => {});
  return pending;
}
export async function saveMedia(folder: string, name: string, bytes: Buffer, contentType?: string) {
  if (cloudStorage()) {
    await put(blobKey(`media/${folder}/${name}`), bytes, { access: "private", addRandomSuffix: false, contentType, cacheControlMaxAge: 31536000 });
    return `/media/${folder}/${name}`;
  }
  const directory = path.join(process.cwd(), "public", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `/${folder}/${name}`;
}
