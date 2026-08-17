const BASE = "https://abacus.jasoncameron.dev";

/** Abacus answers { value: number }. */
function parseCount(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const digits = String(raw).replace(/\D/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

/** Local dev and CI must never inflate the totals; tests opt back in. */
export function countsForReal(): boolean {
  const w = window as unknown as { __VISIT_COUNTER_TEST__?: boolean };
  if (w.__VISIT_COUNTER_TEST__) return true;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
}

/** Read a counter without moving it. Null if it can't be reached. */
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
 * A typo'd path silently starts a new total rather than failing.
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
