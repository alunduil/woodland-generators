import { generateSpecies, EXTENDED_WOODLAND_SPECIES } from "../../src/generators/species";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../utils";
import fc from "fast-check";

describe("generateSpecies", () => {
  describe("property: user species validation", () => {
    it("should return provided species when it's in the choices list", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          (seed, choices) => {
            // Pick a random choice from the array
            const userSpecies = choices[0]!; // Use first choice as user selection

            const species = generateSpecies({ seed, choices, species: userSpecies });
            return species === userSpecies;
          },
        ),
      );
    });

    it("should return provided species when choices include 'other'", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          fc.string().filter((s) => s.length > 0),
          (seed, baseChoices, userSpecies) => {
            const choices = [...baseChoices, "other"];

            const species = generateSpecies({ seed, choices, species: userSpecies });
            return species === userSpecies;
          },
        ),
      );
    });

    it("should throw error when provided species is not in choices and 'other' is not included", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          fc.string().filter((s) => s.length > 0),
          (seed, choices, invalidSpecies) => {
            // Ensure invalidSpecies is not in choices and "other" is not included
            fc.pre(!choices.includes(invalidSpecies));
            fc.pre(!choices.includes("other"));

            expect(() => {
              generateSpecies({ seed, choices, species: invalidSpecies });
            }).toThrow();

            return true; // Test passed if exception was thrown
          },
        ),
      );
    });
  });

  describe("property: valid species selection", () => {
    describe("with generated choices", () => {
      it("should always return a species from the valid universe (choices + extended species)", () => {
        fc.assert(
          fc.property(
            fc.string(),
            uniqueArray(
              fc.string().filter((s) => s.length > 0),
              { minLength: 1, maxLength: 20 },
            ),
            (seed, choices) => {
              const species = generateSpecies({ seed, choices });
              const validUniverse = [...choices, ...EXTENDED_WOODLAND_SPECIES];
              return validUniverse.includes(species);
            },
          ),
        );
      });

      it("should be deterministic with generated choices", () => {
        fc.assert(
          fc.property(
            fc.string(),
            uniqueArray(
              fc.string().filter((s) => s.length > 0),
              { minLength: 1, maxLength: 10 },
            ),
            (seed, choices) => {
              const species1 = generateSpecies({ seed, choices });
              const species2 = generateSpecies({ seed, choices });
              return species1 === species2;
            },
          ),
        );
      });

      it("should return different species for different seeds with generated choices", () => {
        fc.assert(
          fc.property(
            uniqueArray(
              fc.string().filter((s) => s.length > 0),
              { minLength: 5, maxLength: 15 },
            ).chain((choices) => {
              // Generate seed pairs with size proportional to choices to ensure meaningful statistics
              const minPairs = Math.max(10, Math.floor(choices.length * 1.5));
              const maxPairs = Math.max(15, choices.length * 2);

              return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
                (seedPairs) => ({ choices, seedPairs }),
              );
            }),
            ({ choices, seedPairs }) => {
              // Calculate threshold based on actual number of choices
              const targetSuccessRate = getCollisionThreshold(choices.length);
              const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

              // Count how many pairs produce different results
              let differentResults = 0;

              for (const [seed1, seed2] of seedPairs) {
                const species1 = generateSpecies({ seed: seed1, choices });
                const species2 = generateSpecies({ seed: seed2, choices });

                if (species1 !== species2) {
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

    describe("with 'other' singleton", () => {
      it("should always return a species from extended species when choices is ['other']", () => {
        fc.assert(
          fc.property(fc.string(), (seed) => {
            const choices = ["other"];
            const species = generateSpecies({ seed, choices });
            return (EXTENDED_WOODLAND_SPECIES as readonly string[]).includes(species);
          }),
        );
      });

      it("should be deterministic with 'other' singleton", () => {
        fc.assert(
          fc.property(fc.string(), (seed) => {
            const choices = ["other"];
            const species1 = generateSpecies({ seed, choices });
            const species2 = generateSpecies({ seed, choices });
            return species1 === species2;
          }),
        );
      });

      it("should return different species for different seeds with 'other' singleton", () => {
        fc.assert(
          fc.property(uniquePairs(fc.string(), { minLength: 10, maxLength: 20 }), (seedPairs) => {
            const choices = ["other"];
            // Calculate threshold - extended species has 103 choices, expect high variability
            const targetSuccessRate = getCollisionThreshold(EXTENDED_WOODLAND_SPECIES.length);
            const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

            let differentResults = 0;

            for (const [seed1, seed2] of seedPairs) {
              const species1 = generateSpecies({ seed: seed1, choices });
              const species2 = generateSpecies({ seed: seed2, choices });

              if (species1 !== species2) {
                differentResults++;

                if (differentResults >= targetCount) {
                  break;
                }
              }
            }

            return differentResults >= targetCount;
          }),
        );
      });
    });

    it("should handle user species correctly regardless of 'other' presence", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0 && s !== "other"),
            { minLength: 1, maxLength: 5 },
          ),
          fc.string().filter((s) => s.length > 0),
          fc.boolean(),
          (seed, baseChoices, userSpecies, includeOther) => {
            const choices = includeOther ? [...baseChoices, "other"] : baseChoices;

            // Should work if user species is in base choices OR if "other" is present
            const shouldWork = Boolean(baseChoices.includes(userSpecies)) || includeOther;

            if (shouldWork) {
              const result = generateSpecies({ seed, choices, species: userSpecies });
              return result === userSpecies;
            } else {
              expect(() => {
                generateSpecies({ seed, choices, species: userSpecies });
              }).toThrow();
              return true;
            }
          },
        ),
      );
    });
  });

  describe("edge cases", () => {
    it("should throw error when choices array is empty", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          expect(() => {
            generateSpecies({ seed, choices: [] });
          }).toThrow();

          return true;
        }),
      );
    });
  });
});
