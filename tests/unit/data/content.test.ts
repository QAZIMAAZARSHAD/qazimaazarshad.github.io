import { describe, it, expect } from "vitest";
import {
  socials,
  education,
  experience,
  earlierExperience,
  projects,
  projectCategories,
  certificateCategories,
  type ProjectCategory,
} from "@/data/content";
import { certificates } from "@/data/certificates";

/** Categories that are valid on a ProjectItem (everything except the "All" filter pseudo-value). */
const validCategories = projectCategories.filter(
  (c): c is ProjectCategory => c !== "All",
);

describe("content: projects", () => {
  it("every project has all required non-empty string fields", () => {
    for (const project of projects) {
      expect(project.title.trim(), `title for ${project.title}`).not.toBe("");
      expect(project.blurb.trim(), `blurb for ${project.title}`).not.toBe("");
      expect(
        project.description.trim(),
        `description for ${project.title}`,
      ).not.toBe("");
      expect(project.image.trim(), `image for ${project.title}`).not.toBe("");
      expect(project.date.trim(), `date for ${project.title}`).not.toBe("");
      // link is optional; when present it must be a non-empty http(s) URL
      if (project.link !== undefined) {
        expect(project.link, `link for ${project.title}`).toMatch(
          /^https?:\/\//,
        );
      }
    }
  });

  it("every project lists at least one tech, all non-empty", () => {
    for (const project of projects) {
      expect(
        project.tech.length,
        `tech count for ${project.title}`,
      ).toBeGreaterThanOrEqual(1);
      for (const tech of project.tech) {
        expect(tech.trim(), `tech entry for ${project.title}`).not.toBe("");
      }
    }
  });

  it("every project category is one of the ProjectCategory values", () => {
    for (const project of projects) {
      expect(validCategories, `category for ${project.title}`).toContain(
        project.category,
      );
    }
  });

  it("project titles are unique", () => {
    const titles = projects.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("content: projectCategories", () => {
  it('starts with "All"', () => {
    expect(projectCategories[0]).toBe("All");
  });

  it("contains no duplicate categories", () => {
    expect(new Set(projectCategories).size).toBe(projectCategories.length);
  });
});

describe("content: socials", () => {
  it("every social has a non-empty id, label, and href", () => {
    for (const social of socials) {
      expect(social.id.trim(), "social id").not.toBe("");
      expect(social.label.trim(), `label for ${social.id}`).not.toBe("");
      expect(social.href.trim(), `href for ${social.id}`).not.toBe("");
    }
  });

  it("the email social uses a mailto: href", () => {
    const email = socials.find((s) => s.id === "email");
    expect(email, "email social should exist").toBeDefined();
    expect(email?.href.startsWith("mailto:")).toBe(true);
  });

  it("non-email socials use http(s) hrefs", () => {
    for (const social of socials.filter((s) => s.id !== "email")) {
      expect(social.href, `href for ${social.id}`).toMatch(/^https?:\/\//);
    }
  });
});

describe("content: education", () => {
  it("every education item has the required fields populated", () => {
    expect(education.length).toBeGreaterThan(0);
    for (const item of education) {
      expect(item.degree.trim(), "degree").not.toBe("");
      expect(
        item.institution.trim(),
        `institution for ${item.degree}`,
      ).not.toBe("");
      expect(item.score.trim(), `score for ${item.degree}`).not.toBe("");
      expect(item.period.trim(), `period for ${item.degree}`).not.toBe("");
      expect(item.image.trim(), `image for ${item.degree}`).not.toBe("");
    }
  });
});

describe("content: experience", () => {
  it("every company has required fields and at least one role", () => {
    expect(experience.length).toBeGreaterThan(0);
    for (const company of experience) {
      expect(company.organization.trim(), "organization").not.toBe("");
      expect(
        company.image.trim(),
        `image for ${company.organization}`,
      ).not.toBe("");
      expect(
        company.roles.length,
        `roles for ${company.organization}`,
      ).toBeGreaterThan(0);
      for (const role of company.roles) {
        expect(role.title.trim(), `title in ${company.organization}`).not.toBe(
          "",
        );
        expect(role.type.trim(), `type in ${company.organization}`).not.toBe(
          "",
        );
        expect(
          role.period.trim(),
          `period in ${company.organization}`,
        ).not.toBe("");
      }
    }
  });

  it("exactly one company is marked current", () => {
    const current = experience.filter((company) => company.current === true);
    expect(current).toHaveLength(1);
  });
});

describe("content: earlierExperience", () => {
  it("every earlier role has required fields; optional links are well-formed", () => {
    expect(earlierExperience.length).toBeGreaterThan(0);
    for (const item of earlierExperience) {
      expect(item.role.trim(), "role").not.toBe("");
      expect(item.organization.trim(), `org for ${item.role}`).not.toBe("");
      expect(item.type.trim(), `type for ${item.role}`).not.toBe("");
      expect(item.period.trim(), `period for ${item.role}`).not.toBe("");
      expect(item.image.trim(), `image for ${item.role}`).not.toBe("");
      if (item.link !== undefined) {
        expect(item.link, `link for ${item.role}`).toMatch(/^https?:\/\//);
      }
      if (item.certificate !== undefined) {
        expect(item.certificate, `certificate for ${item.role}`).toMatch(
          /^certificates\/files\/.+\.(pdf|png|jpe?g)$/,
        );
      }
    }
  });
});

describe("content: certificates", () => {
  const validCategories = certificateCategories
    .filter((c) => c.id !== "all")
    .map((c) => c.id);

  it("every certificate has required fields and a valid category", () => {
    expect(certificates.length).toBeGreaterThan(0);
    for (const cert of certificates) {
      expect(cert.id.trim(), "id").not.toBe("");
      expect(cert.title.trim(), `title for ${cert.id}`).not.toBe("");
      expect(validCategories, `category for ${cert.id}`).toContain(
        cert.category,
      );
      expect(["pdf", "image"], `fileType for ${cert.id}`).toContain(
        cert.fileType,
      );
      if (cert.preview) {
        expect(cert.preview, `preview for ${cert.id}`).toMatch(
          /^certificates\/previews\/.+\.jpg$/,
        );
      }
      if (cert.file) {
        expect(cert.file, `file for ${cert.id}`).toMatch(
          /^certificates\/files\//,
        );
      }
    }
  });

  it("certificate ids are unique", () => {
    const ids = certificates.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("excludes removed/sensitive items (offer letters, professor LOR, Red Hat report)", () => {
    const blob = certificates
      .map((c) => `${c.id} ${c.title}`)
      .join(" ")
      .toLowerCase();
    expect(blob).not.toContain("manmohak");
    expect(blob).not.toContain("offer");
    expect(blob).not.toContain("red hat report");
  });
});
