import { getAudioContext } from "@/lib/audio";

/** Open-string frequencies of a standard-tuned guitar: E2 A2 D3 G3 B3 E4. */
const GUITAR_OPEN = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

/**
 * Synthesize one plucked string into an AudioBuffer using the Karplus–Strong
 * algorithm: seed a short delay line with noise (the "pluck"), then repeatedly
 * average-and-decay it, which rings out as a natural, guitar-like tone.
 */
function pluck(
  ac: BaseAudioContext,
  freq: number,
  seconds: number,
  decay: number,
): AudioBuffer {
  const sr = ac.sampleRate;
  const n = Math.max(2, Math.round(sr / freq));
  const len = Math.floor(seconds * sr);
  const buffer = ac.createBuffer(1, len, sr);
  const y = buffer.getChannelData(0);
  // Non-cryptographic noise seed for the pluck — Math.random is fine here.
  for (let i = 0; i < n; i++) y[i] = Math.random() * 2 - 1; // NOSONAR
  for (let i = n; i < len; i++) y[i] = decay * 0.5 * (y[i - n] + y[i - n + 1]);
  return buffer;
}

/**
 * A short, warm guitar strum synthesized with Karplus–Strong plucked-string
 * synthesis — no audio asset to ship. Must be called from a user gesture (e.g.
 * a click) so browser autoplay policies allow it; a no-op where Web Audio is
 * unavailable.
 */
export function playStrum(): void {
  const ac = getAudioContext();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});

  const now = ac.currentTime;
  const strumGap = 0.04; // stagger between strings → a strum, not a chord
  const ring = 1.2;

  const master = ac.createGain();
  master.gain.value = 0.32;
  // A gentle low-pass rounds off the pluck's initial noise for a softer tone.
  const tone = ac.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 3600;
  master.connect(tone);
  tone.connect(ac.destination);

  for (const [i, freq] of GUITAR_OPEN.entries()) {
    const t = now + i * strumGap;
    const src = ac.createBufferSource();
    src.buffer = pluck(ac, freq, ring, 0.994);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.9, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ring);
    src.connect(gain).connect(master);
    src.start(t);
    src.stop(t + ring);
  }
}
