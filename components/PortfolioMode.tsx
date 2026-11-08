"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type ModeContext = { switchMode: () => void; busy: boolean };
const Context = createContext<ModeContext | null>(null);
type Switch = { to: string; restore: number | undefined; reduced: boolean; revealStarted: boolean };

export function PortfolioMode({ children }: { children: ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const overlay = useRef<HTMLDialogElement>(null);
  const pending = useRef<Switch | null>(null);
  const engineering = useRef("/");
  const scrolls = useRef(new Map<string, number>());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frames = useRef<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [destination, setDestination] = useState("Photography");
  const [notice, setNotice] = useState("");
  const photo = pathname.startsWith("/photography");
  useEffect(() => { router.prefetch(photo ? engineering.current : "/photography"); }, [photo, router]);
  function finish() {
    timers.current.forEach(clearTimeout); timers.current = [];
    frames.current.forEach(cancelAnimationFrame); frames.current = [];
    overlay.current?.close(); pending.current = null;
    delete document.documentElement.dataset.transition;
    delete document.documentElement.dataset.portfolioSwitch;
    setBusy(false);
    document.querySelector<HTMLButtonElement>(".portfolio-mode-toggle")?.focus({ preventScroll: true });
  }
  useEffect(() => {
    function historyNavigation() { if (pending.current) finish(); }
    window.addEventListener("popstate", historyNavigation);
    return () => {
      window.removeEventListener("popstate", historyNavigation);
      timers.current.forEach(clearTimeout); frames.current.forEach(cancelAnimationFrame);
      delete document.documentElement.dataset.portfolioSwitch;
      if (pending.current) delete document.documentElement.dataset.transition;
    };
  }, []);
  useLayoutEffect(() => {
    const transition = pending.current;
    if (!transition || transition.to !== pathname || transition.revealStarted) return;
    transition.revealStarted = true;
    // Let the existing homepage's measurement effect initialize before restoring its scroll.
    frames.current.push(requestAnimationFrame(() => {
      frames.current.push(requestAnimationFrame(() => {
        if (transition.restore !== undefined) window.scrollTo({ top: transition.restore, behavior: "instant" });
        if (transition.reduced) { finish(); return; }
        overlay.current?.setAttribute("data-stage", "reveal");
        timers.current.push(setTimeout(finish, 520));
      }));
    }));
  }, [pathname]); // The provider survives route changes; one pending transition owns the overlay.
  function switchMode() {
    if (pending.current || document.documentElement.dataset.transition || document.querySelector("dialog[open]")) return;
    scrolls.current.set(pathname, window.scrollY);
    if (!photo) engineering.current = pathname;
    const to = photo ? engineering.current : "/photography";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    pending.current = { to, restore: scrolls.current.get(to) ?? (to === "/photography" ? 0 : undefined), reduced, revealStarted: false };
    setBusy(true); setDestination(photo ? "Engineering" : "Photography"); setNotice("");
    document.documentElement.dataset.transition = "mode";
    document.documentElement.dataset.portfolioSwitch = "true";
    if (!reduced && overlay.current) {
      const circle = document.querySelector<HTMLElement>(".portfolio-mode-toggle .mode-circle")?.getBoundingClientRect();
      const x = circle ? circle.left + circle.width / 2 : window.innerWidth - 32;
      const y = circle ? circle.top + circle.height / 2 : 32;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 4;
      overlay.current.style.setProperty("--portal-x", `${x}px`);
      overlay.current.style.setProperty("--portal-y", `${y}px`);
      overlay.current.style.setProperty("--portal-size", `${radius * 2}px`);
      overlay.current.style.setProperty("--portal-start", String((circle?.width ?? 12) / (radius * 2)));
      overlay.current.style.setProperty("--portal-color", photo ? "#ffffff" : "#080808");
      overlay.current.setAttribute("data-stage", "cover");
      overlay.current.showModal();
    }
    const change = () => { overlay.current?.setAttribute("data-stage", "hold"); router.push(to, { scroll: false }); };
    if (reduced) change(); else timers.current.push(setTimeout(change, 740));
    timers.current.push(setTimeout(() => { setNotice("Unable to switch portfolios. Please try again."); finish(); }, 12000));
  }
  return <Context.Provider value={{ switchMode, busy }}>
    {children}
    <dialog ref={overlay} className="mode-portal" aria-label={`Opening ${destination}`} onCancel={event => event.preventDefault()}>
      <div className="mode-portal-disc" aria-hidden="true" />
    </dialog>
    <span className="sr-only" role="status" aria-live="polite">{notice || (busy ? `Opening ${destination}` : "")}</span>
  </Context.Provider>;
}

export function PortfolioModeToggle() {
  const context = useContext(Context); const pathname = usePathname();
  const label = pathname.startsWith("/photography") ? "Engineering" : "Photography";
  if (!context) return null;
  return <button type="button" className="portfolio-mode-toggle" data-mode={pathname.startsWith("/photography") ? "photography" : "engineering"} onClick={context.switchMode} disabled={context.busy} aria-label={`Switch to ${label}`} aria-describedby="portfolio-mode-tooltip" aria-busy={context.busy}>
    <span className="mode-circle" aria-hidden="true" />
    <span className="mode-tooltip" role="tooltip" id="portfolio-mode-tooltip">{label}</span>
  </button>;
}
