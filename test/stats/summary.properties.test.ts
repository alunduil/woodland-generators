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

            expect(shuffled).toEqual(original);
          },
        ),
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
      );
    });
  });
});
