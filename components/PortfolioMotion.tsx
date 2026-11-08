"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export function PortfolioMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!document.querySelector(".portfolio-home, .portfolio-work")) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".project-list:not([data-loop-cycle]) > li, .project-heading-line, .project-intro-label, .project-description > p, .project-information dl > div, .next-project"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.textReveal = "visible";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    function revealAll() {
      document.documentElement.dataset.motion = preference.matches ? "off" : "on";
      if (preference.matches) elements.forEach(element => { element.dataset.textReveal = "visible"; });
    }
    revealAll();
    let order = 0;
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const onScreen = rect.top < innerHeight && rect.bottom > 0;
      const navigating = document.documentElement.dataset.transition === "active";
      const sharedHeading = navigating && element.matches(".project-heading-line");
      element.dataset.textReveal = preference.matches || sharedHeading ? "visible" : "pending";
      element.style.setProperty("--text-delay", `${onScreen && !navigating ? Math.min(order++ * 90, 360) : 0}ms`);
      if (element.dataset.textReveal === "pending") observer.observe(element);
    });
    function focus(event: FocusEvent) {
      if (event.target instanceof Element) {
        const element = event.target.closest<HTMLElement>("[data-text-reveal]");
        if (element) element.dataset.textReveal = "visible";
      }
    }
    document.addEventListener("focusin", focus);
    preference.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", revealAll);
      document.removeEventListener("focusin", focus);
      elements.forEach(element => { delete element.dataset.textReveal; element.style.removeProperty("--text-delay"); });
    };
  }, [pathname]);

  return null;
}
