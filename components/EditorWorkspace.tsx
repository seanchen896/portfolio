"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorLogin } from "./EditorLogin";
import { ProjectEditor } from "./ProjectEditor";
import { PhotographyEditor } from "./PhotographyEditor";
import { emptyPhotography, type PhotographyData } from "@/lib/photography";
import { EditorSession } from "./EditorSession";
import type { Project } from "@/lib/projects";
import type { ResumeSettings } from "@/lib/site-settings";

type Workspace = { photography?: PhotographyData; photographyVersion?: string; projects: Omit<Project, "index">[]; version: string; resume: ResumeSettings };

export function EditorWorkspace() {
  const [session, setSession] = useState<{ token: string; workspace: Workspace } | null>(null);
  const [tab, setTab] = useState<"engineering" | "photography">("engineering");
  const [notice, setNotice] = useState("");
  const attachedToken = useRef<string | null>(null);
  const lock = useCallback((message: string) => { setNotice(message); setSession(null); }, []);

  async function unlock(token: string) {
    const response = await fetch("/api/editor", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setSession({ token, workspace: result }); setNotice("");
  }
  useEffect(() => {
    if (!session) return;
    const token = session.token;
    attachedToken.current = token;
    let idle: ReturnType<typeof setTimeout>;
    function revoke() {
      void fetch("/api/editor/session", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "logout" }), keepalive: true }).catch(() => {});
    }
    function activity() { clearTimeout(idle); idle = setTimeout(() => lock("Editor locked after five minutes of inactivity."), 5 * 60 * 1000); }
    function leave() { revoke(); lock("Editor locked. Enter your password to continue."); }
    function restore(event: PageTransitionEvent) { if (event.persisted) leave(); }
    activity();
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", restore);
    for (const event of ["pointerdown", "keydown", "input", "scroll"]) window.addEventListener(event, activity, { passive: true });
    return () => {
      clearTimeout(idle);
      if (attachedToken.current === token) attachedToken.current = null;
      // React Strict Mode/Fast Refresh may immediately reattach the same visit.
      queueMicrotask(() => { if (attachedToken.current !== token) revoke(); });
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", restore);
      for (const event of ["pointerdown", "keydown", "input", "scroll"]) window.removeEventListener(event, activity);
    };
  }, [session, lock]);

  async function request(url: string, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${session?.token ?? ""}`);
    const response = await fetch(url, { ...init, headers, cache: "no-store" });
    if (response.status === 401) lock("Editor locked. Enter your password to continue.");
    return response;
  }
  if (!session) return <EditorLogin onUnlock={unlock} notice={notice} />;
  return <EditorSession.Provider value={request}>
    <nav className="editor-portfolio-tabs" role="tablist" aria-label="Portfolio editor">{(["engineering", "photography"] as const).map(value => <button type="button" role="tab" id={`editor-tab-${value}`} aria-selected={tab === value} aria-controls={`editor-panel-${value}`} tabIndex={tab === value ? 0 : -1} key={value} onClick={() => setTab(value)} onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const next = value === "engineering" ? "photography" : "engineering"; setTab(next); document.getElementById(`editor-tab-${next}`)?.focus(); } }}>{value === "engineering" ? "Engineering" : "Photography"}</button>)}</nav>
    <div id="editor-panel-engineering" role="tabpanel" aria-labelledby="editor-tab-engineering" hidden={tab !== "engineering"}><ProjectEditor initial={session.workspace.projects} initialVersion={session.workspace.version} resume={session.workspace.resume} /></div>
    <div id="editor-panel-photography" role="tabpanel" aria-labelledby="editor-tab-photography" hidden={tab !== "photography"}><PhotographyEditor initial={session.workspace.photography ?? emptyPhotography()} initialVersion={session.workspace.photographyVersion ?? ""} /></div>
  </EditorSession.Provider>;
}
