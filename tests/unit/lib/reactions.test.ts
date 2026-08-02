import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hasLoved, rememberLove, sendLove } from "@/lib/reactions";
import { reactionKey } from "@/data/content";

const body = () =>
  JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[0][1]?.body));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 })),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("sendLove", () => {
  it("carries the note, and says so plainly when there isn't one", async () => {
    await sendLove();
    expect(body().message).toMatch(/no note left/i);

    vi.mocked(globalThis.fetch).mockClear();
    await sendLove("  the door is lovely  ");
    expect(body().message).toBe("the door is lovely");
  });

  it("identifies the form and carries enough context to be worth opening", async () => {
    await sendLove();
    const sent = body();
    expect(sent.access_key).toBe(reactionKey);
    expect(sent.subject).toMatch(/loved your portfolio/i);
    expect(sent).toHaveProperty("arrived_from");
    expect(sent).toHaveProperty("screen");
    expect(sent).toHaveProperty("at");
  });

  // A visitor tapping a heart has nothing to retry, so nothing is ever thrown
  // at them — but the caller should still learn it didn't land.
  it("reports failure instead of throwing it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("blocked");
      }),
    );
    await expect(sendLove("hi")).resolves.toBe(false);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("no", { status: 429 })),
    );
    await expect(sendLove("hi")).resolves.toBe(false);
  });
});

describe("remembering a visitor", () => {
  it("remembers across visits", () => {
    expect(hasLoved()).toBe(false);
    rememberLove();
    expect(hasLoved()).toBe(true);
  });

  // Private mode and blocked storage both throw on access. The heart has to
  // keep working; the visitor is simply treated as new each time.
  it("survives storage being unavailable", () => {
    const boom = () => {
      throw new Error("denied");
    };
    const store = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(boom);
    const write = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(boom);

    expect(() => rememberLove()).not.toThrow();
    expect(hasLoved()).toBe(false);

    store.mockRestore();
    write.mockRestore();
  });
});
