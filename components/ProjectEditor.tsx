"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Project, ResolvedProjectImage, ResolvedProjectPdf } from "@/lib/projects";
import { getProjectImages, getProjectPdfs } from "@/lib/project-media";
import { getProjectColors, projectPalettes } from "@/lib/project-colors";
import { ResumeEditor } from "./ResumeEditor";
import type { ResumeSettings } from "@/lib/site-settings";
import { useEditorRequest } from "./EditorSession";

type Entry = Omit<Project, "index">;
const input = "mt-2 block w-full rounded border border-line bg-white/50 p-3 text-sm text-ink";
const button = "rounded border border-line px-4 py-2 text-sm hover:bg-paper-2 disabled:opacity-40";

export function ProjectEditor({ initial, initialVersion, resume }: { initial: Entry[]; initialVersion: string; resume: ResumeSettings }) {
  const editorRequest = useEditorRequest();
  const [projects, setProjects] = useState(initial);
  const [version, setVersion] = useState(initialVersion);
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleted, setDeleted] = useState<{ project: Entry; index: number } | null>(null);
  const project = projects[selected];
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(patch: Partial<Entry>) {
    setProjects(all => all.map((p, i) => i === selected ? { ...p, ...patch } : p));
    setDirty(true); setMessage("");
  }
  const images = project ? getProjectImages(project) : [];
  const pdfs = project ? getProjectPdfs(project) : [];
  function updateImage(i: number, patch: Partial<ResolvedProjectImage>) {
    update({ images: images.map((im, j) => i === j ? { ...im, ...patch } : im), image: undefined });
  }
  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true); setMessage("");
    const uploaded: ResolvedProjectImage[] = [];
    const failures: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setMessage(`Uploading photo ${index + 1} of ${files.length}…`);
        try {
          if (!file.size || file.size > 50 * 1024 * 1024) throw new Error("Choose a non-empty photo up to 50 MB.");
          const data = new FormData(); data.set("action", "upload"); data.set("file", file);
          const response = await editorRequest("/api/editor", { method: "POST", body: data });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          uploaded.push({ src: result.src, alt: `${project.title} photo`, caption: "" });
        } catch (error) { failures.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`); }
      }
      setMessage([uploaded.length ? `${uploaded.length} of ${files.length} photos added. Save changes to show them on your website.` : "No photos were added.", ...failures].join("\n"));
    }
    finally {
      if (uploaded.length) { setProjects(all => all.map((p, i) => i === selected ? { ...p, images: [...images, ...uploaded], image: undefined } : p)); setDirty(true); }
      setBusy(false);
    }
  }
  async function uploadModels(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMessage("");
    const uploaded: NonNullable<Entry["models"]> = [];
    try {
      for (const file of Array.from(files)) {
        const data = new FormData(); data.set("action", "upload-stl"); data.set("file", file);
        const response = await editorRequest("/api/editor", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        uploaded.push({ src: result.src, title: file.name.replace(/\.stl$/i, "") });
      }
      setMessage("Models added. Save changes to show them on your project page.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); }
    finally {
      if (uploaded.length) { setProjects(all => all.map((p, i) => i === selected ? { ...p, models: [...(p.models ?? []), ...uploaded] } : p)); setDirty(true); }
      setBusy(false);
    }
  }
  async function uploadPdfs(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMessage("");
    const uploaded: ResolvedProjectPdf[] = [];
    try {
      for (const file of Array.from(files)) {
        const data = new FormData(); data.set("action", "upload-pdf"); data.set("file", file);
        const response = await editorRequest("/api/editor", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        uploaded.push({ src: result.src, title: file.name.replace(/\.pdf$/i, "") || "Project PDF", caption: "" });
      }
      setMessage("PDFs added. Save changes to show them on your project page.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF upload failed."); }
    finally {
      if (uploaded.length) { setProjects(all => all.map((p, i) => i === selected ? { ...p, pdfs: [...pdfs, ...uploaded], pdf: undefined } : p)); setDirty(true); }
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const data = new FormData(); data.set("projects", JSON.stringify(projects)); data.set("version", version);
      const response = await editorRequest("/api/editor", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setVersion(result.version); setDirty(false); setMessage("Saved to your project files. Refresh the preview to see your changes.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed."); }
    finally { setBusy(false); }
  }
  function add() {
    const slug = `new-project-${Date.now()}`;
    setProjects([...projects, { slug, title: "New project", category: "Engineering", blurb: "Describe your project in one sentence.", about: ["Tell the story of your project."], role: [], tools: [], team: [], year: String(new Date().getFullYear()), organization: "Personal Project", status: "In progress", hue: 20, motif: "orbit", images: [], ...projectPalettes[projects.length % projectPalettes.length] }]);
    setSelected(projects.length); setDirty(true); setMessage("");
  }
  function move(index: number, direction: number) {
    const destination = index + direction;
    if (destination < 0 || destination >= projects.length) return;
    const reordered = [...projects];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    setProjects(reordered);
    if (selected === index) setSelected(destination);
    else if (selected === destination) setSelected(index);
    setDirty(true); setMessage("Project order changed. Save changes to update the website.");
  }
  function remove() {
    setDeleted({ project, index: selected });
    setProjects(projects.filter((_, i) => i !== selected));
    setSelected(Math.max(0, Math.min(selected, projects.length - 2)));
    setDirty(true); setMessage(`Removed “${project.title}”. Save changes to delete it from the website. Uploaded files are kept.`);
  }
  function undoDelete() {
    if (!deleted) return;
    const restored = [...projects];
    const index = Math.min(deleted.index, restored.length);
    const slugTaken = restored.some(project => project.slug === deleted.project.slug);
    restored.splice(index, 0, { ...deleted.project, slug: slugTaken ? `${deleted.project.slug}-restored-${Date.now()}` : deleted.project.slug });
    setProjects(restored); setSelected(index); setDeleted(null); setDirty(true); setMessage("Project restored. Save changes when ready.");
  }
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div><p className="label text-ink-soft">Local workspace</p><h1 className="serif mt-3 text-5xl">Edit your projects</h1><p className="mt-3 max-w-xl text-sm text-ink-soft">Add projects, write their stories, and upload photos. Save when you’re ready to update your website.</p></div>
        <p className="text-xs text-ink-soft">Locks automatically when you leave or reload.</p>
        <a href="/" target="_blank" rel="noreferrer" className={button}>Open website ↗</a>
      </div>
      <ResumeEditor initial={resume} disabled={busy} onBusyChange={setBusy} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside><button disabled={busy} className={`${button} w-full`} onClick={add}>+ New project</button>
          <p className="mt-4 text-xs text-ink-soft">Use the arrows to change the website order.</p>
          <nav aria-label="Projects to edit" className="mt-3 flex flex-col gap-2">{projects.map((p, i) => <div key={p.slug} className={`flex items-center rounded border border-line ${selected === i ? "bg-paper-2" : ""}`}><button disabled={busy} onClick={() => { setSelected(i); setMessage(""); }} aria-current={selected === i ? "true" : undefined} className="min-w-0 flex-1 p-3 text-left text-sm">{String(i + 1).padStart(2, "0")} / {p.title || "Untitled project"}</button><div className="flex flex-col pr-1"><button type="button" disabled={busy || i === 0} className="h-11 w-11 rounded hover:bg-white disabled:opacity-25" aria-label={`Move ${p.title} up`} onClick={() => move(i, -1)}>↑</button><button type="button" disabled={busy || i === projects.length - 1} className="h-11 w-11 rounded hover:bg-white disabled:opacity-25" aria-label={`Move ${p.title} down`} onClick={() => move(i, 1)}>↓</button></div></div>)}</nav>
          {deleted && <button type="button" disabled={busy} onClick={undoDelete} className={`${button} mt-4 w-full`}>Undo delete</button>}
        </aside>
        <form onSubmit={save}>
          {project ? <fieldset key={`${selected}-${projects.length}`} disabled={busy} className="space-y-7">
            <div className="grid gap-5 sm:grid-cols-2">{([['title','Project title'],['slug','Page URL slug'],['category','Category'],['year','Year'],['organization','Organization'],['status','Status']] as const).map(([key,label]) => <label key={key} className="text-sm">{label}<input className={input} required value={project[key]} pattern={key === 'slug' ? '[a-z0-9]+(-[a-z0-9]+)*' : undefined} onChange={e => update({ [key]: e.target.value })} /></label>)}</div>
            <label className="block text-sm">Short description<textarea required rows={3} className={input} value={project.blurb} onChange={e => update({ blurb: e.target.value })} /></label>
            <label className="block text-sm">Full description <span className="text-ink-soft">— separate paragraphs with a blank line</span><textarea key={`${selected}-about`} rows={8} className={input} defaultValue={project.about.join('\n\n')} onChange={e => update({ about: e.target.value.split(/\n\s*\n/) })} /></label>
            <div className="grid gap-5 sm:grid-cols-3">{(['role','tools','team'] as const).map(key => <label key={key} className="text-sm capitalize">{key}<span className="block text-xs normal-case text-ink-soft">One item per line</span><textarea key={`${selected}-${key}`} className={input} rows={4} defaultValue={project[key].join('\n')} onChange={e => update({ [key]: e.target.value.split('\n').filter(v => v.trim()) })} /></label>)}</div>
            <section className="border-t border-line pt-6"><h2 className="serif text-3xl">Project colors</h2><p className="mt-2 text-sm text-ink-soft">Title color controls the rolling title on the home page. Background color fills the project detail page; its text automatically switches to dark or light for readability.</p><div className="mt-5 grid gap-5 sm:grid-cols-2">{([['titleColor', 'Title color'], ['backgroundColor', 'Background color']] as const).map(([key, label]) => <label key={key} className="text-sm">{label}<div className="mt-2 flex items-center gap-3"><input type="color" aria-label={label} value={getProjectColors(project)[key]} onChange={event => update({ [key]: event.target.value })} className="h-12 w-16 cursor-pointer rounded border border-line bg-white p-1" /><span className="font-mono text-sm">{getProjectColors(project)[key]}</span></div></label>)}</div><div className="mt-5 rounded p-6 text-3xl tracking-tight" style={{ color: getProjectColors(project).ink, backgroundColor: getProjectColors(project).backgroundColor }}>{project.title || 'Project title'}</div></section>
            <section className="border-t border-line pt-6"><h2 className="serif text-3xl">Photos</h2><p className="mt-2 text-sm text-ink-soft">The first photo is your cover. Select several files with Command (Mac) or Ctrl (Windows). JPG, PNG, WebP, GIF, AVIF, HEIC, HEIF, TIFF, and BMP are supported, up to 50 MB each. HEIC, HEIF, TIFF, and BMP are converted to JPG on macOS.</p>
              <label className="mt-4 block text-sm">Add photos<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,image/tiff,image/bmp,.heic,.heif,.tif,.tiff,.bmp" className={input} onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void upload(files); }} /></label>
              <div className="mt-5 space-y-5">{images.map((im, i) => <div key={`${selected}-${i}-${im.src}`} className="grid gap-4 rounded border border-line p-4 sm:grid-cols-[140px_1fr]">
                {/* Local uploaded images are previewed without the image optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.alt} className="aspect-square w-full rounded object-cover" />
                <div><label className="text-sm">Image description (alt text)<input className={input} value={im.alt} onChange={e => updateImage(i, { alt: e.target.value })} /></label><label className="mt-3 block text-sm">Caption<input className={input} value={im.caption ?? ''} onChange={e => updateImage(i, { caption: e.target.value })} /></label>
                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={button} disabled={i === 0} onClick={() => update({ images: [im, ...images.filter((_, j) => j !== i)], image: undefined })}>{i === 0 ? 'Cover photo' : 'Make cover'}</button><button type="button" className={button} onClick={() => update({ images: images.filter((_, j) => j !== i), image: undefined })}>Remove photo</button></div>
                </div></div>)}</div>
            </section>
            <section className="border-t border-line pt-6"><h2 className="serif text-3xl">PDF documents</h2><p className="mt-2 text-sm text-ink-soft">Add reports, drawings, or presentations as PDFs, up to 25 MB each. Each document appears on the project page.</p><label className="mt-4 block text-sm">Add PDFs<input type="file" accept=".pdf,application/pdf" multiple className={input} onChange={e => { void uploadPdfs(e.target.files); e.target.value = ""; }} /></label><div className="mt-4 space-y-4">{pdfs.map((pdf, i) => <div key={`${pdf.src}-${i}`} className="rounded border border-line p-4"><label className="text-sm">PDF title<input required className={input} value={pdf.title} onChange={e => update({ pdfs: pdfs.map((p, j) => j === i ? { ...p, title: e.target.value } : p), pdf: undefined })} /></label><label className="mt-3 block text-sm">PDF caption<input className={input} value={pdf.caption ?? ""} onChange={e => update({ pdfs: pdfs.map((p, j) => j === i ? { ...p, caption: e.target.value } : p), pdf: undefined })} /></label><div className="mt-3 flex gap-3"><a href={pdf.src} target="_blank" rel="noreferrer" className={button}>Open PDF ↗</a><button type="button" className={button} onClick={() => update({ pdfs: pdfs.filter((_, j) => j !== i), pdf: undefined })}>Remove PDF</button></div></div>)}</div></section>
            <section className="border-t border-line pt-6"><h2 className="serif text-3xl">3D models</h2><p className="mt-2 text-sm text-ink-soft">Upload STL files up to 25 MB. Visitors can rotate, zoom, pan, and download each model.</p><label className="mt-4 block text-sm">Add STL files<input type="file" accept=".stl" multiple className={input} onChange={e => { void uploadModels(e.target.files); e.target.value = ""; }} /></label><div className="mt-4 space-y-4">{(project.models ?? []).map((model, i) => <div key={model.src} className="rounded border border-line p-4"><label className="text-sm">Model title<input required className={input} value={model.title} onChange={e => update({ models: project.models?.map((m, j) => j === i ? { ...m, title: e.target.value } : m) })} /></label><div className="mt-3 flex gap-3"><a href={model.src} download className={button}>Download STL</a><button type="button" className={button} onClick={() => update({ models: project.models?.filter((_, j) => j !== i) })}>Remove model</button></div></div>)}</div></section>
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6"><button type="submit" className="rounded bg-ink px-6 py-3 text-sm text-paper">{busy ? 'Working…' : 'Save changes'}</button><span className="text-sm text-ink-soft">{dirty ? 'Unsaved changes' : 'All changes saved'}</span><a className={`${button} ml-auto`} href={`/work/${project.slug}`} target="_blank" rel="noreferrer">View project ↗</a></div>
            <div className="border-t border-line pt-6"><button type="button" className={`${button} text-red-700`} onClick={remove}>Delete project</button><p className="mt-2 text-xs text-ink-soft">Deletion takes effect when you save. Photos and STL files stay on disk.</p></div>
          </fieldset> : <div className="space-y-5"><p>No projects yet. Add a new project or undo the last deletion.</p><button type="submit" disabled={busy} className="rounded bg-ink px-6 py-3 text-sm text-paper">{busy ? 'Working…' : 'Save changes'}</button></div>}
          <p role="status" aria-live="polite" className="mt-4 whitespace-pre-line text-sm">{message}</p>
        </form>
      </div>
    </main>
  );
}
