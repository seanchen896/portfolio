import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const sessionCookie = "portfolio-editor";
export const sessionLifetime = 8 * 60 * 60;

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
  return `${expiry}.${sign(expiry)}`;
}
export async function editorAuthenticated() {
  if (!process.env.EDITOR_SESSION_SECRET) return false;
  const token = (await cookies()).get(sessionCookie)?.value ?? "";
  const [expiry, signature, extra] = token.split(".");
  return !extra && !!expiry && !!signature && Number(expiry) > Date.now() && equal(signature, sign(expiry));
}
