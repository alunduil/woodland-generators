import { BackgroundGenerator } from "../../src/generators/background";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../utils";
import fc from "fast-check";

describe("BackgroundGenerator", () => {
  describe("property: deterministic generation", () => {
    it.skip("should be deterministic with same seed", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (seed, homeOptions, motivationOptions) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions });

            const result1 = generator.generate({ seed });
            const result2 = generator.generate({ seed });

            return JSON.stringify(result1) === JSON.stringify(result2);
          },
        ),
      );
    });

    it.skip("should return different backgrounds for different seeds", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 3, maxLength: 5 },
          ).chain((homeOptions) => {
            return uniqueArray(
              fc.string().filter((s) => s.length > 0),
              { minLength: 3, maxLength: 5 },
            ).chain((motivationOptions) => {
              // Generate seed pairs with size proportional to options to ensure meaningful statistics
              const totalCombinations = homeOptions.length * motivationOptions.length;
              const minPairs = Math.max(10, Math.floor(totalCombinations * 1.5));
              const maxPairs = Math.max(15, totalCombinations * 2);

              return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
                (seedPairs) => ({ homeOptions, motivationOptions, seedPairs }),
              );
            });
          }),
          ({ homeOptions, motivationOptions, seedPairs }) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions });

            // Calculate threshold based on actual number of combinations
            const totalCombinations = homeOptions.length * motivationOptions.length;
            const targetSuccessRate = getCollisionThreshold(totalCombinations);
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
    it("should always return backgrounds from available options", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          (homeOptions, motivationOptions) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions });
            const result = generator.generate();

            if (!result) {
              // Should only be null if generator is not available
              return !generator.isAvailable();
            }

            // Home should be from options or null if no home options
            const validHome =
              homeOptions.length === 0 ? result.home === null : homeOptions.includes(result.home!);

            // Motivation should be from options or null if no motivation options
            const validMotivation =
              motivationOptions.length === 0
                ? result.motivation === null
                : motivationOptions.includes(result.motivation!);

            return validHome && validMotivation;
          },
        ),
      );
    });

    it("should return null when no options available", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          const generator = new BackgroundGenerator({ homeOptions: [], motivationOptions: [] });
          const result = generator.generate({ seed });
          return result === null;
        }),
      );
    });
  });

  describe("property: availability logic", () => {
    it("should be available when home options exist", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (homeOptions) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions: [] });
            return generator.isAvailable();
          },
        ),
      );
    });

    it("should be available when motivation options exist", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (motivationOptions) => {
            const generator = new BackgroundGenerator({ homeOptions: [], motivationOptions });
            return generator.isAvailable();
          },
        ),
      );
    });

    it("should not be available when no options exist", () => {
      const generator = new BackgroundGenerator({ homeOptions: [], motivationOptions: [] });
      expect(generator.isAvailable()).toBe(false);
    });
  });

  describe("property: options combinations", () => {
    it("should generate all combinations in getAvailableOptions", () => {
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
          (homeOptions, motivationOptions) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions });
            const availableOptions = generator.getAvailableOptions();

            const expectedLength = homeOptions.length * motivationOptions.length;

            if (expectedLength === 0) {
              return availableOptions.length === 0;
            }

            // Should have exactly the right number of combinations
            if (availableOptions.length !== expectedLength) {
              return false;
            }

            // Every combination should be present
            for (const home of homeOptions) {
              for (const motivation of motivationOptions) {
                const found = availableOptions.some(
                  (option) => option.home === home && option.motivation === motivation,
                );
                if (!found) {
                  return false;
                }
              }
            }

            return true;
          },
        ),
      );
    });
  });

  describe("property: update options", () => {
    it("should maintain generator behavior after options update", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 3 },
          ),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 3 },
          ),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 3 },
          ),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 3 },
          ),
          (seed, initialHome, initialMotivation, newHome, newMotivation) => {
            const generator = new BackgroundGenerator({
              homeOptions: initialHome,
              motivationOptions: initialMotivation,
            });

            generator.updateOptions(newHome, newMotivation);

            const result = generator.generate({ seed });
            const availableOptions = generator.getAvailableOptions();

            // After update, should behave as if created with new options
            const expectedLength = newHome.length * newMotivation.length;

            if (expectedLength === 0) {
              return result === null && availableOptions.length === 0;
            }

            if (!result) {
              return false;
            }

            const validHome =
              newHome.length === 0 ? result.home === null : newHome.includes(result.home!);

            const validMotivation =
              newMotivation.length === 0
                ? result.motivation === null
                : newMotivation.includes(result.motivation!);

            return validHome && validMotivation && availableOptions.length === expectedLength;
          },
        ),
      );
    });
  });

  describe("property: partial availability", () => {
    it("should handle home-only scenarios correctly", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (homeOptions) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions: [] });
            const result = generator.generate();

            if (!result) return false;

            return homeOptions.includes(result.home!) && result.motivation === null;
          },
        ),
      );
    });

    it("should handle motivation-only scenarios correctly", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (motivationOptions) => {
            const generator = new BackgroundGenerator({ homeOptions: [], motivationOptions });
            const result = generator.generate();

            if (!result) return false;

            return result.home === null && motivationOptions.includes(result.motivation!);
          },
        ),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty options gracefully", () => {
      const generator = new BackgroundGenerator({ homeOptions: [], motivationOptions: [] });

      expect(generator.isAvailable()).toBe(false);
      expect(generator.generate()).toBeNull();
      expect(generator.getAvailableOptions()).toEqual([]);
    });

    it("should handle single option arrays", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string().filter((s) => s.length > 0),
          fc.string().filter((s) => s.length > 0),
          (seed, home, motivation) => {
            const generator = new BackgroundGenerator({
              homeOptions: [home],
              motivationOptions: [motivation],
            });

            const result = generator.generate({ seed });
            return result !== null && result.home === home && result.motivation === motivation;
          },
        ),
      );
    });

    it("should handle constructor options validation", () => {
      fc.assert(
        fc.property(
          uniqueArray(fc.string(), { minLength: 0, maxLength: 5 }),
          uniqueArray(fc.string(), { minLength: 0, maxLength: 5 }),
          (homeOptions, motivationOptions) => {
            const generator = new BackgroundGenerator({ homeOptions, motivationOptions });

            // Generator should always be constructible
            expect(generator).toBeInstanceOf(BackgroundGenerator);

            // Availability should match having any options
            const hasOptions = homeOptions.length > 0 || motivationOptions.length > 0;
            return generator.isAvailable() === hasOptions;
          },
        ),
      );
    });
  });
});
