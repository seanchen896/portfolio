import { editorConfigurationError } from "@/lib/editor-storage";
import { NextRequest, NextResponse } from "next/server";
import { createSession, localRequest, passwordMatches, revokeSession, reserveLoginAttempt, resetLoginAttempts, sessionCookie } from "@/lib/editor-auth";

// A local attempt budget supplements the shared production budget.
const state = globalThis as typeof globalThis & { editorAttempts?: { count: number; until: number } };
export async function POST(request: NextRequest) {
  const setupError = editorConfigurationError();
  if (setupError) return NextResponse.json({ error: setupError }, { status: 503 });
  if (!localRequest(request)) return NextResponse.json({ error: "Open the editor on this website to sign in." }, { status: 403 });
  try {
    const data = await request.json();
    if (data.action === "logout") {
      await revokeSession(request);
      const response = NextResponse.json({ ok: true });
      response.cookies.set(sessionCookie, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
      return response;
    }
    if (!state.editorAttempts || Date.now() > state.editorAttempts.until) state.editorAttempts = { count: 0, until: Date.now() + 5 * 60 * 1000 };
    if (state.editorAttempts.count >= 5 || !(await reserveLoginAttempt())) return NextResponse.json({ error: "Too many attempts. Try again in five minutes." }, { status: 429 });
    if (!passwordMatches(data.password)) {
      state.editorAttempts.count++;
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
    state.editorAttempts.count = 0;
    await resetLoginAttempts();
    const response = NextResponse.json({ token: await createSession() }, { headers: { "Cache-Control": "no-store" } });
    // Remove the previous persistent login cookie. Visits now unlock in memory only.
    response.cookies.set(sessionCookie, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
    return response;
  } catch { return NextResponse.json({ error: "Unable to sign in." }, { status: 400 }); }
}
