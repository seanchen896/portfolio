"use client";
import { PortfolioLink as Link } from "./PortfolioTransitions";
import Image from "next/image";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "@/lib/projects";
import { getProjectImages } from "@/lib/project-media";
import { getProjectColors } from "@/lib/project-colors";
import { startPortfolioIntro } from "@/lib/portfolio-intro";

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const indicator = useRef<HTMLElement>(null);
  const controls = useRef<{ select: (index: number) => void } | null>(null);
  const [selected, setSelected] = useState(0);
  const selectedSlug = useRef(projects[0]?.slug ?? "");
  const canonical = useRef<HTMLOListElement>(null);
  const metrics = useRef({ period: 0, sides: 0 });
  const [sides, setSides] = useState(1);
  const [active, setActive] = useState<string | null>(null);
  const skipIntro = useRef<(() => void) | null>(null);
  const beginIntro = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const list = canonical.current;
    if (!list || !projects.length) { delete document.documentElement.dataset.intro; return; }
    let frame = 0;
    let smoothFrame = 0;
    let target = scrollY;
    let current = scrollY;
    let expected = scrollY;
    let lastTime = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let snapping = false;
    let touching = false;
    let touchOrigin: { x: number; y: number } | null = null;
    let startScroll = 0;
    let centeredSlug = "";
    let intro: ReturnType<typeof startPortfolioIntro> | undefined;
    let introFinished = false;
    let positions: { row: HTMLElement; center: number; index: number }[] = [];
    const bars = Array.from(indicator.current?.querySelectorAll<HTMLElement>(".selector-bar") ?? []);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    function stop() {
      clearTimeout(idle);
      snapping = false;
      cancelAnimationFrame(smoothFrame);
      smoothFrame = 0;
      current = target = expected = scrollY;
    }
    function write(top: number) {
      window.scrollTo({ top, behavior: "instant" });
      expected = scrollY;
    }
    function updateSelection() {
      if (!positions.length) return;
      const center = scrollY + innerHeight / 2;
      let nearest = positions[0];
      const strengths = projects.map(() => 0);
      const signedDistances = projects.map(() => Infinity);
      const reach = Math.max(220, innerHeight * .46);
      for (const item of positions) {
        const distance = Math.abs(item.center - center);
        if (distance < Math.abs(nearest.center - center)) nearest = item;
        const strength = Math.max(0, 1 - distance / reach) ** 2;
        item.row.style.setProperty("--focus-scale", String(preference.matches ? 1 : .74 + .26 * strength));
        item.row.style.setProperty("--focus-opacity", String(.18 + .82 * strength));
        strengths[item.index] = Math.max(strengths[item.index], strength);
        if (distance < Math.abs(signedDistances[item.index])) signedDistances[item.index] = item.center - center;
      }
      positions.forEach(item => {
        const centered = String(item === nearest);
        if (item.row.dataset.centered !== centered) item.row.dataset.centered = centered;
      });
      bars.forEach((bar, index) => {
        const scale = .3 + .7 * strengths[index];
        const opacity = .22 + .78 * strengths[index];
        bar.style.setProperty("--selector-scale", String(scale));
        bar.style.setProperty("--selector-opacity", String(opacity));
        if (!bar.hasAttribute("data-intro-orb")) {
          bar.style.transform = `scaleX(${scale})`;
          bar.style.opacity = String(opacity);
        }
        const pitch = metrics.current.period / projects.length;
        bar.parentElement!.style.transform = `translateY(${signedDistances[index] / pitch * 28}px)`;
      });
      const slug = projects[nearest.index].slug;
      if (slug !== centeredSlug) {
        centeredSlug = slug;
        selectedSlug.current = slug;
        setSelected(nearest.index);
      }
    }
    function cachePositions() {
      positions = rows.map(row => ({ row, center: scrollY + row.getBoundingClientRect().top + row.offsetHeight / 2, index: projects.findIndex(project => project.slug === row.dataset.projectSlug) }));
    }
    function closest(top = scrollY) {
      return positions.reduce((best, item) => Math.abs(item.center - innerHeight / 2 - top) < Math.abs(best.center - innerHeight / 2 - top) ? item : best);
    }
    function launch(top: number, settle = false) {
      clearTimeout(idle);
      snapping = settle;
      target = top;
      if (preference.matches) {
        write(target); current = scrollY; wrap(); updateSelection();
        return;
      }
      if (!smoothFrame) { current = scrollY; lastTime = performance.now(); smoothFrame = requestAnimationFrame(tick); }
    }
    function queueSettle() {
      clearTimeout(idle);
      if (preference.matches || touching || document.documentElement.dataset.intro || document.documentElement.dataset.transition || document.querySelector("dialog[open]")) return;
      idle = setTimeout(() => {
        if (touching || !positions.length) return;
        const top = closest(smoothFrame ? target : scrollY).center - innerHeight / 2;
        if (Math.abs(top - scrollY) > 1) launch(top, true);
      }, 180);
    }
    function measure() {
      const period = list!.getBoundingClientRect().height;
      if (!period) return;
      // Enough copies to fill even a tall screen with only one short project.
      const needed = Math.max(1, Math.ceil(innerHeight / period));
      if (needed !== sides) { setSides(needed); return; }
      const previous = metrics.current;
      const phase = previous.period ? scrollY - previous.sides * previous.period : 0;
      metrics.current = { period, sides };
      stop();
      write(sides * period + ((phase % period) + period) % period);
      current = target = scrollY;
      cachePositions();
      const matches = positions.filter(item => projects[item.index].slug === selectedSlug.current);
      const destination = previous.period && matches.length
        ? matches.reduce((best, item) => Math.abs(item.center - innerHeight / 2 - scrollY) < Math.abs(best.center - innerHeight / 2 - scrollY) ? item : best)
        : positions.find(item => item.row.parentElement === list)!;
      write(destination.center - innerHeight / 2);
      current = target = scrollY;
      updateSelection();
    }
    function wrap() {
      frame = 0;
      if (document.documentElement.dataset.transition || document.querySelector("dialog[open]")) return;
      const { period, sides: count } = metrics.current;
      if (!period) return;
      const start = count * period;
      // Rebase the centered window; the original padding no longer defines selection.
      const origin = positions.find(item => item.row.parentElement === list)?.center ?? start;
      const phase = scrollY + innerHeight / 2 - origin;
      if (phase < 0 || phase >= period) {
        const before = scrollY;
        const states = new Set(rows.filter(isVisible).map(row => `${row.parentElement!.dataset.loopCycle}:${row.dataset.projectSlug}`));
        write(scrollY - Math.floor(phase / period) * period);
        const shift = scrollY - before;
        target += shift;
        current += shift;
        // Move entrance state with the matching visual copy when rebasing the loop.
        const turns = Math.round(shift / period);
        visible.clear();
        rows.forEach(row => {
          const source = `${Number(row.parentElement!.dataset.loopCycle) - turns}:${row.dataset.projectSlug}`;
          const show = isVisible(row);
          if (show) visible.add(row);
          row.dataset.inView = String(show || preference.matches);
          // A matching on-screen copy must retain its fully revealed appearance.
          if (show && states.has(source)) row.getAnimations({ subtree: true }).forEach(animation => animation.finish());
        });
      }
      updateSelection();
    }
    function scroll() {
      if (smoothFrame && Math.abs(scrollY - expected) > 2) stop();
      if (!frame) frame = requestAnimationFrame(wrap);
      if (!smoothFrame) queueSettle();
    }
    function tick(now: number) {
      if (document.documentElement.dataset.transition || document.querySelector("dialog[open]")) { stop(); return; }
      const dt = Math.min(64, now - lastTime || 16.67);
      lastTime = now;
      const difference = target - current;
      if (Math.abs(difference) < 1) {
        current = target;
        write(target);
        wrap();
        smoothFrame = 0;
        if (!snapping) queueSettle();
        snapping = false;
        return;
      }
      current += difference * (1 - Math.exp(-dt / (snapping ? 145 : 115)));
      write(current);
      wrap();
      smoothFrame = requestAnimationFrame(tick);
    }
    function wheel(event: WheelEvent) {
      if (document.documentElement.dataset.intro) {
        if (event.cancelable) event.preventDefault();
        if (document.documentElement.dataset.intro === "waiting" && !event.ctrlKey && !event.metaKey && event.deltaY > Math.abs(event.deltaX)) {
          startScroll += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
          if (startScroll >= 16) intro?.start();
        }
        return;
      }
      if (preference.matches || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || document.documentElement.dataset.transition || document.querySelector("dialog[open]") || (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true'], dialog"))) return;
      if (event.cancelable) event.preventDefault();
      clearTimeout(idle);
      if (snapping) target = current;
      snapping = false;
      if (!smoothFrame) current = target = scrollY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target + event.deltaY * unit * .55));
      if (!smoothFrame) { lastTime = performance.now(); smoothFrame = requestAnimationFrame(tick); }
    }
    // Watch stationary list items; animate their contents so visibility cannot oscillate.
    const rows = Array.from(list.parentElement!.querySelectorAll<HTMLElement>(".project-list > li"));
    const visible = new Set<HTMLElement>();
    function isVisible(row: HTMLElement) {
      const bounds = row.getBoundingClientRect();
      return Math.min(bounds.bottom, innerHeight - 72) - Math.max(bounds.top, 78) >= bounds.height * .05;
    }
    const entrance = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const row = entry.target as HTMLElement;
        const show = isVisible(row);
        if (show) visible.add(row); else visible.delete(row);
        row.dataset.inView = String(show || preference.matches);
      }
    }, { rootMargin: "-78px 0px -72px 0px", threshold: .05 });
    rows.forEach(row => { row.dataset.inView = String(preference.matches); entrance.observe(row); });
    controls.current = { select(index) {
      const candidates = positions.filter(item => item.index === index);
      const nearest = candidates.reduce((best, item) => Math.abs(item.center - innerHeight / 2 - scrollY) < Math.abs(best.center - innerHeight / 2 - scrollY) ? item : best);
      launch(nearest.center - innerHeight / 2, true);
    } };
    function key(event: KeyboardEvent) {
      if (document.documentElement.dataset.intro) {
        if (document.documentElement.dataset.intro === "waiting" && ["ArrowDown", "PageDown", " "].includes(event.key) && !(event.target instanceof Element && event.target.closest("button, a, input, textarea, select"))) {
          event.preventDefault(); intro?.start();
        }
        return;
      }
      stop();
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || document.querySelector("dialog[open]") || document.documentElement.dataset.transition || (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, [contenteditable='true']"))) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        controls.current?.select((closest().index + step + projects.length) % projects.length);
      }
    }
    function touchStart(event: TouchEvent) {
      touching = true; stop();
      const point = event.touches[0];
      touchOrigin = point ? { x: point.clientX, y: point.clientY } : null;
    }
    function touchEnd(event: TouchEvent) {
      const point = event.changedTouches[0];
      if (event.type !== "touchcancel" && document.documentElement.dataset.intro === "waiting" && point && touchOrigin) {
        const distance = Math.abs(point.clientY - touchOrigin.y);
        if (distance >= 24 && distance > Math.abs(point.clientX - touchOrigin.x)) intro?.start();
      }
      touchOrigin = null; touching = false; queueSettle();
    }
    function motionChange() {
      if (preference.matches && document.documentElement.dataset.intro) finishIntro();
      stop();
      rows.forEach(row => { row.dataset.inView = String(preference.matches || visible.has(row)); });
      updateSelection();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    function finishIntro() {
      if (introFinished) return;
      introFinished = true;
      intro?.cancel();
      const first = positions.find(item => item.row.parentElement === list && item.index === 0);
      if (first) { write(first.center - innerHeight / 2); current = target = expected = scrollY; updateSelection(); }
      delete document.documentElement.dataset.intro;
      skipIntro.current = null;
      beginIntro.current = null;
    }
    skipIntro.current = finishIntro;
    if (document.documentElement.dataset.intro === "pending" && metrics.current.period && metrics.current.sides === sides) {
      const first = positions.find(item => item.row.parentElement === list && item.index === 0);
      if (first) {
        const start = first.center - innerHeight / 2;
        intro = startPortfolioIntro(list, turns => {
          write(start + (metrics.current.period * turns) % metrics.current.period);
          current = target = expected = scrollY;
          updateSelection();
        }, finishIntro, turns => {
          const center = start + (turns % 1) * metrics.current.period + innerHeight / 2;
          const pitch = metrics.current.period / projects.length;
          const reach = Math.max(220, innerHeight * .46);
          return bars.map((_, index) => {
            const candidates = positions.filter(item => item.index === index);
            const nearest = candidates.reduce((best, item) => Math.abs(item.center - center) < Math.abs(best.center - center) ? item : best);
            const distance = nearest.center - center;
            const strength = Math.max(0, 1 - Math.abs(distance) / reach) ** 2;
            return { y: innerHeight / 2 + distance / pitch * 28, scale: .3 + .7 * strength, opacity: .22 + .78 * strength };
          });
        });
        beginIntro.current = intro.start;
      } else finishIntro();
    }

    window.addEventListener("resize", measure);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("touchcancel", touchEnd, { passive: true });
    preference.addEventListener("change", motionChange);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      intro?.cancel();
      skipIntro.current = null;
      beginIntro.current = null;
      if (document.documentElement.dataset.intro && document.documentElement.dataset.intro !== "pending") delete document.documentElement.dataset.intro;
      cancelAnimationFrame(frame);
      stop();
      controls.current = null;
      entrance.disconnect();
      rows.forEach(row => { delete row.dataset.inView; });
      observer.disconnect();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      preference.removeEventListener("change", motionChange);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", scroll);
    };
  }, [projects, sides]);

  return <section id="work" className="project-index" aria-label="Selected projects">
    <div className="portfolio-intro" aria-label="Opening the project portfolio">
      <div className="intro-backdrop" aria-hidden="true" />
      <button type="button" className="intro-start" onClick={() => beginIntro.current?.()}>Scroll to start <span aria-hidden="true">↓</span></button>
      <button type="button" className="intro-skip" onClick={() => skipIntro.current?.()}>Skip intro</button>
    </div>
    {!!projects.length && <nav className="project-indicator" aria-label="Choose a centered project" ref={indicator} style={{ "--indicator-count": projects.length } as CSSProperties}>{projects.map((project, index) => <button type="button" key={project.slug} aria-label={`Center ${project.title}`} aria-current={selected === index ? "true" : undefined} onClick={() => controls.current?.select(index)}><span className="selector-bar" /><span className="sr-only">{project.title}</span></button>)}</nav>}
    <h1 className="sr-only">Sean Chen — Engineering project portfolio</h1>
    <div className="project-loop" onMouseLeave={() => setActive(null)}>
    {Array.from({ length: projects.length ? sides * 2 + 1 : 1 }, (_, cycle) => {
      const replica = cycle !== sides;
      return <ol key={cycle - sides} ref={replica ? undefined : canonical} className="project-list" data-loop-cycle={cycle - sides} aria-hidden={replica ? true : undefined}>
      {projects.map(project => {
        const images = getProjectImages(project).slice(0, 2);
        let letterIndex = 0;
        return <li key={project.slug} data-project-slug={project.slug} style={{ "--project-title-color": getProjectColors(project).titleColor } as CSSProperties}>
          <Link href={`/work/${project.slug}`} className="project-row" tabIndex={replica ? -1 : undefined} data-preview-active={active === project.slug} onMouseEnter={() => setActive(project.slug)} onFocus={() => setActive(project.slug)} onBlur={() => setActive(null)} onMouseDown={replica ? event => event.preventDefault() : undefined} aria-label={`${project.title} — ${project.category}`}>
            <span className="project-number" aria-hidden="true">[{project.index}]</span>
            <span className="project-row-content"><span className="project-title" data-project-title={project.slug} aria-hidden="true">{project.title.split(" ").map((word, wi) => <span className="title-word" key={wi}>{Array.from(word).map((letter, ci) => {
              const delay = Math.round(letterIndex++ / Math.max(1, project.title.replaceAll(" ", "").length - 1) * 260);
              return <span className="title-letter" key={ci} style={{ "--wave-delay": `${delay}ms` } as CSSProperties}><span className="title-glyph title-glyph-out">{letter}</span><span className="title-glyph title-glyph-in">{letter}</span></span>;
            })}{" "}</span>)}</span><span className="project-category">[{project.category}]</span></span>
            {!!images.length && <span className="project-peek" aria-hidden="true">{images.map((image, i) => <span className="peek-image" key={`${image.src}-${i}`} style={{ "--image-index": i } as CSSProperties}>{Array.from({ length: 8 }, (_, slice) => <span className="peek-slice" key={slice} style={{ "--slice": slice } as CSSProperties}><Image src={image.src} alt="" width={480} height={320} sizes="(max-width: 640px) 92px, (max-width: 1024px) 130px, 210px" draggable={false} /></span>)}</span>)}</span>}
          </Link>
        </li>;
      })}
    </ol>;
    })}
    </div>
    {!projects.length && <p>No projects have been added yet.</p>}
  </section>;
}
