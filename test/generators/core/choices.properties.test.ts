import {
  validateChoicesNonEmpty,
  generateSubsetFromChoices,
  generateSingleFromChoices,
  generateMultipleFromChoices,
} from "../../../src/generators/core";
import { root } from "../../../src/logging";
import SeededRandomUtilities from "seeded-random-utilities";
import fc from "fast-check";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../../utils";

describe("validateChoicesNonEmpty", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should not throw when choices are non-empty", () => {
    fc.assert(
      fc.property(
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
        (choices) => {
          expect(() => {
            validateChoicesNonEmpty("test", choices, root);
          }).not.toThrow();

          return true;
        },
      ),
    );
  });
});

describe("generateSubsetFromChoices", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should return copy of provided selection when it contains only valid choices", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }).chain((choices) =>
          fc.record({
            choices: fc.constant(choices),
            userSelection: fc.subarray(choices, { minLength: 1 }),
          }),
        ),
        (seed, { choices, userSelection }) => {
          const rng = new SeededRandomUtilities(seed);

          const result = generateSubsetFromChoices("test", userSelection, choices, rng, root);

          // Should have same content but be different array instance
          return (
            JSON.stringify(result) === JSON.stringify(userSelection) && result !== userSelection
          );
        },
      ),
    );
  });

  it("should always return results from available choices", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const result = generateSubsetFromChoices("test", undefined, choices, rng, root);

          return result.every((item) => choices.includes(item));
        },
      ),
    );
  });

  it("should be deterministic for same seed", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
        (seed, choices) => {
          const rng1 = new SeededRandomUtilities(seed);
          const rng2 = new SeededRandomUtilities(seed);

          const result1 = generateSubsetFromChoices("test", undefined, choices, rng1, root);
          const result2 = generateSubsetFromChoices("test", undefined, choices, rng2, root);

          return JSON.stringify(result1) === JSON.stringify(result2);
        },
      ),
    );
  });

  it("should never return more items than available choices", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const result = generateSubsetFromChoices("test", undefined, choices, rng, root);

          return result.length <= choices.length;
        },
      ),
    );
  });

  it("should always generate non-empty array", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const result = generateSubsetFromChoices("test", undefined, choices, rng, root);

          return result.length > 0;
        },
      ),
    );
  });

  it("should produce different results for different seeds (with sufficient choice diversity)", () => {
    fc.assert(
      fc.property(
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 10, maxLength: 15 }).chain(
          (choices) => {
            const totalCombinations = Math.pow(2, choices.length) - 1;
            const minPairs = Math.max(5, Math.floor(Math.sqrt(totalCombinations)));
            const maxPairs = Math.max(10, Math.floor(totalCombinations * 0.1));

            return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
              (seedPairs) => ({ choices, seedPairs, totalCombinations }),
            );
          },
        ),
        ({ choices, seedPairs, totalCombinations }) => {
          const threshold = getCollisionThreshold(totalCombinations);
          const targetCount = Math.max(1, Math.floor(seedPairs.length * threshold));

          let differentResults = 0;

          for (const [seed1, seed2] of seedPairs) {
            const rng1 = new SeededRandomUtilities(seed1);
            const rng2 = new SeededRandomUtilities(seed2);

            const result1 = generateSubsetFromChoices("test", undefined, choices, rng1, root);
            const result2 = generateSubsetFromChoices("test", undefined, choices, rng2, root);

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

  it("should throw error when user selection contains invalid choices", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }).chain(
          (validChoices) =>
            fc.record({
              validChoices: fc.constant(validChoices),
              invalidChoice: fc
                .string({ minLength: 1 })
                .filter((str) => !validChoices.includes(str)),
            }),
        ),
        (seed, { validChoices, invalidChoice }) => {
          const rng = new SeededRandomUtilities(seed);

          expect(() => {
            generateSubsetFromChoices("test", [invalidChoice], validChoices, rng, root);
          }).toThrow(
            `Invalid test provided: ${invalidChoice}. Available choices: ${validChoices.join(", ")}.`,
          );

          return true;
        },
      ),
    );
  });

  it("should throw error when user selection contains mix of valid and invalid choices", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }).chain(
          (validChoices) =>
            fc.record({
              validChoices: fc.constant(validChoices),
              invalidChoice: fc
                .string({ minLength: 1 })
                .filter((str) => !validChoices.includes(str)),
            }),
        ),
        (seed, { validChoices, invalidChoice }) => {
          const rng = new SeededRandomUtilities(seed);
          const userSelection = [validChoices[0]!, invalidChoice];

          expect(() => {
            generateSubsetFromChoices("test", userSelection, validChoices, rng, root);
          }).toThrow(
            `Invalid test provided: ${invalidChoice}. Available choices: ${validChoices.join(", ")}.`,
          );

          return true;
        },
      ),
    );
  });
});

describe("generateSingleFromChoices", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should return provided selection when it's a valid choice", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const userSelection = choices[0]!;

          const result = generateSingleFromChoices("test", userSelection, choices, rng, root);

          return result === userSelection;
        },
      ),
    );
  });

  it("should always return a choice from available choices", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const result = generateSingleFromChoices("test", undefined, choices, rng, root);

          return choices.includes(result);
        },
      ),
    );
  });

  it("should be deterministic for same seed", () => {
    fc.assert(
      fc.property(
        fc.string(),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
        (seed, choices) => {
          const rng1 = new SeededRandomUtilities(seed);
          const rng2 = new SeededRandomUtilities(seed);

          const result1 = generateSingleFromChoices("test", undefined, choices, rng1, root);
          const result2 = generateSingleFromChoices("test", undefined, choices, rng2, root);

          return result1 === result2;
        },
      ),
    );
  });

  it("should produce different results for different seeds (with sufficient choice diversity)", () => {
    fc.assert(
      fc.property(
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 5, maxLength: 15 }).chain(
          (choices) => {
            const minPairs = Math.max(10, Math.floor(choices.length * 1.5));
            const maxPairs = Math.max(15, choices.length * 2);

            return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
              (seedPairs) => ({ choices, seedPairs }),
            );
          },
        ),
        ({ choices, seedPairs }) => {
          const targetSuccessRate = getCollisionThreshold(choices.length);
          const targetCount = Math.ceil(seedPairs.length * targetSuccessRate);

          let differentResults = 0;

          for (const [seed1, seed2] of seedPairs) {
            const rng1 = new SeededRandomUtilities(seed1);
            const rng2 = new SeededRandomUtilities(seed2);

            const result1 = generateSingleFromChoices("test", undefined, choices, rng1, root);
            const result2 = generateSingleFromChoices("test", undefined, choices, rng2, root);

            if (result1 !== result2) {
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

  it("should throw error when user selection is invalid", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }).chain(
          (validChoices) =>
            fc.record({
              validChoices: fc.constant(validChoices),
              invalidChoice: fc
                .string({ minLength: 1 })
                .filter((str) => !validChoices.includes(str)),
            }),
        ),
        (seed, { validChoices, invalidChoice }) => {
          const rng = new SeededRandomUtilities(seed);

          expect(() => {
            generateSingleFromChoices("test", invalidChoice, validChoices, rng, root);
          }).toThrow(
            `Invalid test provided: "${invalidChoice}". Available choices: ${validChoices.join(", ")}.`,
          );

          return true;
        },
      ),
    );
  });
});

describe("generateMultipleFromChoices", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  it("should use provided selections when given", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.record({
          category1: uniqueArray(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 5 }),
          category2: uniqueArray(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 5 }),
        }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const userSelections = {
            category1: [choices.category1[0]!],
            category2: [choices.category2[0]!],
          };

          const result = generateMultipleFromChoices(userSelections, choices, rng, root);

          return (
            JSON.stringify(result.category1) === JSON.stringify(userSelections.category1) &&
            JSON.stringify(result.category2) === JSON.stringify(userSelections.category2)
          );
        },
      ),
    );
  });

  it("should generate multiple categories when user selections are undefined", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.record({
          category1: uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
          category2: uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
        }),
        (seed, choices) => {
          const rng = new SeededRandomUtilities(seed);
          const userSelections = { category1: undefined, category2: undefined };

          const result = generateMultipleFromChoices(userSelections, choices, rng, root);

          return (
            result.category1 !== undefined &&
            result.category2 !== undefined &&
            result.category1.length > 0 &&
            result.category2.length > 0 &&
            result.category1.every((item) => choices.category1.includes(item)) &&
            result.category2.every((item) => choices.category2.includes(item))
          );
        },
      ),
    );
  });

  it("should throw error when user selection contains invalid choices", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        uniqueArray(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }).chain(
          (validChoices) =>
            fc.record({
              validChoices: fc.constant(validChoices),
              invalidChoice: fc
                .string({ minLength: 1 })
                .filter((str) => !validChoices.includes(str)),
            }),
        ),
        (seed, { validChoices, invalidChoice }) => {
          const rng = new SeededRandomUtilities(seed);
          const userSelections = { category1: [invalidChoice] };
          const choices = { category1: validChoices };

          expect(() => {
            generateMultipleFromChoices(userSelections, choices, rng, root);
          }).toThrow(
            `Invalid category1 provided: ${invalidChoice}. Available choices: ${validChoices.join(", ")}.`,
          );

          return true;
        },
      ),
    );
  });
});
