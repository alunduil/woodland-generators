// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { generateName, CHARACTER_NAMES } from "../../src/generators/name";
import { enoughPairsDiffer, getCollisionThreshold, uniquePairs } from "../utils";
import fc from "fast-check";

describe("generateName", () => {
  describe("property: deterministic generation", () => {
    it("should return the same name for the same seed", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          const name1 = generateName({ seed });
          const name2 = generateName({ seed });
          return name1 === name2;
        }),
      );
    });

    it("should return different names for different seeds", () => {
      fc.assert(
        fc.property(
          uniquePairs(fc.string(), { minLength: 5, maxLength: 15 }), // Ensure enough pairs for meaningful statistics
          (seedPairs) => {
            const targetSuccessRate = getCollisionThreshold(CHARACTER_NAMES.length);
            const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

            return enoughPairsDiffer(seedPairs, targetCount, (seed) => generateName({ seed }));
          },
        ),
      );
    });
  });

  describe("property: user name injection", () => {
    it("should return provided name regardless of seed", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string().filter((s) => s.length > 0),
          (seed, providedName) => {
            const result = generateName({ seed, name: providedName });
            return result === providedName;
          },
        ),
      );
    });
  });

  describe("property: valid name selection", () => {
    it("should always return a name from the valid set", () => {
      const validNames = [...CHARACTER_NAMES];

      fc.assert(
        fc.property(fc.string(), (seed) => {
          const result = generateName({ seed });
          return (validNames as readonly string[]).includes(result);
        }),
      );
    });
  });
});
