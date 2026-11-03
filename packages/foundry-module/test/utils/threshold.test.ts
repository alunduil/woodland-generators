// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { enoughPairsDiffer, getCollisionThreshold } from "./threshold";

describe("getCollisionThreshold", () => {
  it("should calculate appropriate thresholds based on name count", () => {
    expect(getCollisionThreshold(5)).toBeGreaterThan(0.3);
    expect(getCollisionThreshold(5)).toBeLessThan(1.0);

    expect(getCollisionThreshold(10)).toBeLessThan(getCollisionThreshold(50));
    expect(getCollisionThreshold(50)).toBeLessThan(getCollisionThreshold(150));

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

describe("enoughPairsDiffer", () => {
  const pairs: [string, string][] = [
    ["a", "b"],
    ["c", "c"],
    ["d", "e"],
  ];
  const identity = (seed: string) => seed;

  it("should pass when the differing pairs reach the target", () => {
    expect(enoughPairsDiffer(pairs, 2, identity)).toBe(true);
  });

  it("should fail when the differing pairs fall short of the target", () => {
    expect(enoughPairsDiffer(pairs, 3, identity)).toBe(false);
  });

  it("should stop generating once the target is reached", () => {
    const generate = jest.fn(identity);
    enoughPairsDiffer(pairs, 1, generate);
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
