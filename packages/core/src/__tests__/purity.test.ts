import { describe, expect, it } from "vitest";

// Guard test for the HARD RULE: the pure source files must never import React,
// the DB, or next, never read process.env, and never read the wall clock
// (Date.now / argless `new Date()`). A static scan of the production sources
// (the __tests__ dir is excluded — tests legitimately use Date.now and Intl).
//
// Sources are loaded via Vite's `import.meta.glob(..., { as: "raw" })` so this
// needs no node:fs / @types/node. The minimal ambient declaration below keeps
// `tsc --noEmit` happy without pulling in extra type packages.

interface GlobImportMeta {
  glob: (
    pattern: string,
    options: { query: "?raw"; import: "default"; eager: true },
  ) => Record<string, string>;
}

const raw = (import.meta as unknown as GlobImportMeta).glob("../*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** filename (basename) → source text, for the production sources only. */
const SOURCES: Record<string, string> = {};
for (const [path, text] of Object.entries(raw)) {
  const base = path.split("/").pop() ?? path;
  SOURCES[base] = text;
}
const PRODUCTION_FILES = Object.keys(SOURCES).sort();

/** Strip line and block comments so prose documenting the rule (e.g.
 *  "never read process.env") doesn't trip the scan — we check CODE only. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("purity — the I/O-free hard rule", () => {
  it("scans the expected production source files", () => {
    expect(PRODUCTION_FILES).toEqual(
      [
        "blocked.ts",
        "critical-path.ts",
        "cycle.ts",
        "index.ts",
        "window-state.ts",
      ].sort(),
    );
  });

  for (const file of PRODUCTION_FILES) {
    describe(file, () => {
      const source = stripComments(SOURCES[file] ?? "");

      it("does not import React / next / the DB", () => {
        expect(source).not.toMatch(/from\s+["']react["']/);
        expect(source).not.toMatch(/from\s+["']next(\/|["'])/);
        expect(source).not.toMatch(/from\s+["']@opsboard\/db/);
        expect(source).not.toMatch(/from\s+["']drizzle/);
      });

      it("does not read process.env", () => {
        expect(source).not.toMatch(/process\s*\.\s*env/);
      });

      it("does not read the wall clock (Date.now / argless new Date())", () => {
        expect(source).not.toMatch(/Date\s*\.\s*now\s*\(/);
        // `new Date(` with NO argument before the closing paren.
        expect(source).not.toMatch(/new\s+Date\s*\(\s*\)/);
      });
    });
  }
});
