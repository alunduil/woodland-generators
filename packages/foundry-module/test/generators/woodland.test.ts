// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import {
  CLEARING_NAMES,
  DOMINANT_COMMUNITIES,
  type ClearingName,
} from "../../src/generators/clearing-tables";
import { generateWoodland, type Woodland } from "../../src/generators/woodland";

/** Seeds to sweep when an invariant has to hold for every Woodland. */
const SEEDS = Array.from({ length: 200 }, (_, index) => `woodland-${index}`);

const woodlands: Woodland[] = SEEDS.map((seed) => generateWoodland({ seed }));

function pathCount({ paths, unfinishedPaths }: Woodland, name: ClearingName): number {
  return (
    paths.filter((path) => path.includes(name)).length +
    unfinishedPaths.filter((from) => from === name).length
  );
}

function reachable({ clearings, paths }: Woodland): Set<ClearingName> {
  const seen = new Set<ClearingName>([clearings[0]!.name]);
  const frontier = [clearings[0]!.name];

  for (let current = frontier.pop(); current; current = frontier.pop()) {
    for (const [a, b] of paths) {
      const next = a === current ? b : b === current ? a : undefined;
      if (next && !seen.has(next)) {
        seen.add(next);
        frontier.push(next);
      }
    }
  }

  return seen;
}

describe("generateWoodland", () => {
  it.each(["woodland", "rooston", "", "🌲"])("repeats itself for seed %p", (seed) => {
    expect(generateWoodland({ seed })).toEqual(generateWoodland({ seed }));
  });

  it("draws a different Woodland for a different seed", () => {
    expect(generateWoodland({ seed: "woodland" })).not.toEqual(
      generateWoodland({ seed: "rooston" }),
    );
  });

  it("lays out twelve clearings in one connected graph", () => {
    for (const woodland of woodlands) {
      expect(woodland.clearings).toHaveLength(12);
      expect(reachable(woodland).size).toBe(12);
    }
  });

  it("names every clearing from the table, without repeats", () => {
    for (const { clearings } of woodlands) {
      const names = clearings.map(({ name }) => name);

      expect(CLEARING_NAMES).toEqual(expect.arrayContaining(names));
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("gives no community more than four clearings", () => {
    for (const { clearings } of woodlands) {
      for (const community of DOMINANT_COMMUNITIES) {
        expect(
          clearings.filter((clearing) => clearing.community === community).length,
        ).toBeLessThanOrEqual(4);
      }
    }
  });

  it("gives every clearing one to five paths, unfinished ones included", () => {
    for (const woodland of woodlands) {
      for (const { name } of woodland.clearings) {
        expect(pathCount(woodland, name)).toBeGreaterThanOrEqual(1);
        expect(pathCount(woodland, name)).toBeLessThanOrEqual(5);
      }
    }
  });

  it("joins two clearings by at most one path, and never a clearing to itself", () => {
    for (const { paths } of woodlands) {
      const keys = paths.map(([a, b]) => [a, b].sort().join("|"));

      expect(paths.every(([a, b]) => a !== b)).toBe(true);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("keeps unfinished paths on the map", () => {
    expect(woodlands.some(({ unfinishedPaths }) => unfinishedPaths.length > 0)).toBe(true);
  });

  // A sweep of trees would pass the connectivity check without the join step
  // ever running.
  it("closes loops by joining unfinished paths", () => {
    expect(woodlands.some(({ paths }) => paths.length > 11)).toBe(true);
  });
});
