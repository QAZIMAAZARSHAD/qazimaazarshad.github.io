import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyFilterState, FilterToolbar } from "@/components/ui/FilterToolbar";

describe("FilterToolbar", () => {
  it("presses the active chip and reports the live count", async () => {
    const onCategoryChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterToolbar
        legend="Filter by category"
        chips={[
          { id: "All", label: "All" },
          { id: "Web", label: "Web", count: 3 },
        ]}
        activeId="All"
        onCategoryChange={onCategoryChange}
        query=""
        onQueryChange={vi.fn()}
        searchPlaceholder="Search…"
        searchAriaLabel="Search items"
        resultCount={4}
        resultNoun={{ singular: "item", plural: "items" }}
        countTestId="items-count"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("4 items");
    // The decorative CountUp starts at 0; the live region is the source of truth.
    expect(screen.getByTestId("items-count")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Web/ }));
    expect(onCategoryChange).toHaveBeenCalledWith("Web");
  });

  it("hides empty chips when asked", () => {
    render(
      <FilterToolbar
        legend="Filter"
        chips={[
          { id: "all", label: "All", count: 2 },
          { id: "empty", label: "Empty", count: 0 },
        ]}
        activeId="all"
        onCategoryChange={vi.fn()}
        query=""
        onQueryChange={vi.fn()}
        searchPlaceholder="Search…"
        searchAriaLabel="Search"
        resultCount={2}
        resultNoun={{ singular: "x", plural: "xs" }}
        countTestId="c"
        hideEmpty
      />,
    );
    expect(
      screen.queryByRole("button", { name: /Empty/ }),
    ).not.toBeInTheDocument();
  });
});

describe("EmptyFilterState", () => {
  it("clears filters on request", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<EmptyFilterState title="Nothing here" onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
