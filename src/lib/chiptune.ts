import { getAudioContext, noiseBuffer } from "@/lib/audio";

const BPM = 112;
const STEP = 60 / BPM / 4;
const TICK_MS = 25;
const AHEAD = 0.2;
const STEPS_PER_BAR = 16;

/** Am – F – C – G, the four chords holding up most of the genre. */
const ARP = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [261.63, 329.63, 392.0],
  [196.0, 246.94, 293.66],
];
const BASS = [110.0, 87.31, 130.81, 98.0];

let timer = 0;
let step = 0;
let nextAt = 0;
let master: GainNode | null = null;

function voice(
  ac: AudioContext,
  out: GainNode,
  freq: number,
  at: number,
  seconds: number,
  type: OscillatorType,
  peak: number,
): void {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + seconds + 0.02);
}

function kick(ac: AudioContext, out: GainNode, at: number): void {
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, at);
  osc.frequency.exponentialRampToValueAtTime(45, at + 0.13);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.5, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);

  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + 0.24);
}

function hat(ac: AudioContext, out: GainNode, at: number): void {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 0.04);

  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.16, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);

  src.connect(hp).connect(gain).connect(out);
  src.start(at);
  src.stop(at + 0.05);
}

function scheduleStep(ac: AudioContext, out: GainNode, i: number, at: number) {
  const bar = Math.floor(i / STEPS_PER_BAR) % ARP.length;
  const beat = i % STEPS_PER_BAR;

  if (beat % 8 === 0) kick(ac, out, at);
  if (beat % 2 === 1) hat(ac, out, at);
  if (beat % 4 === 0) {
    voice(ac, out, BASS[bar], at, STEP * 3.4, "sawtooth", 0.17);
  }
  if (beat % 2 === 0) {
    const chord = ARP[bar];
    const note = chord[(beat / 2) % chord.length];
    // Second half of the bar jumps an octave, which is the whole hook.
    const freq = beat >= 8 ? note * 2 : note;
    voice(ac, out, freq, at, STEP * 1.7, "square", 0.07);
  }
}

export function startChiptune(): void {
  if (timer) return;
  const ac = getAudioContext();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});

  master = ac.createGain();
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.6);
  master.connect(ac.destination);

  step = 0;
  nextAt = ac.currentTime + 0.08;

  const pump = () => {
    if (!master) return;
    while (nextAt < ac.currentTime + AHEAD) {
      scheduleStep(ac, master, step, nextAt);
      nextAt += STEP;
      step += 1;
    }
  };

  pump();
  timer = window.setInterval(pump, TICK_MS);
}

export function stopChiptune(): void {
  if (timer) {
    window.clearInterval(timer);
    timer = 0;
  }
  if (!master) return;

  const ac = getAudioContext();
  const node = master;
  master = null;
  if (!ac) return;

  node.gain.cancelScheduledValues(ac.currentTime);
  node.gain.setValueAtTime(Math.max(node.gain.value, 0.0001), ac.currentTime);
  node.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
  window.setTimeout(() => node.disconnect(), 500);
}

export function isChiptunePlaying(): boolean {
  return timer !== 0;
}
