import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

/**
 * Full-tree smoke test: mounts every section, the navbar, and the always-on
 * effect/widget layers together to catch render-time crashes and integration
 * regressions across the app shell.
 */
describe("App", () => {
  it("mounts the whole page without crashing", () => {
    render(<App />);

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders all primary section landmarks", () => {
    const { container } = render(<App />);
    for (const id of [
      "about",
      "experience",
      "earlier",
      "projects",
      "skills",
      "education",
      "achievements",
      "certifications",
      "hobbies",
      "contact",
    ]) {
      expect(container.querySelector(`#${id}`), `#${id}`).not.toBeNull();
    }
  });
});
