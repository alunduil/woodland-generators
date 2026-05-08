import { FeatGenerator, FeatGeneratorOptions } from "../../src/generators/feat";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../utils";
import fc from "fast-check";

describe("FeatGenerator", () => {
  describe("property: deterministic generation", () => {
    it.skip("should be deterministic with same seed", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (seed, availableFeats) => {
            const generator = new FeatGenerator({ availableFeats });

            const result1 = generator.generate({ seed });
            const result2 = generator.generate({ seed });

            return JSON.stringify(result1) === JSON.stringify(result2);
          },
        ),
      );
    });

    it.skip("should return different feats for different seeds", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 3, maxLength: 5 },
          ).chain((availableFeats) => {
            // Generate seed pairs with size proportional to feats to ensure meaningful statistics
            const minPairs = Math.max(10, Math.floor(availableFeats.length * 1.5));
            const maxPairs = Math.max(15, availableFeats.length * 2);

            return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
              (seedPairs) => ({ availableFeats, seedPairs }),
            );
          }),
          ({ availableFeats, seedPairs }) => {
            const generator = new FeatGenerator({ availableFeats });

            // Calculate threshold based on actual number of feats
            const targetSuccessRate = getCollisionThreshold(availableFeats.length);
            const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

            // Count how many pairs produce different results
            let differentResults = 0;

            for (const [seed1, seed2] of seedPairs) {
              const result1 = generator.generate({ seed: seed1 });
              const result2 = generator.generate({ seed: seed2 });

              if (JSON.stringify(result1) !== JSON.stringify(result2)) {
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

  describe("property: valid generation", () => {
    it("should always return feats from available options", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          (availableFeats) => {
            const generator = new FeatGenerator({ availableFeats });
            const result = generator.generate();

            if (!result) {
              // Should only be null if generator is not available
              return !generator.isAvailable();
            }

            // Result should be from available feats
            return availableFeats.includes(result);
          },
        ),
      );
    });

    it("should return null when no feats available", () => {
      const generator = new FeatGenerator({ availableFeats: [] });
      const result = generator.generate();
      expect(result).toBeNull();
    });
  });

  describe("property: availability logic", () => {
    it("should be available when feats exist", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (availableFeats) => {
            const generator = new FeatGenerator({ availableFeats });
            return generator.isAvailable();
          },
        ),
      );
    });

    it("should not be available when no feats exist", () => {
      const generator = new FeatGenerator({ availableFeats: [] });
      expect(generator.isAvailable()).toBe(false);
    });
  });

  describe("property: options management", () => {
    it("should return all available feats in getAvailableOptions", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          (availableFeats) => {
            const generator = new FeatGenerator({ availableFeats });
            const options = generator.getAvailableOptions();

            return JSON.stringify(options) === JSON.stringify(availableFeats);
          },
        ),
      );
    });

    it("should return copy of original array from getAvailableOptions", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (availableFeats) => {
            const generator = new FeatGenerator({ availableFeats });
            const options = generator.getAvailableOptions();

            // Modify the returned array
            options.push("Modified");

            // Original should be unchanged
            const optionsAgain = generator.getAvailableOptions();
            return JSON.stringify(optionsAgain) === JSON.stringify(availableFeats);
          },
        ),
      );
    });
  });

  describe("property: update options", () => {
    it("should maintain generator behavior after options update", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 3 },
          ),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 3 },
          ),
          (initialFeats, newFeats) => {
            const generator = new FeatGenerator({ availableFeats: initialFeats });

            generator.updateOptions(newFeats);

            const result = generator.generate();
            const availableOptions = generator.getAvailableOptions();

            // After update, should behave as if created with new options
            if (newFeats.length === 0) {
              return result === null && availableOptions.length === 0;
            }

            if (!result) {
              return false;
            }

            return (
              newFeats.includes(result) &&
              JSON.stringify(availableOptions) === JSON.stringify(newFeats)
            );
          },
        ),
      );
    });

    it("should handle empty feat arrays", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (initialFeats) => {
            const generator = new FeatGenerator({ availableFeats: initialFeats });

            generator.updateOptions([]);

            return !generator.isAvailable() && generator.generate() === null;
          },
        ),
      );
    });
  });

  describe("property: constructor options", () => {
    it("should handle all valid constructor combinations", () => {
      fc.assert(
        fc.property(
          uniqueArray(fc.string(), { minLength: 0, maxLength: 5 }),
          fc.option(fc.string()),
          fc.option(fc.boolean()),
          (availableFeats, seed, useFallbacks) => {
            const options: FeatGeneratorOptions = { availableFeats };
            if (seed !== null) options.seed = seed;
            if (useFallbacks !== null) options.useFallbacks = useFallbacks;

            const generator = new FeatGenerator(options);

            // Generator should always be constructible
            expect(generator).toBeInstanceOf(FeatGenerator);

            // Availability should match having feats
            return generator.isAvailable() === availableFeats.length > 0;
          },
        ),
      );
    });

    it("should disable fallbacks by default", () => {
      fc.assert(
        fc.property(uniqueArray(fc.string(), { minLength: 0, maxLength: 3 }), (availableFeats) => {
          const generator = new FeatGenerator({ availableFeats });

          // With empty feats and default fallbacks (false), should not be available
          if (availableFeats.length === 0) {
            return !generator.isAvailable();
          }

          return generator.isAvailable();
        }),
      );
    });
  });

  describe("property: seed handling", () => {
    it("should accept seed override in generate method", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          fc.string(),
          fc.string(),
          (availableFeats, constructorSeed, overrideSeed) => {
            const generator = new FeatGenerator({ availableFeats, seed: constructorSeed });

            const result = generator.generate({ seed: overrideSeed });

            if (!result) {
              return !generator.isAvailable();
            }

            return availableFeats.includes(result);
          },
        ),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in feat names", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (baseFeats) => {
            const specialFeats = [
              ...baseFeats,
              "Warrior's Pride",
              "Healer-Mage",
              "Scout (Advanced)",
              "Fire & Ice",
              "🎭",
            ];

            const generator = new FeatGenerator({ availableFeats: specialFeats });
            const result = generator.generate();

            if (!result) {
              return specialFeats.length === 0;
            }

            return specialFeats.includes(result);
          },
        ),
      );
    });

    it("should handle duplicate feats", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => s.length > 0),
          fc.integer({ min: 2, max: 10 }),
          (feat, duplicateCount) => {
            const duplicateFeats = Array(duplicateCount).fill(feat);
            const generator = new FeatGenerator({ availableFeats: duplicateFeats });

            const result = generator.generate();

            // Should still generate the feat even with duplicates
            return result === feat;
          },
        ),
      );
    });

    it("should handle very long feat names", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          fc.string({ minLength: 1, maxLength: 1 }),
          (length, char) => {
            const longFeat = char.repeat(length);
            const generator = new FeatGenerator({ availableFeats: [longFeat] });

            const result = generator.generate();
            return result === longFeat;
          },
        ),
      );
    });

    it("should handle large numbers of feats", () => {
      fc.assert(
        fc.property(fc.integer({ min: 50, max: 200 }), (featCount) => {
          const manyFeats = Array.from({ length: featCount }, (_, i) => `Feat${i}`);
          const generator = new FeatGenerator({ availableFeats: manyFeats });

          expect(generator.isAvailable()).toBe(true);
          expect(generator.getAvailableOptions()).toHaveLength(featCount);

          const result = generator.generate();
          return result !== null && manyFeats.includes(result!);
        }),
      );
    });

    it("should handle mixed valid and problematic feat names", () => {
      const mixedFeats = [
        "Warrior",
        "", // empty string
        "   ", // whitespace only
        "Valid Feat",
      ];

      const generator = new FeatGenerator({ availableFeats: mixedFeats });
      const result = generator.generate();

      // Should return one of the available feats (including empty/whitespace)
      expect(mixedFeats).toContain(result);
    });
  });
});
