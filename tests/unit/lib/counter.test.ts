import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bumpCount, countsForReal, readCount } from "@/lib/counter";

const testFlag = () =>
  window as unknown as { __VISIT_COUNTER_TEST__?: boolean };

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () => new Response(JSON.stringify({ count: 7 }), { status: 200 }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete testFlag().__VISIT_COUNTER_TEST__;
});

describe("counter", () => {
  // The single most important behaviour here: developing the site, or running
  // CI, must never move the numbers shown to real visitors.
  it("refuses to increment from localhost", async () => {
    expect(window.location.hostname).toBe("localhost");
    expect(countsForReal()).toBe(false);
    expect(await bumpCount("ns/key")).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("increments once a test opts in", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    expect(await bumpCount("ns/key")).toBe(7);
    expect(String(vi.mocked(globalThis.fetch).mock.calls[0][0])).toMatch(
      /\/ns\/key\/up$/,
    );
  });

  // Reading changes nothing, but it is held to the same rule so that dev and
  // CI make no network calls at all.
  it("refuses to read from localhost either", async () => {
    expect(await readCount("ns/key")).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("reads without the /up that would move it", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    expect(await readCount("ns/key")).toBe(7);
    expect(String(vi.mocked(globalThis.fetch).mock.calls[0][0])).not.toMatch(
      /\/up$/,
    );
  });

  // Without the trailing slash the API answers 301, and that redirect carries
  // no CORS header, so the browser drops the request. It reads fine from curl
  // and silently fails in the page, which is how it reached production.
  it("asks for the slashed path, so the read isn't lost to a redirect", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    await readCount("ns/key");
    expect(String(vi.mocked(globalThis.fetch).mock.calls[0][0])).toMatch(
      /\/ns\/key\/$/,
    );
  });

  it("returns null rather than throwing when it can't be reached", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("blocked");
      }),
    );
    await expect(readCount("ns/key")).resolves.toBeNull();
  });

  it("does nothing without a path", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    expect(await readCount("")).toBeNull();
    expect(await bumpCount("")).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
