"use client";
import { useEffect, useState, type FormEvent } from "react";
export function EditorLogin({ onUnlock, notice }: { onUnlock: (token: string) => Promise<void>; notice?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      const response = await fetch("/api/editor/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await onUnlock(result.token);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); setBusy(false); }
  }
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
    <p className="label text-ink-soft">Private workspace</p><h1 className="serif mt-3 text-5xl">Project editor</h1>
    <p className="mt-4 text-sm text-ink-soft">Enter your password to update your portfolio. The editor locks automatically when you leave, reload, or stay inactive for five minutes.</p>
    {notice && <p role="status" className="mt-4 text-sm">{notice}</p>}
    <form method="post" onSubmit={login} className="mt-8">
      <label className="text-sm">Password<input autoFocus required name="password" type="password" autoComplete="current-password" maxLength={128} className="mt-2 w-full rounded border border-line bg-white/50 p-3" /></label>
      <button disabled={busy || !ready} className="mt-5 w-full rounded bg-ink px-5 py-3 text-paper disabled:opacity-50">{busy ? "Signing in…" : "Unlock editor"}</button>
      <p role="alert" className="mt-4 text-sm">{error}</p>
    </form>
    <a href="/" className="mt-6 text-sm underline">← Back to website</a>
  </main>;
}
