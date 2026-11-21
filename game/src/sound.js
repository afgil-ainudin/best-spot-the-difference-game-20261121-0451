// All of Lantern Lane's sounds, synthesised live with WebAudio — no audio
// files, no network. A short oscillator envelope per effect, so every sound
// is the game's own.

export function createSounds() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, startAt, duration, type, volume) {
    const ctx = ensure();
    if (!ctx || muted) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startAt;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  return {
    get muted() { return muted; },
    toggleMuted() { muted = !muted; return muted; },
    /** Two-note chime when a difference is found. */
    find() { tone(659.25, 0, 0.22, 'sine', 0.22); tone(880, 0.09, 0.3, 'sine', 0.2); },
    /** Soft low thud for a wrong click. */
    miss() { tone(160, 0, 0.16, 'triangle', 0.16); tone(110, 0.02, 0.2, 'triangle', 0.12); },
    /** Shimmer when a hint is spent. */
    hint() { tone(523.25, 0, 0.18, 'sine', 0.14); tone(659.25, 0.07, 0.18, 'sine', 0.14); tone(783.99, 0.14, 0.26, 'sine', 0.14); },
    /** Little rising melody when a round is cleared. */
    win() {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(freq, i * 0.11, 0.28, 'sine', 0.2));
    },
    /** Quiet blip each second while the clock is low. */
    tick() { tone(980, 0, 0.06, 'sine', 0.08); },
    /** Single click for buttons. */
    click() { tone(440, 0, 0.07, 'sine', 0.1); },
  };
}
