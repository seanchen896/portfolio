"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Shared across route mounts so trackpad momentum cannot carry into another page.
let landingUntil = 0;
const duration = 1000;
const gestureGap = 220;
const cooldown = 280;

export function ProjectScrollNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let lastInput = 0;
    let total = 0;
    let direction = 0;
    let until = landingUntil;
    let touch: { x: number; y: number; distance: number; consumed: boolean } | null = null;
    const reduced = () => preference.matches || document.documentElement.dataset.motion === "off";
    const maximum = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const blocked = () => performance.now() < until || !!document.documentElement.dataset.transition;

    function nested(target: EventTarget | null) {
      let element = target instanceof Element ? target : null;
      if (element?.closest("input, textarea, select, button, [contenteditable='true'], .gallery-track, .project-document, .project-models, dialog")) return true;
      while (element && element !== document.body && element !== document.documentElement) {
        if (/(auto|scroll|overlay)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 1) return true;
        element = element.parentElement;
      }
      return false;
    }
    function route(step: number) {
      const link = document.querySelector<HTMLAnchorElement>(step > 0 ? ".next-project" : ".previous-project");
      if (!link || new URL(link.href).pathname === pathname) return;
      landingUntil = performance.now() + (reduced() ? 0 : duration) + cooldown;
      until = landingUntil;
      link.dataset.scrollNavigation = step > 0 ? "next" : "previous";
      link.click();
      delete link.dataset.scrollNavigation;
    }
    function atEdge(step: number) {
      return step > 0 ? scrollY >= maximum() - 2 : scrollY <= 2;
    }
    function advance(step: number) {
      total = 0;
      if (!blocked() && atEdge(step)) route(step);
    }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || nested(event.target) || document.querySelector("dialog[open]")) return;
      const now = performance.now();
      const fresh = now - lastInput > gestureGap;
      lastInput = now;
      // Extend the rest period while inertia is still arriving. Never queue gestures.
      if (blocked()) { if (event.cancelable) event.preventDefault(); total = 0; until = Math.max(until, now + cooldown); return; }
      const step = Math.sign(event.deltaY);
      // Content scrolling stays native. Only a fresh outward gesture at an edge navigates.
      if (!atEdge(step)) { total = 0; direction = 0; return; }
      if (fresh) { total = 0; direction = step; }
      if (direction !== step) { total = 0; return; }
      if (event.cancelable) event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      total += Math.min(120, Math.abs(event.deltaY) * unit);
      if (step && total >= 60) advance(step);
    }
    function touchStart(event: TouchEvent) {
      const point = event.touches[0];
      touch = event.touches.length === 1 && point && !nested(event.target) && !document.querySelector("dialog[open]")
        ? { x: point.clientX, y: point.clientY, distance: 0, consumed: false } : null;
    }
    function touchMove(event: TouchEvent) {
      const point = event.touches[0];
      if (!touch || !point || event.touches.length !== 1) return;
      const dy = touch.y - point.clientY;
      if (!touch.distance && !touch.consumed && !atEdge(Math.sign(dy))) { touch = null; return; }
      if (Math.abs(point.clientX - touch.x) > Math.abs(dy) && !touch.distance) return;
      if (event.cancelable) event.preventDefault();
      if (blocked() || touch.consumed) { until = Math.max(until, performance.now() + cooldown); return; }
      touch.distance += dy;
      touch.y = point.clientY;
      touch.x = point.clientX;
      if (Math.abs(touch.distance) >= 48) { advance(Math.sign(touch.distance)); touch.consumed = true; }
    }
    function touchEnd() { touch = null; }
    function settled() { until = performance.now() + cooldown; total = 0; }
    function key(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || nested(event.target) || (event.target instanceof Element && event.target.closest("a, summary, [role='button']")) || document.querySelector("dialog[open]")) return;
      const step = ["ArrowDown", "PageDown", " "].includes(event.key) ? (event.shiftKey ? -1 : 1) : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (!step && event.key !== "Home" && event.key !== "End") return;
      if (!step) return;
      if (!blocked() && !atEdge(step)) return;
      event.preventDefault();
      if (blocked() || event.repeat) return;
      advance(step);
    }
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("touchcancel", touchEnd, { passive: true });
    window.addEventListener("keydown", key);
    window.addEventListener("portfolio:scroll-settled", settled);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("keydown", key);
      window.removeEventListener("portfolio:scroll-settled", settled);
    };
  }, [pathname]);
  return null;
}
