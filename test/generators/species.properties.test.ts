import { generateSpecies, EXTENDED_WOODLAND_SPECIES } from "../../src/generators/species";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../utils";
import fc from "fast-check";
import { root } from "../../src/logging";

describe("generateSpecies", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  describe("user input behavior", () => {
    it("should return user species when provided and valid (including 'other')", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string({ minLength: 1 }).filter((s) => s !== "other"),
            { minLength: 1, maxLength: 5 },
          ),
          (seed, baseChoices) => {
            const choices = [...baseChoices, "other"];
            // Test with a valid choice from the list
            const userSpecies = choices[0]!;
            const species = generateSpecies({ seed, choices, species: userSpecies });
            return species === userSpecies;
          },
        ),
      );
    });

    it("should return user species when valid and no 'other' in choices", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string({ minLength: 1 }).filter((s) => s !== "other"),
            { minLength: 1, maxLength: 5 },
          ),
          (seed, baseChoices) => {
            // No "other" in choices - just base choices
            const userSpecies = baseChoices[0]!;
            const result = generateSpecies({ seed, choices: baseChoices, species: userSpecies });
            return result === userSpecies;
          },
        ),
      );
    });

    it("should accept any user species when 'other' is present (carte blanche)", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string({ minLength: 1 }).filter((s) => s !== "other"),
            { minLength: 1, maxLength: 5 },
          ).chain((baseChoices) =>
            fc
              .string({ minLength: 1 })
              .filter((s) => s !== "other" && !baseChoices.includes(s))
              .map((userSpecies) => [baseChoices, userSpecies] as const),
          ),
          (seed, [baseChoices, userSpecies]) => {
            const choices = [...baseChoices, "other"];

            // When "other" is present, ANY user species should be accepted and returned as-is
            const result = generateSpecies({ seed, choices, species: userSpecies });
            return result === userSpecies;
          },
        ),
      );
    });
  });

  describe("'other' expansion behavior", () => {
    it("should expand 'other' when user explicitly selects it", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string({ minLength: 1 }).filter((s) => s !== "other"),
            { minLength: 1, maxLength: 5 },
          ),
          (seed, baseChoices) => {
            const choices = [...baseChoices, "other"];

            // When user selects "other", it should expand to extended species (not return literal "other")
            const result = generateSpecies({ seed, choices, species: "other" });
            return (EXTENDED_WOODLAND_SPECIES as readonly string[]).includes(result);
          },
        ),
      );
    });

    it("should expand to extended species when 'other' is randomly selected", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          const choices = ["other"];
          const species = generateSpecies({ seed, choices });
          return (EXTENDED_WOODLAND_SPECIES as readonly string[]).includes(species);
        }),
      );
    });

    it("should be deterministic when expanding 'other'", () => {
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
          // Calculate threshold - extended species has many choices, expect high variability
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

  describe("output validation", () => {
    it("should always return a species from the valid universe (choices + extended species)", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
          (seed, choices) => {
            const species = generateSpecies({ seed, choices });
            const validUniverse = [...choices, ...EXTENDED_WOODLAND_SPECIES];
            return validUniverse.includes(species);
          },
        ),
      );
    });
  });
});
