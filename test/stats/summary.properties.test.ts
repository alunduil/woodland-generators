import fc from "fast-check";
import { summary } from "../../src/stats/summary";

describe("summary properties", () => {
  describe("ordering properties", () => {
    it("should be monotonic: min ≤ q1 ≤ median ≤ q3 ≤ max", () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), {
            minLength: 1,
            maxLength: 1000,
          }),
          (numbers) => {
            const result = summary(numbers);
            expect(result.min).toBeLessThanOrEqual(result.q1);
            expect(result.q1).toBeLessThanOrEqual(result.median);
            expect(result.median).toBeLessThanOrEqual(result.q3);
            expect(result.q3).toBeLessThanOrEqual(result.max);
          },
        ),
        {
          examples: [
            [[0, -0]], // Edge case: positive and negative zero
            [[-0, 0]], // Edge case: negative and positive zero (different order)
          ],
        },
      );
    });
  });

  describe("cardinality properties", () => {
    it("should return count equal to array length", () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), {
            minLength: 1,
            maxLength: 1000,
          }),
          (numbers) => {
            const result = summary(numbers);
            expect(result.count).toBe(numbers.length);
          },
        ),
        {
          examples: [
            [[0, -0]], // Edge case: positive and negative zero
          ],
        },
      );
    });
  });

  describe("invariance properties", () => {
    it("should be invariant to array order", () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }), {
            minLength: 1,
            maxLength: 1000,
          }),
          (numbers) => {
            const original = summary(numbers);
            const shuffled = summary([...numbers].sort(() => Math.random() - 0.5));

            // Check mathematical equality (handles 0/-0 distinction naturally)
            expect(original.min === shuffled.min).toBe(true);
            expect(original.q1).toBe(shuffled.q1);
            expect(original.median).toBe(shuffled.median);
            expect(original.q3).toBe(shuffled.q3);
            expect(original.max === shuffled.max).toBe(true);
            expect(original.count).toBe(shuffled.count);
          },
        ),
        {
          examples: [
            [[0, -0]], // Edge case: demonstrates 0/-0 behavior
            [[-0, 0]], // Edge case: different order of 0/-0
          ],
        },
      );
    });

    it("should handle single-value arrays correctly", () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
          (value) => {
            // For a single value, all statistics should equal that value
            const result = summary([value]);

            expect(result.min).toBe(value);
            expect(result.q1).toBe(value);
            expect(result.median).toBe(value);
            expect(result.q3).toBe(value);
            expect(result.max).toBe(value);
            expect(result.count).toBe(1);
          },
        ),
        {
          examples: [
            [0], // Edge case: positive zero
            [-0], // Edge case: negative zero
          ],
        },
      );
    });
  });
});
