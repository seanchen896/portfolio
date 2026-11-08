"use client";

import { useRef, useState, type FormEvent } from "react";
import type { ResumeSettings } from "@/lib/site-settings";
import { useEditorRequest } from "./EditorSession";

export function ResumeEditor({ initial, disabled, onBusyChange }: { initial: ResumeSettings; disabled: boolean; onBusyChange: (busy: boolean) => void }) {
  const editorRequest = useEditorRequest();
  const [resume, setResume] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const picker = useRef<HTMLInputElement>(null);

  async function update(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    onBusyChange(true); setMessage("");
    try {
      const data = new FormData(); data.set("action", "upload-resume"); data.set("file", file);
      const response = await editorRequest("/api/editor", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setResume(result.resume); setFile(null);
      if (picker.current) picker.current.value = "";
      setMessage("Résumé updated. All résumé links now download this version. Refresh the website preview if it is already open.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update résumé."); }
    finally { onBusyChange(false); }
  }

  return <section className="mt-8 rounded border border-line p-5 sm:p-6" aria-labelledby="resume-editor-heading">
    <h2 id="resume-editor-heading" className="serif text-3xl">Résumé download</h2>
    <p className="mt-2 text-sm text-ink-soft">Upload your latest résumé as a PDF, up to 25 MB. Updating here immediately changes every résumé link on your website. Previous files are kept.</p>
    <a className="mt-4 inline-block text-sm underline underline-offset-4" href={resume.src} target="_blank" rel="noreferrer">Current résumé: {resume.filename} ↗</a>
    <form onSubmit={update} className="mt-5 flex flex-wrap items-end gap-4">
      <label className="min-w-0 flex-1 text-sm">Updated résumé PDF<input ref={picker} type="file" accept=".pdf,application/pdf" disabled={disabled} onChange={event => { setFile(event.target.files?.[0] ?? null); setMessage(""); }} className="mt-2 block w-full rounded border border-line p-3 text-sm" /></label>
      <button type="submit" disabled={disabled || !file} className="rounded bg-ink px-5 py-3 text-sm text-paper disabled:opacity-40">Update résumé</button>
    </form>
    <p role="status" aria-live="polite" className="mt-3 text-sm">{message}</p>
  </section>;
}
