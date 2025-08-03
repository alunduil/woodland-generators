import { summary } from "../../src/stats/summary";

describe("summary", () => {
  describe("edge case: empty input", () => {
    it("should return zero-filled summary when no data points exist", () => {
      const result = summary([]);

      expect(result).toEqual({
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        count: 0,
      });
    });
  });

  describe("minimal dataset: two data points", () => {
    it("should interpolate quartiles between distinct values", () => {
      const result = summary([1, 5]);

      expect(result).toEqual({
        min: 1,
        q1: 2,
        median: 3,
        q3: 4,
        max: 5,
        count: 2,
      });
    });

    it("should handle identical values without interpolation artifacts", () => {
      const result = summary([3, 3]);

      expect(result).toEqual({
        min: 3,
        q1: 3,
        median: 3,
        q3: 3,
        max: 3,
        count: 2,
      });
    });
  });

  describe("algorithmic behavior: percentile calculation methods", () => {
    it("should use exact median for odd-length sequences", () => {
      const result = summary([1, 2, 3, 4, 5]);

      expect(result.min).toBe(1);
      expect(result.max).toBe(5);
      expect(result.median).toBe(3);
      expect(result.count).toBe(5);
      expect(result.q1).toBeCloseTo(2);
      expect(result.q3).toBeCloseTo(4);
    });

    it("should interpolate median for even-length sequences", () => {
      const result = summary([1, 2, 3, 4, 5, 6]);

      expect(result.min).toBe(1);
      expect(result.max).toBe(6);
      expect(result.median).toBe(3.5);
      expect(result.count).toBe(6);
      expect(result.q1).toBeCloseTo(2.25);
      expect(result.q3).toBeCloseTo(4.75);
    });
  });
});
