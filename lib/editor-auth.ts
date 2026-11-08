import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { cloudStorage, readBlobRecord, writeBlobRecord, SaveConflict } from "./editor-storage";

export const sessionCookie = "portfolio-editor";
export const sessionLifetime = 30 * 60;
const state = globalThis as typeof globalThis & { portfolioEditorSessions?: Map<string, number> };
const sessions = state.portfolioEditorSessions ??= new Map<string, number>();

export function localRequest(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return origin.host === request.headers.get("host") && (process.env.NODE_ENV === "production" ? origin.protocol === "https:" : ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname));
  } catch { return false; }
}
function equal(a: string, b: string) {
  const x = Buffer.from(a); const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function passwordMatches(password: unknown) {
  const [salt, hash] = (process.env.EDITOR_PASSWORD_HASH ?? "").split(":");
  return typeof password === "string" && password.length <= 128 && !!salt && !!hash && equal(scryptSync(password, salt, 64).toString("hex"), hash);
}
function sign(value: string) {
  const secret = process.env.EDITOR_SESSION_SECRET;
  if (!secret) throw new Error("Editor session secret is missing.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export async function createSession() {
  const expiry = String(Date.now() + sessionLifetime * 1000);
  const value = `${randomBytes(24).toString("hex")}.${expiry}`;
  const token = `${value}.${sign(value)}`;
  for (const [key, expires] of sessions) if (expires <= Date.now()) sessions.delete(key);
  if (cloudStorage()) await writeBlobRecord(sessionKey(token), JSON.stringify({ expiry: Number(expiry) }));
  else sessions.set(token, Number(expiry));
  return token;
}
const sessionKey = (token: string) => `auth/sessions/${sign(token)}.json`;
export async function revokeSession(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (cloudStorage()) {
    // The record path is an HMAC, never the credential itself. Persist revocation across instances.
    const record = await readBlobRecord(sessionKey(token));
    if (record) await writeBlobRecord(sessionKey(token), JSON.stringify({ expiry: 0 }), record.etag);
  } else sessions.delete(token);
}
export async function editorAuthenticated(request: NextRequest) {
  if (!process.env.EDITOR_SESSION_SECRET) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const [nonce, expiry, signature, extra] = token.split(".");
  if (extra || !nonce || !expiry || !signature || !Number.isFinite(Number(expiry)) || Number(expiry) <= Date.now() || !equal(signature, sign(`${nonce}.${expiry}`))) return false;
  if (!cloudStorage()) return sessions.has(token);
  const record = await readBlobRecord(sessionKey(token));
  return !!record && JSON.parse(record.text).expiry === Number(expiry);
}

// Reserve an attempt before checking the password; concurrent serverless instances share this budget.
export async function reserveLoginAttempt() {
  if (!cloudStorage()) return true;
  const key = `auth/attempts/${sign("editor-login-budget")}.json`;
  for (let retry = 0; retry < 5; retry++) {
    const record = await readBlobRecord(key);
    const current = record ? JSON.parse(record.text) as { count: number; until: number } : null;
    const budget = current && current.until > Date.now() ? current : { count: 0, until: Date.now() + 5 * 60 * 1000 };
    if (budget.count >= 5) return false;
    try { await writeBlobRecord(key, JSON.stringify({ ...budget, count: budget.count + 1 }), record?.etag); return true; }
    catch (error) { if (!(error instanceof SaveConflict)) throw error; }
  }
  return false;
}

export async function resetLoginAttempts() {
  if (!cloudStorage()) return;
  const key = `auth/attempts/${sign("editor-login-budget")}.json`;
  const record = await readBlobRecord(key);
  if (!record) return;
  try { await writeBlobRecord(key, JSON.stringify({ count: 0, until: Date.now() + 5 * 60 * 1000 }), record.etag); }
  catch (error) { if (!(error instanceof SaveConflict)) throw error; }
}
