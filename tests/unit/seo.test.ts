import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { socials } from "@/data/content";

const read = (relPath: string) =>
  readFileSync(resolve(process.cwd(), relPath), "utf8");

const html = read("index.html");

describe("SEO: index.html head", () => {
  it("has a descriptive title, description, canonical, and OG/Twitter tags", () => {
    expect(html).toMatch(/<title>[^<]*Qazi Maaz Arshad[^<]*<\/title>/);
    expect(html).toMatch(/name="description"[^>]*content="[^"]+"/);
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:url"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="twitter:image:alt"');
    expect(html).toContain('name="robots"');
  });

  // A share card that 404s fails silently — the link just previews as bare
  // text, and nothing in the app would ever notice.
  it("points og:image and twitter:image at a file that is actually shipped", () => {
    const urls = [
      ...html.matchAll(
        /(?:property|name)="(?:og|twitter):image"\s*\n?\s*content="([^"]+)"/g,
      ),
    ].map((m) => m[1]);

    expect(urls.length, "og:image and twitter:image both present").toBe(2);

    for (const url of urls) {
      const path = new URL(url).pathname.replace(/^\//, "");
      expect(
        existsSync(resolve(process.cwd(), "public", path)),
        `${path} exists in public/`,
      ).toBe(true);
    }
  });

  it("includes valid Person JSON-LD linking every public profile", () => {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(match, "JSON-LD block present").not.toBeNull();

    const data = JSON.parse(match![1]);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Qazi Maaz Arshad");
    expect(data.url).toBe("https://qazimaazarshad.github.io/");
    expect(data.alumniOf?.name).toMatch(/Lovely Professional University/);
    expect(Array.isArray(data.sameAs)).toBe(true);

    // Every public social profile is linked via sameAs (drift guard).
    for (const social of socials.filter((s) => s.id !== "email")) {
      expect(data.sameAs, social.id).toContain(social.href);
    }
  });
});

describe("SEO: robots.txt & sitemap.xml", () => {
  it("robots.txt allows crawling and references the sitemap", () => {
    const robots = read("public/robots.txt");
    expect(robots).toMatch(/User-agent:\s*\*/i);
    expect(robots).toMatch(/Allow:\s*\//i);
    expect(robots).toContain("sitemap.xml");
  });

  it("sitemap.xml lists the canonical site URL", () => {
    const sitemap = read("public/sitemap.xml");
    expect(sitemap).toContain("<urlset");
    expect(sitemap).toContain("https://qazimaazarshad.github.io/");
  });
});
