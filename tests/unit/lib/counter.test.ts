import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bumpCount, countsForReal, readCount } from "@/lib/counter";

const testFlag = () =>
  window as unknown as { __VISIT_COUNTER_TEST__?: boolean };

const calledUrl = () => String(vi.mocked(globalThis.fetch).mock.calls[0][0]);

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () => new Response(JSON.stringify({ value: 7 }), { status: 200 }),
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
    expect(calledUrl()).toMatch(/\/hit\/ns\/key$/);
  });

  // Reading changes nothing, but it is held to the same rule so that dev and
  // CI make no network calls at all.
  it("refuses to read from localhost either", async () => {
    expect(await readCount("ns/key")).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  // /hit creates and increments in one call, so a read that reached for it
  // would inflate the total just by rendering the number.
  it("reads through /get, never the /hit that would move it", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    expect(await readCount("ns/key")).toBe(7);
    expect(calledUrl()).toMatch(/\/get\/ns\/key$/);
    expect(calledUrl()).not.toContain("/hit/");
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

  // A missing counter answers 404, which must read as "no number to show"
  // rather than as a zero.
  it("returns null when the counter isn't there", async () => {
    testFlag().__VISIT_COUNTER_TEST__ = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Key not found" }), {
            status: 404,
          }),
      ),
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
