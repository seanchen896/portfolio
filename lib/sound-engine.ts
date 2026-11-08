export type SoundCue = "notch" | "navigate" | "portal";

// Restrained bass and filtered air for scrolling and major transitions only.
export function createSoundEngine() {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let muted = false;
  const active = new Set<AudioScheduledSourceNode>();
  const last = new Map<SoundCue, number>();
  function silence() { active.forEach(source => { try { source.stop(); } catch {} }); active.clear(); }
  function unlock() {
    if (muted) return;
    try {
      const Constructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) return;
      if (!context) {
        context = new Constructor(); master = context.createGain();
        master.gain.value = .45; master.connect(context.destination);
      }
      if (context.state === "suspended") void context.resume().catch(() => {});
    } catch { /* Sound remains optional when a browser cannot create audio. */ }
  }
  function voice(source: AudioScheduledSourceNode, output: AudioNode, duration: number, volume: number, delay = 0) {
    if (!context || !master) return;
    const gain = context.createGain(); const start = context.currentTime + delay;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + (duration > .3 ? .09 : .012));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    output.connect(gain); gain.connect(master); active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); output.disconnect(); gain.disconnect(); };
    source.start(start); source.stop(start + duration + .02);
  }
  function tone(from: number, to: number, duration: number, volume: number, delay = 0) {
    if (!context) return;
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(from, context.currentTime + delay);
    oscillator.frequency.exponentialRampToValueAtTime(to, context.currentTime + delay + duration);
    voice(oscillator, oscillator, duration, volume, delay);
  }
  function air(duration: number, volume: number, from: number, to: number) {
    if (!context) return;
    if (!noise) {
      noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource(); source.buffer = noise;
    const filter = context.createBiquadFilter(); filter.type = "bandpass"; filter.Q.value = .65;
    filter.frequency.setValueAtTime(from, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(to, context.currentTime + duration);
    source.connect(filter); voice(source, filter, duration, volume);
  }
  function play(cue: SoundCue) {
    if (muted || document.hidden || context?.state !== "running") return;
    const now = performance.now();
    const interval = cue === "notch" ? 160 : 220;
    if (now - (last.get(cue) ?? -Infinity) < interval || active.size > 12) return;
    last.set(cue, now);
    switch (cue) {
      case "notch": tone(96, 58, .14, .095); tone(192, 116, .09, .018); break;
      case "navigate": air(.65, .12, 320, 65); tone(82, 42, .7, .1); tone(164, 84, .45, .025); break;
      case "portal": air(.95, .16, 480, 55); tone(62, 30, .9, .14); tone(124, 60, .65, .035); break;
    }
  }
  return {
    unlock, play, silence,
    setMuted(value: boolean) { muted = value; if (value) silence(); if (master && context) master.gain.setTargetAtTime(value ? 0 : .45, context.currentTime, .008); },
    dispose() { silence(); if (context) void context.close().catch(() => {}); },
  };
}
