import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from "vitest";
import { installConsoleEgg } from "@/lib/consoleEgg";
import { profile, projects, skillGroups } from "@/data/content";

vi.mock("@/lib/confetti", () => ({
  celebrateBig: vi.fn(async () => {}),
  reducedMotion: vi.fn(() => false),
}));

// Spied per test rather than once: restoreMocks tears every spy down before
// each test runs, so a module-level spy would already be gone.
let log: MockInstance<typeof console.log>;
let table: MockInstance<typeof console.table>;

beforeEach(() => {
  delete window.qma;
  delete window.hireMaaz;
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  table = vi.spyOn(console, "table").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * A `%c` with no matching style argument prints the literal escape, so every
 * styled line is only correct if the two counts agree exactly.
 */
function expectStylesMatchDirectives(call: unknown[]) {
  const [format, ...styles] = call as [string, ...string[]];
  expect(format.split("%c").length - 1).toBe(styles.length);
  for (const style of styles) expect(style).toContain("color:");
}

describe("installConsoleEgg", () => {
  it("greets the sneaky dev and points at the command", () => {
    installConsoleEgg();

    const printed = log.mock.calls.map((call) => String(call[0])).join("\n");
    expect(printed).toContain("Hey sneaky dev");
    expect(printed).toContain("hireMaaz()");
  });

  it("draws the wordmark one coloured line at a time", () => {
    installConsoleEgg();

    const [banner, ...styles] = log.mock.calls[0] as [string, ...string[]];
    expect(banner).toContain("█");
    expect(banner.split("\n").filter(Boolean)).toHaveLength(styles.length);
    expect(new Set(styles).size).toBe(styles.length);
  });

  it("exposes the commands it advertises", () => {
    installConsoleEgg();

    expect(typeof window.hireMaaz).toBe("function");
    expect(Object.keys(window.qma!).sort()).toEqual([
      "contact",
      "help",
      "hire",
      "party",
      "projects",
      "resume",
      "skills",
    ]);
  });

  it("only installs once, so a hot reload cannot reprint it", () => {
    installConsoleEgg();
    const first = log.mock.calls.length;
    installConsoleEgg();

    expect(log.mock.calls).toHaveLength(first);
  });

  it("balances every style directive against its argument", () => {
    installConsoleEgg();
    window.hireMaaz!();
    window.qma!.help();
    window.qma!.contact();

    for (const call of log.mock.calls) expectStylesMatchDirectives(call);
  });
});

describe("the commands themselves", () => {
  beforeEach(() => {
    installConsoleEgg();
    log.mockClear();
  });

  it("hands back a real contact route rather than undefined", () => {
    expect(window.hireMaaz!()).toContain(profile.email);
    expect(window.qma!.contact()).toBe(profile.email);
    expect(window.qma!.help()).toBeTruthy();
  });

  it("tabulates the same skills and projects the page shows", () => {
    window.qma!.skills();
    expect(Object.keys(table.mock.calls[0][0] as object)).toEqual(
      skillGroups.map((group) => group.name),
    );

    window.qma!.projects();
    const rows = table.mock.calls[1][0] as { Project: string }[];
    expect(rows).toHaveLength(8);
    expect(rows[0].Project).toBe(projects[0].title);
  });

  it("opens the resume in a new tab without handing over the opener", () => {
    const open = vi.fn();
    vi.stubGlobal("open", open);

    const url = window.qma!.resume();

    expect(url).toContain(profile.resume);
    expect(open).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
  });
});
