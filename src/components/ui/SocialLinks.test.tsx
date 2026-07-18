import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socials } from "@/data/content";

describe("SocialLinks", () => {
  it("renders one link per social by default with correct href and aria-label", () => {
    render(<SocialLinks />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(socials.length);

    for (const social of socials) {
      const link = screen.getByRole("link", { name: social.label });
      expect(link).toHaveAttribute("href", social.href);
    }
  });

  it("renders only the requested socials, in the given order", () => {
    render(<SocialLinks only={["github", "email"]} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAccessibleName("GitHub");
    expect(links[1]).toHaveAccessibleName("Email");
  });

  it("uses mailto for the email link without opening a new tab", () => {
    render(<SocialLinks only={["email"]} />);

    const emailLink = screen.getByRole("link", { name: "Email" });
    expect(emailLink.getAttribute("href")).toMatch(/^mailto:/);
    expect(emailLink).not.toHaveAttribute("target");
  });

  it("opens non-email links in a new tab with rel=noreferrer", () => {
    render(<SocialLinks only={["github"]} />);

    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noreferrer");
  });
});
