import { MoveGenerator, MoveGeneratorOptions } from "../../src/generators/move";
import { getCollisionThreshold, uniquePairs, uniqueArray } from "../utils";
import fc from "fast-check";

describe("MoveGenerator", () => {
  describe("property: deterministic generation", () => {
    it.skip("should be deterministic with same seed", () => {
      fc.assert(
        fc.property(
          fc.string(),
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (seed, availableMoves) => {
            const generator = new MoveGenerator({ availableMoves });

            const result1 = generator.generate({ seed });
            const result2 = generator.generate({ seed });

            return JSON.stringify(result1) === JSON.stringify(result2);
          },
        ),
      );
    });

    it.skip("should return different moves for different seeds", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 3, maxLength: 5 },
          ).chain((availableMoves) => {
            // Generate seed pairs with size proportional to moves to ensure meaningful statistics
            const minPairs = Math.max(10, Math.floor(availableMoves.length * 1.5));
            const maxPairs = Math.max(15, availableMoves.length * 2);

            return uniquePairs(fc.string(), { minLength: minPairs, maxLength: maxPairs }).map(
              (seedPairs) => ({ availableMoves, seedPairs }),
            );
          }),
          ({ availableMoves, seedPairs }) => {
            const generator = new MoveGenerator({ availableMoves });

            // Calculate threshold based on actual number of moves
            const targetSuccessRate = getCollisionThreshold(availableMoves.length);
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
    it("should always return moves from available options", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          (availableMoves) => {
            const generator = new MoveGenerator({ availableMoves });
            const result = generator.generate();

            if (!result) {
              // Should only be null if generator is not available
              return !generator.isAvailable();
            }

            // Result should be from available moves
            return availableMoves.includes(result);
          },
        ),
      );
    });

    it("should return null when no moves available", () => {
      const generator = new MoveGenerator({ availableMoves: [] });
      const result = generator.generate();
      expect(result).toBeNull();
    });
  });

  describe("property: availability logic", () => {
    it("should be available when moves exist", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (availableMoves) => {
            const generator = new MoveGenerator({ availableMoves });
            return generator.isAvailable();
          },
        ),
      );
    });

    it("should not be available when no moves exist", () => {
      const generator = new MoveGenerator({ availableMoves: [] });
      expect(generator.isAvailable()).toBe(false);
    });
  });

  describe("property: options management", () => {
    it("should return all available moves in getAvailableOptions", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          (availableMoves) => {
            const generator = new MoveGenerator({ availableMoves });
            const options = generator.getAvailableOptions();

            return JSON.stringify(options) === JSON.stringify(availableMoves);
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
          (availableMoves) => {
            const generator = new MoveGenerator({ availableMoves });
            const options = generator.getAvailableOptions();

            // Modify the returned array
            options.push("Modified");

            // Original should be unchanged
            const optionsAgain = generator.getAvailableOptions();
            return JSON.stringify(optionsAgain) === JSON.stringify(availableMoves);
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
          (initialMoves, newMoves) => {
            const generator = new MoveGenerator({ availableMoves: initialMoves });

            generator.updateOptions(newMoves);

            const result = generator.generate();
            const availableOptions = generator.getAvailableOptions();

            // After update, should behave as if created with new options
            if (newMoves.length === 0) {
              return result === null && availableOptions.length === 0;
            }

            if (!result) {
              return false;
            }

            return (
              newMoves.includes(result) &&
              JSON.stringify(availableOptions) === JSON.stringify(newMoves)
            );
          },
        ),
      );
    });

    it("should handle empty move arrays", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (initialMoves) => {
            const generator = new MoveGenerator({ availableMoves: initialMoves });

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
          (availableMoves, seed, useFallbacks) => {
            const options: MoveGeneratorOptions = { availableMoves };
            if (seed !== null) options.seed = seed;
            if (useFallbacks !== null) options.useFallbacks = useFallbacks;

            const generator = new MoveGenerator(options);

            // Generator should always be constructible
            expect(generator).toBeInstanceOf(MoveGenerator);

            // Availability should match having moves
            return generator.isAvailable() === availableMoves.length > 0;
          },
        ),
      );
    });

    it("should disable fallbacks by default", () => {
      fc.assert(
        fc.property(uniqueArray(fc.string(), { minLength: 0, maxLength: 3 }), (availableMoves) => {
          const generator = new MoveGenerator({ availableMoves });

          // With empty moves and default fallbacks (false), should not be available
          if (availableMoves.length === 0) {
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
          (availableMoves, constructorSeed, overrideSeed) => {
            const generator = new MoveGenerator({ availableMoves, seed: constructorSeed });

            const result = generator.generate({ seed: overrideSeed });

            if (!result) {
              return !generator.isAvailable();
            }

            return availableMoves.includes(result);
          },
        ),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in move names", () => {
      fc.assert(
        fc.property(
          uniqueArray(
            fc.string().filter((s) => s.length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          (baseMoves) => {
            const specialMoves = [
              ...baseMoves,
              "Swift Strike",
              "Power-Block",
              "Dodge (Quick)",
              "Fire & Steel",
              "🗡️",
            ];

            const generator = new MoveGenerator({ availableMoves: specialMoves });
            const result = generator.generate();

            if (!result) {
              return specialMoves.length === 0;
            }

            return specialMoves.includes(result);
          },
        ),
      );
    });

    it("should handle duplicate moves", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => s.length > 0),
          fc.integer({ min: 2, max: 10 }),
          (move, duplicateCount) => {
            const duplicateMoves = Array(duplicateCount).fill(move);
            const generator = new MoveGenerator({ availableMoves: duplicateMoves });

            const result = generator.generate();

            // Should still generate the move even with duplicates
            return result === move;
          },
        ),
      );
    });

    it("should handle very long move names", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          fc.string({ minLength: 1, maxLength: 1 }),
          (length, char) => {
            const longMove = char.repeat(length);
            const generator = new MoveGenerator({ availableMoves: [longMove] });

            const result = generator.generate();
            return result === longMove;
          },
        ),
      );
    });

    it("should handle large numbers of moves", () => {
      fc.assert(
        fc.property(fc.integer({ min: 50, max: 200 }), (moveCount) => {
          const manyMoves = Array.from({ length: moveCount }, (_, i) => `Move${i}`);
          const generator = new MoveGenerator({ availableMoves: manyMoves });

          expect(generator.isAvailable()).toBe(true);
          expect(generator.getAvailableOptions()).toHaveLength(moveCount);

          const result = generator.generate();
          return result !== null && manyMoves.includes(result!);
        }),
      );
    });

    it("should handle mixed valid and problematic move names", () => {
      const mixedMoves = [
        "Strike",
        "", // empty string
        "   ", // whitespace only
        "Valid Move",
        "火の打撃", // Unicode
      ];

      const generator = new MoveGenerator({ availableMoves: mixedMoves });
      const result = generator.generate();

      // Should return one of the available moves (including empty/whitespace/Unicode)
      expect(mixedMoves).toContain(result);
    });

    it("should handle move names with numbers and symbols", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.string().filter((s) => s.length > 0),
              fc.string({ minLength: 1, maxLength: 10 }).map((s) => s + "123"),
              fc.string({ minLength: 1, maxLength: 10 }).map((s) => s + "!@#"),
            ),
            { minLength: 1, maxLength: 10 },
          ),
          (moves) => {
            const generator = new MoveGenerator({ availableMoves: moves });
            const result = generator.generate();

            if (!result) {
              return moves.length === 0;
            }

            return moves.includes(result);
          },
        ),
      );
    });

    it("should handle combat-themed move names", () => {
      const combatMoves = [
        "Strike",
        "Block",
        "Dodge",
        "Parry",
        "Thrust",
        "Slash",
        "Uppercut",
        "Counter",
        "Riposte",
        "Feint",
        "Charge",
        "Retreat",
      ];

      const generator = new MoveGenerator({ availableMoves: combatMoves });
      const result = generator.generate();

      expect(result).not.toBeNull();
      expect(combatMoves).toContain(result);
    });
  });
});
