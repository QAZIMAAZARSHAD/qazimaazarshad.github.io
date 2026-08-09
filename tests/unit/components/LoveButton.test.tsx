import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoveButton } from "@/components/footer/LoveButton";

const heart = () => screen.getByRole("button", { name: /love this site/i });
const calls = () =>
  vi.mocked(globalThis.fetch).mock.calls.map((c) => String(c[0]));
const relays = () => calls().filter((url) => url.includes("web3forms")).length;

function mockFetch(count = 41) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ value: count }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  localStorage.clear();
  // Counting is skipped on localhost so dev and CI can't inflate the real
  // totals; tests opt back in, otherwise nothing would be exercised.
  (
    window as unknown as { __VISIT_COUNTER_TEST__: boolean }
  ).__VISIT_COUNTER_TEST__ = true;
  mockFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as { __VISIT_COUNTER_TEST__?: boolean })
    .__VISIT_COUNTER_TEST__;
});

describe("LoveButton", () => {
  it("asks the question and shows how many have answered", async () => {
    render(<LoveButton />);
    expect(screen.getByText(/loved the site\?/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/41 loves/)).toBeInTheDocument(),
    );
  });

  it("fills in, counts up, and opens a line to say more", async () => {
    render(<LoveButton />);
    await waitFor(() => screen.getByText(/41 loves/));

    fireEvent.click(heart());

    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    expect(screen.getByText(/42 loves/)).toBeInTheDocument();
    // aria-disabled, not aria-pressed: it can be given but never taken back.
    expect(
      screen.getByRole("button", { name: /you loved this site/i }),
    ).toHaveAttribute("aria-disabled", "true");
    // The visible copy is hidden from assistive tech, so the live region is
    // the only thing that speaks — and focus moves shortly after.
    expect(screen.getByText(/loved\. 42 so far/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/say something/i)).toBeInTheDocument();
  });

  // The number is the feedback for the tap, so it must not wait on a round
  // trip that a blocker or a slow network can hold open indefinitely.
  it("counts up without waiting for the network", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<LoveButton />);
    fireEvent.click(heart());
    expect(screen.getByText(/1 love$/)).toBeInTheDocument();
  });

  // The read is sent before the tap and answers after it, so taking it at face
  // value would wipe the love the visitor just gave.
  it("does not let a late read undo the tap", async () => {
    let settle: (r: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (url: string) =>
          new Promise<Response>((resolve) => {
            if (String(url).includes("/hit/")) {
              resolve(new Response(JSON.stringify({ value: 42 })));
            } else {
              settle = resolve;
            }
          }),
      ),
    );

    render(<LoveButton />);
    fireEvent.click(heart());
    // The read finally answers with the total from *before* the bump.
    settle(new Response(JSON.stringify({ value: 41 })));

    await waitFor(() =>
      expect(screen.getByText(/42 loves/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/41 loves/)).toBeNull();
  });

  // Restoring the note box on every visit would leave an open mail button in
  // the footer that a returning visitor could use without limit.
  it("offers the note once, not on every later visit", async () => {
    const { unmount } = render(<LoveButton />);
    fireEvent.click(heart());
    expect(screen.getByPlaceholderText(/say something/i)).toBeInTheDocument();
    unmount();

    render(<LoveButton />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /you loved this site/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByPlaceholderText(/say something/i)).toBeNull();
  });

  it("only lets a visitor love it once", async () => {
    const { unmount } = render(<LoveButton />);
    await waitFor(() => screen.getByText(/41 loves/));
    fireEvent.click(heart());
    const after = calls().filter((url) => url.includes("/hit/")).length;
    unmount();

    // A second visit finds it already given.
    render(<LoveButton />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /you loved this site/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /you loved this/i }));
    expect(calls().filter((url) => url.includes("/hit/")).length).toBe(after);
  });

  it("relays the note that was written, and only once", async () => {
    render(<LoveButton />);
    fireEvent.click(heart());

    const send = screen.getByRole("button", { name: /send note/i });
    expect(send).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/say something/i), {
      target: { value: "the door is lovely" },
    });

    const before = relays();
    fireEvent.click(send);
    // The form stays mounted through its exit animation, so a second press
    // lands on a live button.
    fireEvent.click(send);

    expect(relays() - before).toBe(1);
    const sent = vi.mocked(globalThis.fetch).mock.calls;
    expect(String(sent[sent.length - 1][1]?.body)).toContain(
      "the door is lovely",
    );

    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/say something/i)).toBeNull(),
    );
  });

  it("says nothing about a count it could not reach", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );
    render(<LoveButton />);
    await waitFor(() =>
      expect(screen.getByText(/loved the site\?/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/loves?$/)).toBeNull();
  });
});
