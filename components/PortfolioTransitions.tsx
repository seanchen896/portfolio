"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";

const NavigationContext = createContext<((href: string) => void) | null>(null);
type PageTransition = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };
type TransitionDocument = Document & { startViewTransition?: (callback: () => Promise<void>) => PageTransition };

export function PortfolioTransitions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<{ path: string; finish: () => void } | null>(null);
  const active = useRef<PageTransition | null>(null);
  const generation = useRef(0);
  useLayoutEffect(() => {
    if (pending.current?.path !== pathname) return;
    // Rendering is held during capture: never await a frame or a paint here.
    pending.current.finish();
  }, [pathname]);
  useEffect(() => {
    function cancel() {
      generation.current++;
      active.current?.skipTransition();
      pending.current?.finish();
      active.current = null;
      delete document.documentElement.dataset.transition;
    }
    window.addEventListener("popstate", cancel);
    return () => { window.removeEventListener("popstate", cancel); cancel(); };
  }, []);
  function navigate(href: string) {
    const doc = document as TransitionDocument;
    const token = ++generation.current;
    active.current?.skipTransition();
    pending.current?.finish();
    if (!doc.startViewTransition || href === pathname || matchMedia("(prefers-reduced-motion: reduce)").matches || doc.documentElement.dataset.motion === "off") { router.push(href); return; }
    doc.documentElement.dataset.transition = "active";
    const transition = doc.startViewTransition(() => new Promise<void>(resolve => {
      if (token !== generation.current) { resolve(); return; }
      // Slow development compiles fall back before the browser's capture timeout.
      const timer = setTimeout(() => { transition.skipTransition(); finish(); }, 1500);
      function finish() {
        clearTimeout(timer);
        if (pending.current?.finish === finish) pending.current = null;
        resolve();
      }
      pending.current = { path: href, finish };
      router.push(href);
    }));
    active.current = transition;
    // ready rejects when navigation is superseded; this is expected cancellation.
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {}).finally(() => {
      if (active.current !== transition) return;
      active.current = null;
      delete doc.documentElement.dataset.transition;
    });
  }
  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}

export function PortfolioLink(props: ComponentProps<typeof Link>) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} onClick={event => {
    props.onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || props.target === "_blank" || props.replace || props.scroll === false || props.download || typeof props.href !== "string" || !props.href.startsWith("/") || props.href.startsWith("//") || props.href.includes("#") || !navigate) return;
    event.preventDefault(); navigate(props.href);
  }} />;
}
