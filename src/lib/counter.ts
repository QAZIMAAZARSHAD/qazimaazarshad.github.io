const BASE = "https://abacus.jasoncameron.dev";

/** Abacus answers { value: number }; keep only the digits defensively. */
function parseCount(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const digits = String(raw).replace(/\D/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

/**
 * Whether this visit should move the real totals. Local dev and CI must never
 * inflate them; tests opt back in through the flag.
 */
export function countsForReal(): boolean {
  const w = window as unknown as { __VISIT_COUNTER_TEST__?: boolean };
  if (w.__VISIT_COUNTER_TEST__) return true;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
}

/**
 * Read a counter without moving it. Null if it can't be reached.
 *
 * Held to the same rule as incrementing, even though reading changes nothing:
 * otherwise every dev refresh and every e2e test calls out just to render a
 * number, which is exactly what happened before the guard was here rather than
 * at one call site.
 */
export async function readCount(path: string): Promise<number | null> {
  if (!path || !countsForReal()) return null;
  try {
    const response = await fetch(`${BASE}/get/${path}`);
    if (!response.ok) return null;
    return parseCount(((await response.json()) as { value?: unknown })?.value);
  } catch {
    return null;
  }
}

/**
 * Increment a counter and return the new total. Null if it can't be reached.
 *
 * Creates the counter on first call, so a typo'd path silently starts a new
 * total from 1 rather than failing — the seeded totals were made up front via
 * /create, which is also the only way to get the admin key back.
 */
export async function bumpCount(path: string): Promise<number | null> {
  if (!path || !countsForReal()) return null;
  try {
    const response = await fetch(`${BASE}/hit/${path}`);
    if (!response.ok) return null;
    return parseCount(((await response.json()) as { value?: unknown })?.value);
  } catch {
    return null;
  }
}
