// One timeline turns the existing indicator bars into orbiting balls and back.
const INTRO = {
  seedHold: 240,
  joinDelay: 260,
  orbit: 1800,
  emergence: 450,
  stagger: 110,
  radius: .25,
  depth: .28,
  slowTurnsPerSecond: .06,
  fastTurnsPerSecond: 1.4,
  morph: 1800,
  minimumSettle: 1400,
  trailStart: .55,
  trailLength: 150,
  trailBlur: 7,
  dockMomentum: 80,
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type DockTarget = { y: number; scale: number; opacity: number };

export function startPortfolioIntro(list: HTMLOListElement, move: (turns: number) => void, complete: () => void, getTargets: (turns: number) => DockTarget[]) {
  const root = document.documentElement;
  const backdrop = document.querySelector<HTMLElement>(".intro-backdrop")!;
  const indicator = list.closest(".project-index")!.querySelector<HTMLElement>(".project-indicator")!;
  let indicatorBounds = indicator.getBoundingClientRect();
  const bars = Array.from(indicator.querySelectorAll<HTMLElement>(".selector-bar")).map((bar, index) => ({
    bar, index, width: bar.offsetWidth, height: bar.offsetHeight,
    x: indicatorBounds.left + bar.parentElement!.offsetWidth / 2,
    style: bar.getAttribute("style"),
  }));
  indicator.dataset.introIndicator = "true";
  const blocked = Array.from(document.querySelectorAll<HTMLElement>(".portfolio-home > header, .portfolio-home > footer, .project-indicator, .project-list"));
  const inert = blocked.map(element => element.inert);
  blocked.forEach(element => { element.inert = true; });
  // Keep emergence distinct even with a large project collection.
  const stagger = Math.min(INTRO.stagger, 950 / Math.max(1, bars.length - 2));
  // Both motions use the same turns/second throughout the handoff.
  const morphTurns = INTRO.fastTurnsPerSecond * INTRO.morph / 1000;
  const endTurns = Math.ceil(morphTurns + INTRO.fastTurnsPerSecond * INTRO.minimumSettle / 2000);
  const settleTurns = endTurns - morphTurns;
  const settleDuration = 2 * settleTurns / INTRO.fastTurnsPerSecond * 1000;
  let started: number | null = null;
  let dockTargets: DockTarget[] = [];
  let frame = 0;
  let restored = false;
  let cancelled = false;
  function restoreBars() {
    if (restored) return;
    restored = true;
    bars.forEach(({ bar, style }) => {
      delete bar.dataset.introOrb;
      if (style === null) bar.removeAttribute("style"); else bar.setAttribute("style", style);
    });
    delete indicator.dataset.introIndicator;
  }
  function cancel() {
    cancelled = true;
    cancelAnimationFrame(frame);
    restoreBars();
    blocked.forEach((element, i) => { element.inert = inert[i]; });
    backdrop.removeAttribute("style");
    root.style.removeProperty("--intro-projects");
  }
  root.dataset.intro = "waiting";
  function start() {
    if (cancelled || started !== null) return;
    // Measure the real responsive indicator again after the waiting screen.
    delete indicator.dataset.introIndicator;
    indicatorBounds = indicator.getBoundingClientRect();
    bars.forEach(item => {
      const width = item.bar.style.width;
      const height = item.bar.style.height;
      item.bar.style.removeProperty("width");
      item.bar.style.removeProperty("height");
      item.width = item.bar.offsetWidth;
      item.height = item.bar.offsetHeight;
      item.x = indicatorBounds.left + item.bar.parentElement!.offsetWidth / 2;
      item.bar.style.width = width;
      item.bar.style.height = height;
    });
    indicator.dataset.introIndicator = "true";
    dockTargets = getTargets(morphTurns);
    started = performance.now();
    root.dataset.intro = "orbit";
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  }
  function tick(now: number) {
    if (cancelled) return;
    const orbitTime = started === null ? 0 : Math.max(0, now - started - INTRO.seedHold);
    if (orbitTime >= 0) {
      const morphTime = orbitTime - INTRO.orbit;
      const progress = clamp(morphTime / INTRO.morph);
      const handoffTurns = Math.max(0, morphTime) / 1000 * INTRO.fastTurnsPerSecond;
      const morph = smooth(morphTime / INTRO.morph);
      const trails = smooth((orbitTime / INTRO.orbit - INTRO.trailStart) / (1 - INTRO.trailStart));
      const resolve = smooth((progress - .5) / .5);
      const lineShape = smooth(progress / .5);
      root.dataset.intro = started === null ? "waiting" : morphTime < 0 ? "orbit" : morphTime < INTRO.morph ? "morph" : "spin";
      backdrop.style.opacity = String(1 - smooth(morphTime / INTRO.morph));
      root.style.setProperty("--intro-projects", String(smooth(morphTime / (INTRO.morph * .8))));
      if (morphTime >= 0) {
        if (morphTime < INTRO.morph) move(handoffTurns);
        else {
          restoreBars();
          const t = clamp((morphTime - INTRO.morph) / settleDuration);
          move(morphTurns + settleTurns * (1 - (1 - t) ** 2));
          if (t === 1) { cancel(); complete(); return; }
        }
      }
      if (!restored) {
        const orbitSeconds = Math.min(orbitTime, INTRO.orbit) / 1000;
        const duration = INTRO.orbit / 1000;
        // Integral of a quadratic speed ramp; angular velocity stays continuous.
        const turns = INTRO.slowTurnsPerSecond * orbitSeconds + (INTRO.fastTurnsPerSecond - INTRO.slowTurnsPerSecond) * orbitSeconds ** 3 / (3 * duration ** 2) + handoffTurns;
        const radius = Math.min(innerHeight * INTRO.radius, 255);
        const leadAngle = -Math.PI / 2 + turns * Math.PI * 2;
        const leadY = innerHeight / 2 - Math.sin(leadAngle) * radius / (1 - Math.cos(leadAngle) * INTRO.depth) * smooth(orbitTime / INTRO.emergence);
        bars.forEach(({ bar, index, width, height, x: destinationX }) => {
          const age = index === 0 ? orbitTime : orbitTime - INTRO.joinDelay - (index - 1) * stagger;
          const emerged = smooth(age / INTRO.emergence);
          const growth = index === 0 ? 1 : emerged;
          const angle = -Math.PI / 2 + index / bars.length * Math.PI * 2 + turns * Math.PI * 2;
          const z = Math.cos(angle);
          const perspective = 1 / (1 - z * INTRO.depth);
          const size = (17 + (index * 13 % 23)) * Math.min(1, innerWidth / 600 + .4);
          // Dock in the actual indicator bounds. Only carry velocity through the
          // final few frames; projecting it across the whole morph caused a dip.
          const dock = dockTargets[index];
          const focus = dock?.scale ?? 1;
          const lineVelocity = -28 * bars.length * INTRO.fastTurnsPerSecond / 1000;
          const remaining = Math.min(0, morphTime - INTRO.morph);
          const momentum = lineVelocity * remaining * Math.exp(remaining / INTRO.dockMomentum);
          const destinationY = dock ? dock.y + momentum : innerHeight / 2;
          const finalY = dock?.y ?? innerHeight / 2;
          const edgeVisibility = clamp((indicatorBounds.height / 2 - Math.abs(finalY - innerHeight / 2)) / 18);
          const opacity = morphTime >= 0 ? (dock?.opacity ?? 1) * edgeVisibility : 1;
          const x = mix(innerWidth / 2, destinationX, morph);
          const fullOrbitY = index === 0 ? leadY : mix(leadY, innerHeight / 2 - Math.sin(angle) * radius * perspective, emerged);
          const orbitY = mix(fullOrbitY, innerHeight / 2, smooth(progress / .55));
          const y = mix(orbitY, destinationY, morph);
          // Change geometry behind the motion blur; only reveal crisp lines once formed.
          const w = mix(size * growth * perspective, width * focus, lineShape);
          const h = mix(size * growth * perspective, height, lineShape);
          bar.dataset.introOrb = "true";
          bar.style.width = `${w}px`;
          bar.style.height = `${h}px`;
          bar.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0)`;
          bar.style.opacity = String(age < 0 ? 0 : mix(index === 0 ? 1 : smooth(age / 180), opacity, morph));
          bar.style.zIndex = String(morph > .5 || (z > 0 && emerged > .8) ? 10003 : 10001);
          bar.style.borderRadius = "999px";
          bar.style.setProperty("--orb-core", String(clamp((1 - .85 * trails) * (1 - smooth(progress / .35)) + resolve)));
          bar.style.setProperty("--orb-blur", `${4 * trails * (1 - resolve)}px`);
          bar.style.setProperty("--trail-alpha", String(.42 * trails * (1 - resolve) * growth));
          bar.style.setProperty("--trail-width", `${mix(size * growth * perspective * .55, 4, lineShape)}px`);
          bar.style.setProperty("--trail-height", `${mix(size * growth + INTRO.trailLength * trails, height, resolve)}px`);
          bar.style.setProperty("--trail-blur", `${INTRO.trailBlur * trails * (1 - resolve)}px`);
        });
      }
    }
    if (started !== null) frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return { cancel, start };
}
