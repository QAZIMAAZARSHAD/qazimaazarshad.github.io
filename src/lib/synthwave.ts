export const SYNTHWAVE_EVENT = "qma:synthwave";

/** Flips party mode from anywhere — the palette, the console, a shortcut. */
export function toggleSynthwave(): void {
  window.dispatchEvent(new CustomEvent(SYNTHWAVE_EVENT));
}
