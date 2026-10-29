// SPDX-FileCopyrightText: 2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { FACTIONS, type Faction } from "../../src/generators/clearing-tables";
import { generateMinorFaction, type MinorFaction } from "../../src/generators/minor-faction";
import {
  MINOR_FACTION_AIMS,
  MINOR_FACTION_KINDS,
  MINOR_FACTION_LEVERAGE,
  MINOR_FACTION_METHODS,
  MINOR_FACTION_POSTURES,
  NAME_DESCRIPTORS,
  NAME_EMBLEMS,
} from "../../src/generators/minor-faction-tables";

/** Seeds to sweep when an invariant has to hold for every minor faction. */
const SEEDS = Array.from({ length: 200 }, (_, index) => `minor-faction-${index}`);

function minorFactions(options: { factions?: Faction[] } = {}): MinorFaction[] {
  return SEEDS.map((seed) => generateMinorFaction({ seed, ...options }));
}

const GREAT_POWER_WORDS = new Set(FACTIONS.flatMap((power) => power.toLowerCase().split(" ")));

describe("generateMinorFaction", () => {
  it.each(["woodland", "rooston", "", "🌲"])("repeats itself for seed %p", (seed) => {
    expect(generateMinorFaction({ seed })).toEqual(generateMinorFaction({ seed }));
  });

  it("draws a different minor faction for a different seed", () => {
    expect(generateMinorFaction({ seed: "woodland" })).not.toEqual(
      generateMinorFaction({ seed: "rooston" }),
    );
  });

  it("draws every field from its own table", () => {
    for (const minorFaction of minorFactions()) {
      expect(MINOR_FACTION_KINDS).toContain(minorFaction.kind);
      expect(MINOR_FACTION_AIMS).toContain(minorFaction.aim);
      expect(MINOR_FACTION_METHODS).toContain(minorFaction.method);
      expect(MINOR_FACTION_LEVERAGE).toContain(minorFaction.leverage);

      for (const { power, posture } of minorFaction.stances) {
        expect(FACTIONS).toContain(power);
        expect(MINOR_FACTION_POSTURES).toContain(posture);
      }
    }
  });

  it("titles the name with the faction's kind", () => {
    for (const { name, kind } of minorFactions()) {
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

  it("never names a minor faction after a great power", () => {
    for (const { name } of minorFactions()) {
      for (const power of FACTIONS) {
        expect(name).not.toContain(power);
      }
    }
  });

  it("takes a stance toward at least one great power", () => {
    for (const { stances } of minorFactions()) {
      expect(stances.length).toBeGreaterThan(0);
    }
  });

  // A sweep that only ever drew one stance would pass the uniqueness check
  // without exercising it.
  it("varies how many great powers a minor faction deals with", () => {
    expect(Math.max(...minorFactions().map(({ stances }) => stances.length))).toBeGreaterThan(1);
  });

  it("never takes two stances toward the same great power", () => {
    for (const { stances } of minorFactions()) {
      const powers = stances.map(({ power }) => power);

      expect(new Set(powers).size).toBe(powers.length);
    }
  });

  describe("with the great powers in play narrowed", () => {
    const inPlay: Faction[] = ["Marquisate", "Eyrie Dynasties"];

    it("only takes stances toward them", () => {
      for (const { stances } of minorFactions({ factions: inPlay })) {
        for (const { power } of stances) {
          expect(inPlay).toContain(power);
        }
      }
    });

    it("takes a single stance when only one is in play", () => {
      for (const { stances } of minorFactions({ factions: ["Lizard Cult"] })) {
        expect(stances.map(({ power }) => power)).toEqual(["Lizard Cult"]);
      }
    });
  });
});
