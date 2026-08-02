import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoveButton } from "@/components/footer/LoveButton";

const heart = () => screen.getByRole("button", { name: /love this site/i });
const calls = () =>
  vi.mocked(globalThis.fetch).mock.calls.map((c) => String(c[0]));

function mockFetch(count = 41) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ count }), {
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
    expect(
      screen.getByRole("button", { name: /you loved this site/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByPlaceholderText(/say something/i)).toBeInTheDocument();
  });

  // The number is the feedback for the tap, and the request behind it is
  // blocked for a good share of visitors — waiting on it would feel dead.
  it("counts up without waiting for the network", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<LoveButton />);
    fireEvent.click(heart());
    expect(screen.getByText(/1 love$/)).toBeInTheDocument();
  });

  it("only lets a visitor love it once", async () => {
    const { unmount } = render(<LoveButton />);
    await waitFor(() => screen.getByText(/41 loves/));
    fireEvent.click(heart());
    const after = calls().filter((url) => url.endsWith("/up")).length;
    unmount();

    // A second visit finds it already given.
    render(<LoveButton />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /you loved this site/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /you loved this/i }));
    expect(calls().filter((url) => url.endsWith("/up")).length).toBe(after);
  });

  it("sends a note only when one is written", async () => {
    render(<LoveButton />);
    fireEvent.click(heart());

    const send = screen.getByRole("button", { name: /send note/i });
    expect(send).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/say something/i), {
      target: { value: "the door is lovely" },
    });
    fireEvent.click(send);

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
