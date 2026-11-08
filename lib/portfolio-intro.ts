// Reveal the existing carousel in place while the name moves into navigation.
const INTRO = {
  keystrokes: [220, 180, 100, 160, 240, 140, 90, 125, 105],
  typingHold: 220,
  reveal: 700,
  nameFlight: 1600,
  finishHold: 120,
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const smoother = (n: number) => { const t = clamp(n); return t ** 3 * (t * (6 * t - 15) + 10); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function startPortfolioIntro(list: HTMLOListElement, move: (turns: number) => void, complete: () => void) {
  const root = document.documentElement;
  const name = list.closest('.project-index')!.querySelector<HTMLElement>('.intro-name')!;
  const brand = document.querySelector<HTMLElement>('.portfolio-home .portfolio-name')!;
  const brandStyle = getComputedStyle(brand);
  const brandFont = parseFloat(brandStyle.fontSize);
  name.style.fontFamily = brandStyle.fontFamily;
  name.style.lineHeight = String(parseFloat(brandStyle.lineHeight) / brandFont || 1.2);
  name.style.letterSpacing = `${(parseFloat(brandStyle.letterSpacing) || 0) / brandFont}em`;
  // Match the real navbar's glyphs so the final reveal has no visible text swap.
  name.style.textTransform = brandStyle.textTransform;
  const blocked = Array.from(document.querySelectorAll<HTMLElement>('.portfolio-home > header, .portfolio-home > footer, .project-indicator, .project-list'));
  const inert = blocked.map(element => element.inert);
  blocked.forEach(element => { element.inert = true; });
  let total = 0;
  const keystrokes = INTRO.keystrokes.map(delay => total += delay);
  const typing = total + INTRO.typingHold;
  const nameStart = typing + INTRO.reveal;
  const started = performance.now();
  let frame = 0;
  let cancelled = false;
  let characters = -1;
  let width = 0;
  let height = 0;
  const properties = ['--intro-projects', '--intro-chrome', '--intro-cover', '--intro-details', '--intro-name-surface'];
  function cancel() {
    cancelled = true;
    cancelAnimationFrame(frame);
    blocked.forEach((element, i) => { element.inert = inert[i]; });
    properties.forEach(property => root.style.removeProperty(property));
    delete root.dataset.introName;
    name.removeAttribute('style');
    name.textContent = 'Sean Chen';
  }
  name.textContent = '';
  root.dataset.intro = 'typing';
  move(0);
  function tick(now: number) {
    if (cancelled) return;
    const elapsed = now - started;
    const count = keystrokes.filter(time => elapsed >= time).length;
    if (characters !== count) {
      characters = count;
      name.textContent = 'Sean Chen'.slice(0, count);
      width = name.offsetWidth;
      height = name.offsetHeight;
    }
    const reveal = smooth((elapsed - typing) / INTRO.reveal);
    const flight = smoother((elapsed - nameStart) / INTRO.nameFlight);
    root.dataset.intro = elapsed < typing ? 'typing' : elapsed < nameStart ? 'reveal' : flight < 1 ? 'flight' : 'docked';
    root.style.setProperty('--intro-projects', String(mix(0, .28, reveal) + .72 * flight));
    root.style.setProperty('--intro-chrome', String(flight));
    root.style.setProperty('--intro-details', String(smooth((flight - .3) / .7)));
    root.style.setProperty('--intro-cover', String(1 - flight));
    root.style.setProperty('--intro-name-surface', String(1 - flight));
    if (flight < 1) {
      const destination = brand.getBoundingClientRect();
      const finalScale = parseFloat(getComputedStyle(brand).fontSize) / parseFloat(getComputedStyle(name).fontSize);
      // Interpolate relative size and travel around the text's center, with
      // zero velocity and acceleration at both ends of the longer flight.
      const scale = Math.exp(Math.log(finalScale) * flight);
      const x = mix(innerWidth / 2, destination.left + width * finalScale / 2, flight) - width * scale / 2;
      const y = mix(innerHeight / 2, destination.top + height * finalScale / 2, flight) - height * scale / 2;
      name.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    } else root.dataset.introName = 'docked';
    if (elapsed >= nameStart + INTRO.nameFlight + INTRO.finishHold) { cancel(); complete(); return; }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return { cancel };
}
