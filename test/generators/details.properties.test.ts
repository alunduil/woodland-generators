import { generateDetails } from "../../src/generators/details";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../utils";
import { root } from "../../src/logging";
import fc from "fast-check";

describe("generateDetails", () => {
  beforeEach(() => {
    root.level = "silent";
  });
  describe("property: user details validation", () => {
    it("should return provided details when they are from available choices", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          (seed, pronounChoices, appearanceChoices, accessoryChoices) => {
            const choices = {
              pronouns: pronounChoices,
              appearance: appearanceChoices,
              accessories: accessoryChoices,
            };
            const details = {
              pronouns: [pronounChoices[0]!],
              appearance: [appearanceChoices[0]!],
              accessories: [accessoryChoices[0]!],
            };

            const result = generateDetails({
              seed,
              choices,
              details,
            });

            return JSON.stringify(result) === JSON.stringify(details);
          },
        ),
      );
    });

    it("should handle partial user details correctly when they are from available choices", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          (seed, pronounChoices, appearanceChoices, accessoryChoices) => {
            const choices = {
              pronouns: pronounChoices,
              appearance: appearanceChoices,
              accessories: accessoryChoices,
            };
            const details = {
              pronouns: [pronounChoices[0]!],
              // appearance and accessories will be generated
            };

            const result = generateDetails({
              seed,
              choices,
              details,
            });

            return (
              JSON.stringify(result.pronouns) === JSON.stringify([pronounChoices[0]!]) &&
              result.appearance.every((item) => appearanceChoices.includes(item)) &&
              result.accessories.every((item) => accessoryChoices.includes(item))
            );
          },
        ),
      );
    });

    it("should throw error when user pronouns are not in available choices", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc
            .tuple(
              uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
              fc.string({ minLength: 1 }),
            )
            .filter(([pronounChoices, invalidPronoun]) => !pronounChoices.includes(invalidPronoun)),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          (seed, [pronounChoices, invalidPronoun], appearanceChoices, accessoryChoices) => {
            const choices = {
              pronouns: pronounChoices,
              appearance: appearanceChoices,
              accessories: accessoryChoices,
            };

            expect(() => {
              generateDetails({
                seed,
                choices,
                details: {
                  pronouns: [invalidPronoun],
                },
              });
            }).toThrow();

            return true;
          },
        ),
      );
    });

    it("should throw error when user appearance is not in available choices", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          fc
            .tuple(
              uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
              fc.string({ minLength: 1 }),
            )
            .filter(
              ([appearanceChoices, invalidAppearance]) =>
                !appearanceChoices.includes(invalidAppearance),
            ),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          (seed, pronounChoices, [appearanceChoices, invalidAppearance], accessoryChoices) => {
            const choices = {
              pronouns: pronounChoices,
              appearance: appearanceChoices,
              accessories: accessoryChoices,
            };

            expect(() => {
              generateDetails({
                seed,
                choices,
                details: {
                  appearance: [invalidAppearance],
                },
              });
            }).toThrow();

            return true;
          },
        ),
      );
    });

    it("should throw error when user accessories are not in available choices", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          fc
            .tuple(
              uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
              fc.string({ minLength: 1 }),
            )
            .filter(
              ([accessoryChoices, invalidAccessory]) =>
                !accessoryChoices.includes(invalidAccessory),
            ),
          (seed, pronounChoices, appearanceChoices, [accessoryChoices, invalidAccessory]) => {
            const choices = {
              pronouns: pronounChoices,
              appearance: appearanceChoices,
              accessories: accessoryChoices,
            };

            expect(() => {
              generateDetails({
                seed,
                choices,
                details: {
                  accessories: [invalidAccessory],
                },
              });
            }).toThrow();

            return true;
          },
        ),
      );
    });
  });

  describe("property: valid details selection", () => {
    describe("with generated choices", () => {
      it("should always return details from the valid choices", () => {
        fc.assert(
          fc.property(
            fc.string(),
            uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
            uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
            uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
            (seed, pronounChoices, appearanceChoices, accessoryChoices) => {
              const choices = {
                pronouns: pronounChoices,
                appearance: appearanceChoices,
                accessories: accessoryChoices,
              };
              const result = generateDetails({ seed, choices });

              return (
                result.pronouns.every((p) => pronounChoices.includes(p)) &&
                result.appearance.every((a) => appearanceChoices.includes(a)) &&
                result.accessories.every((acc) => accessoryChoices.includes(acc))
              );
            },
          ),
        );
      });

      it("should be deterministic with generated choices", () => {
        fc.assert(
          fc.property(
            fc.string(),
            uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
            uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
            uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
            (seed, pronounChoices, appearanceChoices, accessoryChoices) => {
              const choices = {
                pronouns: pronounChoices,
                appearance: appearanceChoices,
                accessories: accessoryChoices,
              };
              const result1 = generateDetails({ seed, choices });
              const result2 = generateDetails({ seed, choices });

              return JSON.stringify(result1) === JSON.stringify(result2);
            },
          ),
        );
      });

      it("should return different details for different seeds with generated choices", () => {
        fc.assert(
          fc.property(
            fc
              .tuple(
                uniqueArray(fc.string({ minLength: 1 }), { minLength: 4, maxLength: 8 }),
                uniqueArray(fc.string({ minLength: 1 }), { minLength: 4, maxLength: 8 }),
                uniqueArray(fc.string({ minLength: 1 }), { minLength: 4, maxLength: 8 }),
              )
              .chain(([pronounChoices, appearanceChoices, accessoryChoices]) => {
                // Generate seed pairs with size proportional to combinations
                const totalCombinations =
                  pronounChoices.length * appearanceChoices.length * accessoryChoices.length;
                const minPairs = Math.max(10, Math.floor(totalCombinations * 0.5));
                const maxPairs = Math.max(15, totalCombinations);

                return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
                  (seedPairs) => ({
                    pronounChoices,
                    appearanceChoices,
                    accessoryChoices,
                    seedPairs,
                  }),
                );
              }),
            ({ pronounChoices, appearanceChoices, accessoryChoices, seedPairs }) => {
              const choices = {
                pronouns: pronounChoices,
                appearance: appearanceChoices,
                accessories: accessoryChoices,
              };
              // Calculate threshold based on actual number of combinations
              const totalCombinations =
                pronounChoices.length * appearanceChoices.length * accessoryChoices.length;
              const targetSuccessRate = getCollisionThreshold(totalCombinations);
              const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

              // Count how many pairs produce different results
              let differentResults = 0;

              for (const [seed1, seed2] of seedPairs) {
                const result1 = generateDetails({ seed: seed1, choices });
                const result2 = generateDetails({ seed: seed2, choices });

                if (JSON.stringify(result1) !== JSON.stringify(result2)) {
                  differentResults++;

                  if (differentResults >= targetCount) {
                    break;
                  }
                }
              }

              return differentResults >= targetCount;
            },
          ),
        );
      });
    });

    it("should always generate non-empty arrays for each category", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
          (seed, pronounChoices, appearanceChoices, accessoryChoices) => {
            const choices = {
              pronouns: pronounChoices,
              appearance: appearanceChoices,
              accessories: accessoryChoices,
            };
            const result = generateDetails({ seed, choices });

            return (
              result.pronouns.length > 0 &&
              result.appearance.length > 0 &&
              result.accessories.length > 0
            );
          },
        ),
      );
    });
  });
});
