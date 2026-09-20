// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import {
  CLEARING_FEATURES,
  CONFLICT_SUBJECTS,
  DENIZEN_SPECIES,
  FACTIONS,
  LOCAL_CHALLENGERS,
  generateClearing,
  type Clearing,
  type Faction,
} from "../../src/generators/clearing";

/** Seeds to sweep when an invariant has to hold for every clearing. */
const SEEDS = Array.from({ length: 200 }, (_, index) => `clearing-${index}`);

function clearings(options: { factions?: Faction[] } = {}): Clearing[] {
  return SEEDS.map((seed) => generateClearing({ seed, ...options }));
}

describe("generateClearing", () => {
  it.each(["woodland", "rooston", "", "🌲"])("repeats itself for seed %p", (seed) => {
    expect(generateClearing({ seed })).toEqual(generateClearing({ seed }));
  });

  it("draws a different clearing for a different seed", () => {
    expect(generateClearing({ seed: "woodland" })).not.toEqual(
      generateClearing({ seed: "rooston" }),
    );
  });

  it("draws every field from its own table", () => {
    for (const clearing of clearings()) {
      expect(FACTIONS).toContain(clearing.ruler);
      expect(CLEARING_FEATURES).toEqual(expect.arrayContaining(clearing.features));
      expect(DENIZEN_SPECIES).toEqual(expect.arrayContaining(clearing.inhabitants));
      expect(CONFLICT_SUBJECTS).toContain(clearing.conflict.over);
    }
  });

  it("gives a clearing at least one feature and one species", () => {
    for (const { features, inhabitants } of clearings()) {
      expect(features.length).toBeGreaterThan(0);
      expect(inhabitants.length).toBeGreaterThan(0);
    }
  });

  // What keeps the uniqueness check below honest: a sweep that only ever drew
  // one of each would pass it without exercising anything.
  it("varies how much a clearing has of each", () => {
    const drawn = clearings();

    expect(Math.max(...drawn.map(({ features }) => features.length))).toBeGreaterThan(1);
    expect(Math.max(...drawn.map(({ inhabitants }) => inhabitants.length))).toBeGreaterThan(1);
  });

  // Sampling without replacement is the RNG's contract; that this generator
  // asks for a sample rather than repeated draws is its own.
  it("never repeats a feature or a species within one clearing", () => {
    for (const { features, inhabitants } of clearings()) {
      expect(new Set(features).size).toBe(features.length);
      expect(new Set(inhabitants).size).toBe(inhabitants.length);
    }
  });

  it("never sets the ruling faction against itself", () => {
    for (const { ruler, conflict } of clearings()) {
      expect(conflict.challenger).not.toBe(ruler);
    }
  });

  describe("with the factions in play narrowed", () => {
    const factions: Faction[] = ["Marquisate", "Eyrie Dynasties"];

    it("rules the clearing with one of them", () => {
      for (const { ruler } of clearings({ factions })) {
        expect(factions).toContain(ruler);
      }
    });

    it("keeps a faction that is not in play out of the conflict", () => {
      const possible = [...factions, ...LOCAL_CHALLENGERS];

      for (const { conflict } of clearings({ factions })) {
        expect(possible).toContain(conflict.challenger);
      }
    });

    it("leaves a local challenger when only the ruler is in play", () => {
      for (const { conflict } of clearings({ factions: ["Marquisate"] })) {
        expect(LOCAL_CHALLENGERS).toContain(conflict.challenger);
      }
    });

    it("refuses to rule a clearing when none are", () => {
      expect(() => generateClearing({ seed: "woodland", factions: [] })).toThrow(
        "No factions available to rule the clearing",
      );
    });
  });

  describe("with a ruler chosen", () => {
    it("installs that faction", () => {
      expect(generateClearing({ seed: "woodland", ruler: "Lizard Cult" }).ruler).toBe(
        "Lizard Cult",
      );
    });

    it("rejects one that is not in play", () => {
      expect(() =>
        generateClearing({ seed: "woodland", factions: ["Marquisate"], ruler: "Lizard Cult" }),
      ).toThrow('Invalid ruler provided: "Lizard Cult". Available choices: Marquisate.');
    });
  });
});
