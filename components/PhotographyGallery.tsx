"use client";
/* Original local photographs are rendered at their natural aspect ratio. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { PhotographyData, Photograph } from "@/lib/photography";

export function PhotographyGallery({ data, preview = false }: { data: PhotographyData; preview?: boolean }) {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const collection = data.collections.find(item => item.id === collectionId);
  const photos = collection ? data.photos.filter(photo => photo.collectionIds.includes(collection.id)) : data.photos;
  const featured = photos.find(photo => photo.id === (collection ? collection.coverId : data.featuredId)) ?? photos[0];
  const current = viewer === null ? undefined : photos[viewer];
  useEffect(() => {
    if (current && !dialog.current?.open) dialog.current?.showModal();
    else if (!current) dialog.current?.close();
  }, [current]);
  function cover(id: string) {
    const group = data.collections.find(item => item.id === id);
    return data.photos.find(photo => photo.id === group?.coverId) ?? data.photos.find(photo => photo.collectionIds.includes(id));
  }
  function view(photo: Photograph) { setViewer(photos.findIndex(item => item.id === photo.id)); }
  function advance(step: number) { setViewer(index => index === null || !photos.length ? null : (index + step + photos.length) % photos.length); }
  return <section className={`photo-gallery${preview ? " photo-gallery-preview" : ""}`} aria-label="Photography portfolio">
    <div className="photo-intro"><span>[A different perspective]</span><h1>Photography<span>.</span></h1><p>{collection ? collection.description : "Selected photographs & collections"}</p></div>
    {featured ? <figure className="photo-feature">
      <button type="button" onClick={() => view(featured)} aria-label={`View ${featured.title} fullscreen`}><img key={featured.src} src={featured.src} alt={featured.title} width={featured.width} height={featured.height} fetchPriority="high" decoding="async" /></button>
      <figcaption><span>{featured.title}</span><span>{featured.category}{featured.date ? ` · ${featured.date}` : ""}</span></figcaption>
    </figure> : <div className="photo-empty"><span className="photo-empty-mark" aria-hidden="true">＋</span><h2>{collection ? "This collection is waiting for its first frame." : "A new perspective, coming into focus."}</h2><p>{collection ? "Photographs will appear here when added to this collection." : "No photographs have been published yet."}</p></div>}
    {!!data.collections.length && <section className="photo-collections" aria-label="Photo collections"><div className="photo-section-heading"><h2>Collections</h2><span>[{String(data.collections.length).padStart(2, "0")}]</span></div><div className="photo-collection-grid">{data.collections.map(group => {
      const image = cover(group.id);
      return <button type="button" key={group.id} onClick={() => setCollectionId(group.id)} aria-pressed={collectionId === group.id}>{image ? <img src={image.src} alt="" loading="lazy" width={image.width} height={image.height} /> : <span className="photo-collection-empty" aria-hidden="true" />}<span>{group.title}<span>↗</span></span><small>{group.description}</small></button>;
    })}</div></section>}
    {!!data.photos.length && <section className="photo-archive" aria-label={collection?.title ?? "All photographs"}>
      <div className="photo-section-heading"><h2>{collection?.title ?? "All photographs"}</h2><div>{collection && <button type="button" onClick={() => setCollectionId(null)}>All photographs ↗</button>}<span>[{String(photos.length).padStart(2, "0")}]</span></div></div>
      <div className="photo-grid">{photos.map(photo => <figure key={photo.id}><button type="button" onClick={() => view(photo)} aria-label={`View ${photo.title} fullscreen`}><img src={photo.src} alt={photo.title} width={photo.width} height={photo.height} loading="lazy" decoding="async" /></button><figcaption><h3>{photo.title}</h3><span>{photo.category}{photo.date ? ` · ${photo.date}` : ""}</span>{photo.description && <p>{photo.description}</p>}</figcaption></figure>)}</div>
    </section>}
    <dialog ref={dialog} className="photo-lightbox" aria-label={current ? `${current.title} — fullscreen photograph` : "Fullscreen photograph"} onClose={() => setViewer(null)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); advance(event.key === "ArrowRight" ? 1 : -1); } }} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="photo-viewer-toolbar"><span>{viewer === null ? "" : `${viewer + 1} / ${photos.length}`}</span><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close photograph">Close ×</button></div>
      {current && <><img className="photo-viewer-image" src={current.src} alt={current.title} /><div className="photo-viewer-caption"><div><h2>{current.title}</h2><p>{current.description}</p><span>{current.category}{current.date ? ` · ${current.date}` : ""}</span></div><div className="photo-viewer-arrows"><button type="button" disabled={photos.length < 2} onClick={() => advance(-1)} aria-label="Previous photograph">←</button><button type="button" disabled={photos.length < 2} onClick={() => advance(1)} aria-label="Next photograph">→</button></div></div></>}
    </dialog>
  </section>;
}
