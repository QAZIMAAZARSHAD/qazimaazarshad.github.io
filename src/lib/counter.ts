const BASE = "https://api.counterapi.dev/v1";

/** CounterAPI returns { count: number }; keep only the digits defensively. */
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
 * The trailing slash is load-bearing: without it the API answers 301, and that
 * redirect carries no access-control-allow-origin, so the browser abandons the
 * request before following it. Reads work from curl and fail in the page.
 */
export async function readCount(path: string): Promise<number | null> {
  if (!path) return null;
  try {
    const response = await fetch(`${BASE}/${path}/`);
    if (!response.ok) return null;
    return parseCount(((await response.json()) as { count?: unknown })?.count);
  } catch {
    return null;
  }
}

/** Increment a counter and return the new total. Null if it can't be reached. */
export async function bumpCount(path: string): Promise<number | null> {
  if (!path || !countsForReal()) return null;
  try {
    const response = await fetch(`${BASE}/${path}/up`);
    if (!response.ok) return null;
    return parseCount(((await response.json()) as { count?: unknown })?.count);
  } catch {
    return null;
  }
}
