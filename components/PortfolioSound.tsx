"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { createSoundEngine } from "@/lib/sound-engine";

const storageKey = "portfolio-sound-muted";
const SoundContext = createContext<{ muted: boolean; toggle: () => void } | null>(null);
const navigationTarget = ".portfolio-mode-toggle, .project-row, .back-link, .previous-project, .next-project";

export function PortfolioSound({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const engine = useRef<ReturnType<typeof createSoundEngine> | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const audio = createSoundEngine(); engine.current = audio;
    function preference(value: boolean) { mutedRef.current = value; setMuted(value); audio.setMuted(value); }
    try { preference(localStorage.getItem(storageKey) === "true"); } catch {}
    function arm(event: Event) { if (event.isTrusted) audio.unlock(); }
    function click(event: MouseEvent) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>(navigationTarget);
      if (!element || element.matches(":disabled, [aria-disabled=true]") || element.closest("[inert], [hidden]")) return;
      audio.play(element.matches(".portfolio-mode-toggle") ? "portal" : "navigate");
    }
    function storage(event: StorageEvent) { if (event.key === storageKey || event.key === null) preference(event.newValue === "true"); }
    function visibility() { if (document.hidden) audio.silence(); }
    let transition = document.documentElement.dataset.transition;
    const observer = new MutationObserver(records => {
      for (const record of records) {
        const element = record.target;
        if (record.attributeName === "aria-current" && element instanceof Element && element.matches(".portfolio-home .project-indicator button[aria-current=true]") && !document.documentElement.dataset.intro && !document.documentElement.dataset.transition) audio.play("notch");
      }
      const root = document.documentElement;
      if (root.dataset.transition !== transition) {
        transition = root.dataset.transition;
        if (transition) audio.play(transition === "mode" ? "portal" : "navigate");
      }
    });
    observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["aria-current", "data-transition"] });
    document.addEventListener("pointerdown", arm, true); document.addEventListener("keydown", arm, true);
    document.addEventListener("click", click); document.addEventListener("visibilitychange", visibility);
    window.addEventListener("storage", storage);
    return () => {
      observer.disconnect(); audio.dispose(); engine.current = null;
      document.removeEventListener("pointerdown", arm, true); document.removeEventListener("keydown", arm, true);
      document.removeEventListener("click", click); document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("storage", storage);
    };
  }, []);
  function toggle() {
    const next = !mutedRef.current; mutedRef.current = next; setMuted(next);
    engine.current?.setMuted(next);
    try { localStorage.setItem(storageKey, String(next)); } catch {}
    if (!next) engine.current?.unlock();
  }
  return <SoundContext.Provider value={{ muted, toggle }}>{children}{pathname.startsWith("/editor") && <div className="editor-sound-control"><MuteButton /></div>}</SoundContext.Provider>;
}

export function MuteButton() {
  const sound = useContext(SoundContext);
  if (!sound) return null;
  return <button type="button" className="sound-toggle" onClick={sound.toggle} aria-label={sound.muted ? "Unmute sound" : "Mute sound"} aria-pressed={sound.muted} title={sound.muted ? "Unmute sound" : "Mute sound"}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" />{sound.muted ? <path d="m16 9 6 6m0-6-6 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}</svg>
    <span className="sound-label">Sound {sound.muted ? "off" : "on"}</span>
  </button>;
}
