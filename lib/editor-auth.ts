import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const sessionCookie = "portfolio-editor";
export const sessionLifetime = 30 * 60;
const state = globalThis as typeof globalThis & { portfolioEditorSessions?: Map<string, number> };
const sessions = state.portfolioEditorSessions ??= new Map<string, number>();

export function localRequest(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return origin.host === request.headers.get("host") && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
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
export function createSession() {
  const expiry = String(Date.now() + sessionLifetime * 1000);
  const value = `${randomBytes(24).toString("hex")}.${expiry}`;
  const token = `${value}.${sign(value)}`;
  for (const [key, expires] of sessions) if (expires <= Date.now()) sessions.delete(key);
  sessions.set(token, Number(expiry));
  return token;
}
export function revokeSession(request: NextRequest) {
  sessions.delete(request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "");
}
export async function editorAuthenticated(request: NextRequest) {
  if (!process.env.EDITOR_SESSION_SECRET) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const [nonce, expiry, signature, extra] = token.split(".");
  return !extra && !!nonce && !!expiry && !!signature && sessions.has(token) && Number(expiry) > Date.now() && equal(signature, sign(`${nonce}.${expiry}`));
}
