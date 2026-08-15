let ctx: AudioContext | null = null;

/**
 * The one AudioContext everything shares. Browsers cap how many a document may
 * create, and a suspended context has to be resumed from inside a gesture.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

export function noiseBuffer(
  ac: BaseAudioContext,
  seconds: number,
): AudioBuffer {
  const len = Math.max(1, Math.floor(seconds * ac.sampleRate));
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1; // NOSONAR
  return buffer;
}
