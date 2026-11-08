"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";

const NavigationContext = createContext<((href: string, link: HTMLElement) => void) | null>(null);
type PageTransition = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };
type TransitionDocument = Document & { startViewTransition?: (callback: () => Promise<void>) => PageTransition };

// Older browsers get the same paired slide using DOM surfaces and Web Animations.
function slideFallback(update: () => Promise<void>, direction: string): PageTransition {
  const surface = document.createElement("div");
  const old = document.querySelector<HTMLElement>(".portfolio-work");
  const clone = old?.cloneNode(true) as HTMLElement | undefined;
  surface.style.cssText = "position:fixed;inset:0;z-index:1000;overflow:hidden;pointer-events:none;transform:translateY(0);";
  surface.setAttribute("aria-hidden", "true");
  surface.inert = true;
  if (clone) {
    clone.style.cssText += `;position:absolute;top:${-scrollY}px;left:0;right:0;`;
    clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
    surface.append(clone);
  }
  document.body.append(surface);
  let skipped = false;
  const animations: Animation[] = [];
  const ready = update();
  const finished = ready.then(async () => {
    if (skipped) return;
    const incoming = document.querySelector<HTMLElement>(".portfolio-work");
    const sign = direction === "next" ? 1 : -1;
    const options = { duration: 1000, easing: "cubic-bezier(.645,.045,.355,1)", fill: "both" as const };
    animations.push(surface.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-sign * 100}%)` }], options));
    if (incoming) animations.push(incoming.animate([{ transform: `translateY(${sign * innerHeight}px)` }, { transform: "translateY(0)" }], options));
    await Promise.allSettled(animations.map(animation => animation.finished));
  }).finally(() => { surface.remove(); animations.forEach(animation => animation.cancel()); });
  return { ready, finished, skipTransition() { skipped = true; surface.remove(); animations.forEach(animation => animation.cancel()); } };
}

export function PortfolioTransitions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<{ path: string; title: string | null; finish: () => void } | null>(null);
  const active = useRef<PageTransition | null>(null);
  const generation = useRef(0);
  useLayoutEffect(() => {
    if (pending.current?.path !== pathname) return;
    if (document.documentElement.dataset.scrollDirection) window.scrollTo({ top: 0, behavior: "instant" });
    const title = pending.current.title;
    if (title) {
      const homeTitles = Array.from(document.querySelectorAll<HTMLElement>(`.project-list [data-project-title="${CSS.escape(title)}"]`));
      const visibleTitle = homeTitles.find(element => {
        const bounds = element.getBoundingClientRect();
        return bounds.top >= 76 && bounds.bottom <= innerHeight - 72;
      });
      const destination = pathname === "/"
        ? visibleTitle ?? document.querySelector(`.project-list:not([aria-hidden="true"]) [data-project-title="${CSS.escape(title)}"]`)
        : document.querySelector(".project-heading [data-project-title]");
      destination?.setAttribute("data-transition-title", "true");
    }
    // Rendering is held during capture: never await a frame or a paint here.
    pending.current.finish();
  }, [pathname]);
  useEffect(() => {
    function cancel() {
      generation.current++;
      active.current?.skipTransition();
      pending.current?.finish();
      active.current = null;
      clearTitle();
      delete document.documentElement.dataset.transition;
      delete document.documentElement.dataset.scrollDirection;
    }
    window.addEventListener("popstate", cancel);
    return () => { window.removeEventListener("popstate", cancel); cancel(); };
  }, []);
  function clearTitle() {
    document.querySelectorAll("[data-transition-title]").forEach(element => element.removeAttribute("data-transition-title"));
  }
  function navigate(href: string, link: HTMLElement) {
    if (document.documentElement.dataset.scrollDirection) return;
    const doc = document as TransitionDocument;
    const token = ++generation.current;
    active.current?.skipTransition();
    pending.current?.finish();
    clearTitle();
    const scrollDirection = link.dataset.scrollNavigation;
    if ((!doc.startViewTransition && !scrollDirection) || href === pathname || matchMedia("(prefers-reduced-motion: reduce)").matches || doc.documentElement.dataset.motion === "off") { router.push(href); return; }
    doc.documentElement.dataset.transition = "active";
    if (scrollDirection) doc.documentElement.dataset.scrollDirection = scrollDirection;
    // Only the clicked title participates; reset its rolling glyphs before capture.
    const source = link.dataset.scrollNavigation ? null : link.querySelector("[data-project-title]") ?? (href === "/" ? document.querySelector(".project-heading [data-project-title]") : null);
    const title = source?.getAttribute("data-project-title") ?? null;
    source?.setAttribute("data-transition-title", "true");
    const update = () => new Promise<void>(resolve => {
      if (token !== generation.current) { resolve(); return; }
      // Slow development compiles fall back before the browser's capture timeout.
      const timer = setTimeout(() => { transition.skipTransition(); finish(); }, 1500);
      function finish() {
        clearTimeout(timer);
        if (pending.current?.finish === finish) pending.current = null;
        resolve();
      }
      pending.current = { path: href, title, finish };
      router.push(href);
    });
    const transition = doc.startViewTransition ? doc.startViewTransition(update) : slideFallback(update, scrollDirection!);
    active.current = transition;
    // ready rejects when navigation is superseded; this is expected cancellation.
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {}).finally(() => {
      if (active.current !== transition) return;
      active.current = null;
      clearTitle();
      delete doc.documentElement.dataset.transition;
      delete doc.documentElement.dataset.scrollDirection;
      if (scrollDirection) window.dispatchEvent(new Event("portfolio:scroll-settled"));
    });
  }
  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}

export function PortfolioLink(props: ComponentProps<typeof Link>) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} onClick={event => {
    props.onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || props.target === "_blank" || props.replace || props.scroll === false || props.download || typeof props.href !== "string" || !props.href.startsWith("/") || props.href.startsWith("//") || props.href.includes("#") || !navigate) return;
    event.preventDefault(); navigate(props.href, event.currentTarget);
  }} />;
}
