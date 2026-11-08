"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type FormEvent } from "react";
import { useEditorRequest } from "./EditorSession";
import { PhotographyGallery } from "./PhotographyGallery";
import type { Photograph, PhotographyData, PhotoCollection } from "@/lib/photography";

const input = "mt-2 block w-full rounded border border-line bg-white/50 p-3 text-sm text-ink";
const button = "rounded border border-line px-4 py-2 text-sm hover:bg-paper-2 disabled:opacity-40";

export function PhotographyEditor({ initial, initialVersion, storage = "local" }: { initial: PhotographyData; initialVersion: string; storage?: "local" | "blob" }) {
  const request = useEditorRequest();
  const [data, setData] = useState(initial); const [version, setVersion] = useState(initialVersion);
  const [selected, setSelected] = useState<string | null>(initial.photos[0]?.id ?? null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const collection = data.collections.find(item => item.id === collectionId);
  const photos = collection ? data.photos.filter(photo => photo.collectionIds.includes(collection.id)) : data.photos;
  const photo = data.photos.find(item => item.id === selected);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function edit(change: (value: PhotographyData) => PhotographyData) { setData(change); setDirty(true); setMessage(""); }
  function updatePhoto(patch: Partial<Photograph>) { edit(value => ({ ...value, photos: value.photos.map(item => item.id === selected ? { ...item, ...patch } : item) })); }
  function updateCollection(patch: Partial<PhotoCollection>) { edit(value => ({ ...value, collections: value.collections.map(item => item.id === collectionId ? { ...item, ...patch } : item) })); }
  async function upload(files: File[], replace?: string) {
    if (!files.length) return;
    setBusy(true); setMessage("");
    const uploaded: Photograph[] = [];
    const failures: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setMessage(`Uploading photo ${index + 1} of ${files.length}…`);
        try {
          if (!file.size || file.size > 50 * 1024 * 1024) throw new Error("Choose a non-empty photo up to 50 MB.");
          let width: number | undefined; let height: number | undefined;
          try { if (typeof createImageBitmap === "function") { const image = await createImageBitmap(file); width = image.width; height = image.height; image.close(); } } catch { /* Some browsers cannot decode HEIC; the server can still convert it. */ }
          const form = new FormData(); form.set("action", "upload"); form.set("library", "photography"); form.set("file", file);
          const response = await request("/api/editor", { method: "POST", body: form }); const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          uploaded.push({ id: crypto.randomUUID(), src: result.src, title: file.name.replace(/\.[^.]+$/, ""), description: "", category: "", width, height, collectionIds: collectionId ? [collectionId] : [] });
        } catch (error) { failures.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`); }
      }
      setMessage([uploaded.length ? (replace ? "Photo replaced. Save changes to publish it." : `${uploaded.length} of ${files.length} photos added. Save changes to publish them.`) : "No photos were added.", ...failures].join("\n"));
    }
    finally {
      if (uploaded.length) {
        setData(value => {
          if (replace) return { ...value, photos: value.photos.map(item => item.id === replace ? { ...item, src: uploaded[0].src, width: uploaded[0].width, height: uploaded[0].height } : item) };
          return { ...value, photos: [...value.photos, ...uploaded], featuredId: value.featuredId ?? uploaded[0].id };
        });
        if (!replace) setSelected(uploaded[0].id);
        setDirty(true);
      }
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const form = new FormData(); form.set("action", "save-photography"); form.set("photography", JSON.stringify(data)); form.set("version", version);
      const response = await request("/api/editor", { method: "POST", body: form }); const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setVersion(result.version); setDirty(false); setMessage(storage === "blob" ? "Photography saved to the live website. Open previews update automatically." : "Photography saved locally. Push your changes to update the live Vercel website.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save photography."); }
    finally { setBusy(false); }
  }
  function move(id: string, step: number) {
    const visibleIndex = photos.findIndex(item => item.id === id); const neighbor = photos[visibleIndex + step];
    if (!neighbor) return;
    edit(value => { const all = [...value.photos]; const a = all.findIndex(item => item.id === id); const b = all.findIndex(item => item.id === neighbor.id); [all[a], all[b]] = [all[b], all[a]]; return { ...value, photos: all }; });
  }
  function removePhoto(id: string) {
    edit(value => { const remaining = value.photos.filter(item => item.id !== id); return { ...value, photos: remaining, featuredId: value.featuredId === id ? remaining[0]?.id ?? null : value.featuredId, collections: value.collections.map(group => group.coverId === id ? { ...group, coverId: undefined } : group) }; });
    setSelected(photos.find(item => item.id !== id)?.id ?? null);
  }
  function removeCollection() {
    edit(value => ({ ...value, collections: value.collections.filter(item => item.id !== collectionId), photos: value.photos.map(item => ({ ...item, collectionIds: item.collectionIds.filter(id => id !== collectionId) })) })); setCollectionId(null);
  }
  return <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8"><div><p className="label text-ink-soft">Photography workspace</p><h1 className="serif mt-3 text-5xl">Edit your photographs</h1><p className="mt-3 text-sm text-ink-soft">Photos and collections are separate from your engineering projects.</p></div><a className={button} href="/photography" target="_blank" rel="noreferrer">Open photography ↗</a></div>
    <form onSubmit={save}><fieldset disabled={busy}>
      <div className="mt-7 flex flex-wrap items-center gap-4"><label className={button}>Upload photos<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,image/tiff,image/bmp,.heic,.heif,.tif,.tiff,.bmp" aria-label="Upload photography images" className="mt-2 block max-w-full text-sm" onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void upload(files); }} /></label><button type="submit" disabled={busy || !dirty} className="rounded bg-ink px-6 py-3 text-sm text-paper disabled:opacity-40">{busy ? "Working…" : "Save photography"}</button><span className="text-sm">{dirty ? "Unsaved changes" : "All changes saved"}</span></div>
      <p className="mt-3 text-sm text-ink-soft">Select several photos at once with Command (Mac) or Ctrl (Windows). JPG, PNG, WebP, GIF, AVIF, HEIC, HEIF, TIFF, and BMP; up to 50 MB each. HEIC, HEIF, TIFF, and BMP are converted to JPG on macOS.</p>
      <p role="status" aria-live="polite" className="mt-3 whitespace-pre-line text-sm">{message}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside><h2 className="text-xl">Collections</h2><nav aria-label="Photography collections" className="my-4 flex flex-col gap-2"><button type="button" aria-pressed={!collection} className={button} onClick={() => setCollectionId(null)}>All photographs ({data.photos.length})</button>{data.collections.map(group => <button type="button" key={group.id} aria-pressed={collectionId === group.id} className={button} onClick={() => { setCollectionId(group.id); setSelected(data.photos.find(item => item.collectionIds.includes(group.id))?.id ?? null); }}>{group.title}</button>)}</nav><button type="button" className={button} onClick={() => { const id = crypto.randomUUID(); edit(value => ({ ...value, collections: [...value.collections, { id, title: "New collection", description: "" }] })); setCollectionId(id); setSelected(null); }}>+ Collection</button>
          <h2 className="mb-3 mt-8 text-xl">Photographs</h2><div className="flex flex-col gap-3">{photos.map((item, index) => <div key={item.id} className="rounded border border-line p-2"><button type="button" aria-current={selected === item.id ? "true" : undefined} className="w-full text-left text-sm" onClick={() => setSelected(item.id)}><img src={item.src} alt="" className="mb-2 max-h-32 w-full object-contain" />{item.title || "Untitled photograph"}{data.featuredId === item.id ? " ★" : ""}</button><div className="mt-2 flex gap-3"><button type="button" disabled={index === 0} className={button} onClick={() => move(item.id, -1)} aria-label={`Move ${item.title} up`}>↑</button><button type="button" disabled={index === photos.length - 1} className={button} onClick={() => move(item.id, 1)} aria-label={`Move ${item.title} down`}>↓</button></div></div>)}</div></aside>
        <div className="space-y-7">
          {collection && <section className="space-y-4 rounded border border-line p-5"><h2 className="text-2xl">Collection settings</h2><label className="block text-sm">Collection title<input required className={input} value={collection.title} onChange={event => updateCollection({ title: event.target.value })} /></label><label className="block text-sm">Collection description<textarea className={input} rows={3} value={collection.description} onChange={event => updateCollection({ description: event.target.value })} /></label><label className="block text-sm">Gallery cover<select className={input} value={collection.coverId ?? ""} onChange={event => updateCollection({ coverId: event.target.value || undefined })}><option value="">First photograph</option>{photos.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><button type="button" className={`${button} text-red-700`} onClick={removeCollection}>Delete collection</button></section>}
          {photo ? <section className="space-y-5" aria-label="Selected photograph"><img src={photo.src} alt={photo.title} className="max-h-[55vh] w-full rounded bg-paper-2 object-contain" /><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm">Photo title<input required className={input} value={photo.title} onChange={event => updatePhoto({ title: event.target.value })} /></label><label className="text-sm">Category<input className={input} value={photo.category} onChange={event => updatePhoto({ category: event.target.value })} /></label><label className="text-sm">Date (optional)<input type="date" className={input} value={photo.date ?? ""} onChange={event => updatePhoto({ date: event.target.value || undefined })} /></label></div><label className="block text-sm">Description<textarea rows={4} className={input} value={photo.description} onChange={event => updatePhoto({ description: event.target.value })} /></label>
            {!!data.collections.length && <div><h3 className="mb-3 text-sm">Belongs to collections</h3>{data.collections.map(group => <label key={group.id} className="mb-2 flex items-center gap-3 text-sm"><input type="checkbox" checked={photo.collectionIds.includes(group.id)} onChange={event => { const checked = event.target.checked; edit(value => ({ ...value, photos: value.photos.map(item => item.id === photo.id ? { ...item, collectionIds: checked ? [...item.collectionIds, group.id] : item.collectionIds.filter(id => id !== group.id) } : item), collections: value.collections.map(item => !checked && item.id === group.id && item.coverId === photo.id ? { ...item, coverId: undefined } : item) })); }} />{group.title}</label>)}</div>}
            <div className="flex flex-wrap gap-3"><button type="button" className={button} onClick={() => edit(value => ({ ...value, featuredId: photo.id }))}>{data.featuredId === photo.id ? "Featured photograph ★" : "Set as featured"}</button>{collection && photo.collectionIds.includes(collection.id) && <button type="button" className={button} onClick={() => updateCollection({ coverId: photo.id })}>Set as collection cover</button>}<button type="button" className={`${button} text-red-700`} onClick={() => removePhoto(photo.id)}>Delete photo</button></div><label className="block text-sm">Replace photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,image/tiff,image/bmp,.heic,.heif,.tif,.tiff,.bmp" className={input} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void upload(files, photo.id); }} /></label>
          </section> : <p className="py-12 text-ink-soft">{data.photos.length ? "Select a photograph, or upload photos to this collection." : "Upload your first photographs to begin. Nothing in your engineering portfolio will change."}</p>}
        </div>
      </div>
    </fieldset></form>
    <details className="mt-10 rounded border border-line p-4"><summary className="cursor-pointer text-sm">Preview unsaved photography</summary><div className="mt-5 overflow-hidden rounded"><PhotographyGallery data={data} preview /></div></details>
    <p className="mt-6 text-xs text-ink-soft">Deleting photos or collections removes gallery references when saved. Original uploaded files remain on disk.</p>
  </main>;
}
