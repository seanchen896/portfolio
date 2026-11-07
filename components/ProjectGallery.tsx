"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ResolvedProjectImage } from "@/lib/projects";

export function ProjectGallery({ images }: { images: ResolvedProjectImage[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const sync = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (first) setIndex(Math.min(images.length - 1, Math.round(el.scrollLeft / (first.offsetWidth + 16))));
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 3);
    };
    const observer = new ResizeObserver(sync); observer.observe(el); sync();
    el.addEventListener("scroll", sync, { passive: true });
    return () => { observer.disconnect(); el.removeEventListener("scroll", sync); };
  }, [images.length]);
  function advance(direction: number) {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    el.scrollBy({ left: direction * (first.offsetWidth + 16), behavior: reduced ? "instant" : "smooth" });
  }
  return <section className="project-gallery" aria-label="Project photographs">
    <div className="gallery-toolbar"><span aria-live="polite">[{index + 1}/{images.length}]</span><div className="gallery-arrows"><button type="button" disabled={index === 0} aria-label="Previous photograph" onClick={() => advance(-1)}>←</button><button type="button" disabled={atEnd} aria-label="Next photograph" onClick={() => advance(1)}>→</button></div></div>
    <div ref={track} className="gallery-track" tabIndex={0} aria-label="Scrollable photo gallery. Use left and right arrow keys." onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); advance(event.key === "ArrowLeft" ? -1 : 1); } }} onPointerDown={event => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft };
      event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.classList.add("is-dragging");
    }} onPointerMove={event => { if (drag.current) event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x); }} onPointerUp={event => { drag.current = null; event.currentTarget.classList.remove("is-dragging"); }} onPointerCancel={event => { drag.current = null; event.currentTarget.classList.remove("is-dragging"); }}>
      {images.map((image, i) => <figure className="gallery-frame" key={`${image.src}-${i}`}><Image src={image.src} alt={image.alt} width={1200} height={1200} sizes="(max-width: 640px) 88vw, (max-width: 1024px) 70vw, 45vw" draggable={false} className="gallery-image h-full w-full" priority={i === 0} /><figcaption className="sr-only">{image.caption ?? image.alt}</figcaption></figure>)}
    </div>
  </section>;
}
