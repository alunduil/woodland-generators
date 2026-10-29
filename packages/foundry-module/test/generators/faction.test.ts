// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { FACTIONS, type Faction } from "../../src/generators/clearing-tables";
import { generateFaction, type MinorFaction } from "../../src/generators/faction";
import {
  FACTION_AIMS,
  FACTION_KINDS,
  FACTION_LEVERAGE,
  FACTION_METHODS,
  FACTION_POSTURES,
  NAME_DESCRIPTORS,
  NAME_EMBLEMS,
} from "../../src/generators/faction-tables";

/** Seeds to sweep when an invariant has to hold for every faction. */
const SEEDS = Array.from({ length: 200 }, (_, index) => `faction-${index}`);

function factions(options: { factions?: Faction[] } = {}): MinorFaction[] {
  return SEEDS.map((seed) => generateFaction({ seed, ...options }));
}

const GREAT_POWER_WORDS = new Set(FACTIONS.flatMap((power) => power.toLowerCase().split(" ")));

describe("generateFaction", () => {
  it.each(["woodland", "rooston", "", "🌲"])("repeats itself for seed %p", (seed) => {
    expect(generateFaction({ seed })).toEqual(generateFaction({ seed }));
  });

  it("draws a different faction for a different seed", () => {
    expect(generateFaction({ seed: "woodland" })).not.toEqual(generateFaction({ seed: "rooston" }));
  });

  it("draws every field from its own table", () => {
    for (const faction of factions()) {
      expect(FACTION_KINDS).toContain(faction.kind);
      expect(FACTION_AIMS).toContain(faction.aim);
      expect(FACTION_METHODS).toContain(faction.method);
      expect(FACTION_LEVERAGE).toContain(faction.leverage);

      for (const { power, posture } of faction.stances) {
        expect(FACTIONS).toContain(power);
        expect(FACTION_POSTURES).toContain(posture);
      }
    }
  });

  it("titles the name with the faction's kind", () => {
    for (const { name, kind } of factions()) {
      expect(name.toLowerCase().endsWith(` ${kind}`)).toBe(true);
    }
  });

  // The kind closing a name may share a word with a great power ("Company",
  // "Cult"), so the guarantee rests on the words chosen before it.
  it("builds names from words no great power uses", () => {
    for (const word of [...NAME_DESCRIPTORS, ...NAME_EMBLEMS]) {
      expect(GREAT_POWER_WORDS).not.toContain(word.toLowerCase());
    }
  });

  it("never names a faction after a great power", () => {
    for (const { name } of factions()) {
      for (const power of FACTIONS) {
        expect(name).not.toContain(power);
      }
    }
  });

  it("takes a stance toward at least one great power", () => {
    for (const { stances } of factions()) {
      expect(stances.length).toBeGreaterThan(0);
    }
  });

  // A sweep that only ever drew one stance would pass the uniqueness check
  // without exercising it.
  it("varies how many great powers a faction deals with", () => {
    expect(Math.max(...factions().map(({ stances }) => stances.length))).toBeGreaterThan(1);
  });

  it("never takes two stances toward the same great power", () => {
    for (const { stances } of factions()) {
      const powers = stances.map(({ power }) => power);

      expect(new Set(powers).size).toBe(powers.length);
    }
  });

  describe("with the great powers in play narrowed", () => {
    const inPlay: Faction[] = ["Marquisate", "Eyrie Dynasties"];

    it("only takes stances toward them", () => {
      for (const { stances } of factions({ factions: inPlay })) {
        for (const { power } of stances) {
          expect(inPlay).toContain(power);
        }
      }
    });

    it("takes a single stance when only one is in play", () => {
      for (const { stances } of factions({ factions: ["Lizard Cult"] })) {
        expect(stances.map(({ power }) => power)).toEqual(["Lizard Cult"]);
      }
    });

    it("refuses to generate a faction when none are", () => {
      expect(() => generateFaction({ seed: "woodland", factions: [] })).toThrow(
        "No great powers available to take a stance toward",
      );
    });
  });
});
