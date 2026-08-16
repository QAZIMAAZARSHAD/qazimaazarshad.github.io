import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FoundationsDeck } from "@/components/foundations/FoundationsDeck";
import type { ExperienceItem } from "@/data/content";

const items: ExperienceItem[] = [
  {
    role: "First Role",
    organization: "Org One",
    type: "Externship",
    period: "Jan 2021 — Feb 2021",
    description: "The first one.",
    image: "images/experience/one.png",
    certificate: "certificates/files/one.pdf",
  },
  {
    role: "Second Role",
    organization: "Org Two",
    type: "Community",
    period: "Mar 2021 — Apr 2021",
    description: "The second one.",
    image: "images/experience/two.png",
  },
  {
    role: "Third Role",
    organization: "Org Three",
    type: "Ambassador",
    period: "May 2021 — Jun 2021",
    description: "The third one.",
    image: "images/experience/three.png",
  },
];

function setup() {
  const onViewCertificate = vi.fn();
  render(
    <FoundationsDeck items={items} onViewCertificate={onViewCertificate} />,
  );
  return { onViewCertificate, user: userEvent.setup() };
}

const selectedTab = () =>
  screen
    .getAllByRole("tab")
    .find((t) => t.getAttribute("aria-selected") === "true");

describe("FoundationsDeck", () => {
  it("keeps every role in the document so nothing is hidden from search", () => {
    setup();
    for (const item of items) {
      expect(screen.getByText(item.role)).toBeInTheDocument();
    }
  });

  it("starts on the first role and advances with the next control", async () => {
    const { user } = setup();
    expect(selectedTab()).toHaveAccessibleName(/First Role/);

    await user.click(screen.getByRole("button", { name: "Next role" }));
    expect(selectedTab()).toHaveAccessibleName(/Second Role/);
  });

  it("wraps around the ends rather than stopping", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Previous role" }));
    expect(selectedTab()).toHaveAccessibleName(/Third Role/);
  });

  it("jumps straight to a role from the picker", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("tab", { name: /Third Role at Org Three/ }),
    );
    expect(selectedTab()).toHaveAccessibleName(/Third Role/);
  });

  it("moves through the picker with the arrow keys, keeping one tab stop", async () => {
    const { user } = setup();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);

    tabs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(selectedTab()).toHaveAccessibleName(/Second Role/);
    expect(selectedTab()).toHaveFocus();
  });

  it("only exposes the front slide to assistive tech and pointers", async () => {
    const { user } = setup();
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels[0]).not.toHaveAttribute("inert");
    expect(panels[1]).toHaveAttribute("inert");

    await user.click(screen.getByRole("button", { name: "Next role" }));
    expect(panels[0]).toHaveAttribute("inert");
    expect(panels[1]).not.toHaveAttribute("inert");
  });

  it("asks for the certificate of the role at the front", async () => {
    const { user, onViewCertificate } = setup();
    await user.click(
      within(screen.getAllByRole("tabpanel", { hidden: true })[0]).getByRole(
        "button",
        { name: /certificate/i },
      ),
    );
    expect(onViewCertificate).toHaveBeenCalledWith(items[0]);
  });

  it("announces the current position", () => {
    setup();
    expect(
      screen.getByText("1 of 3: First Role at Org One"),
    ).toBeInTheDocument();
  });
});
