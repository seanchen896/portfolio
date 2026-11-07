import { NextRequest, NextResponse } from "next/server";
import { createSession, localRequest, passwordMatches, sessionCookie, sessionLifetime } from "@/lib/editor-auth";

// The editor is local-only, so use a shared attempt budget instead of trusting IP headers.
const state = globalThis as typeof globalThis & { editorAttempts?: { count: number; until: number } };
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!localRequest(request)) return NextResponse.json({ error: "Use the editor on localhost." }, { status: 403 });
  try {
    const data = await request.json();
    if (data.action === "logout") {
      const response = NextResponse.json({ ok: true });
      response.cookies.set(sessionCookie, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
      return response;
    }
    if (!state.editorAttempts || Date.now() > state.editorAttempts.until) state.editorAttempts = { count: 0, until: Date.now() + 5 * 60 * 1000 };
    if (state.editorAttempts.count >= 5) return NextResponse.json({ error: "Too many attempts. Try again in five minutes." }, { status: 429 });
    if (!passwordMatches(data.password)) {
      state.editorAttempts.count++;
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }
    state.editorAttempts.count = 0;
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie, createSession(), { httpOnly: true, sameSite: "strict", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: sessionLifetime });
    return response;
  } catch { return NextResponse.json({ error: "Unable to sign in." }, { status: 400 }); }
}
