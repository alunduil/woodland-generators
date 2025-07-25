import { generateName, getNameChoices } from "../../src/generators/name";
import { getCollisionThreshold, uniquePairs } from "../utils";
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
            // Calculate threshold based on actual number of name choices
            const nameChoices = getNameChoices();
            const targetSuccessRate = getCollisionThreshold(nameChoices.length);
            const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

            // Count how many pairs produce different results
            let differentResults = 0;

            for (const [seed1, seed2] of seedPairs) {
              const name1 = generateName({ seed: seed1 });
              const name2 = generateName({ seed: seed2 });

              if (name1 !== name2) {
                differentResults++;

                // Stop counting once we've met our target - no need to continue
                if (differentResults >= targetCount) {
                  break;
                }
              }
            }

            // Return true if we met our target threshold
            return differentResults >= targetCount;
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
      const validNames = getNameChoices();

      fc.assert(
        fc.property(fc.string(), (seed) => {
          const result = generateName({ seed });
          return validNames.includes(result);
        }),
      );
    });
  });
});
