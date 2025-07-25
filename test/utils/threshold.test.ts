import { getCollisionThreshold } from "./threshold";

describe("getCollisionThreshold", () => {
  it("should calculate appropriate thresholds based on name count", () => {
    // Verify threshold is reasonable for various counts
    expect(getCollisionThreshold(5)).toBeGreaterThan(0.3);
    expect(getCollisionThreshold(5)).toBeLessThan(1.0);

    // Test threshold increases with more choices
    expect(getCollisionThreshold(10)).toBeLessThan(getCollisionThreshold(50));
    expect(getCollisionThreshold(50)).toBeLessThan(getCollisionThreshold(150));

    // Test specific lookup values
    expect(getCollisionThreshold(10)).toBe(0.4);
    expect(getCollisionThreshold(25)).toBe(0.6);
    expect(getCollisionThreshold(50)).toBe(0.75);
    expect(getCollisionThreshold(100)).toBe(0.85);
    expect(getCollisionThreshold(200)).toBe(0.9);
  });

  it("should handle edge cases", () => {
    expect(getCollisionThreshold(0)).toBe(0.4);
    expect(getCollisionThreshold(1)).toBe(0.4);
    expect(getCollisionThreshold(Number.MAX_SAFE_INTEGER)).toBe(0.9);
  });
});
