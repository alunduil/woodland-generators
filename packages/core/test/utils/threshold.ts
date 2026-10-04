// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

/**
 * Get expected collision rate threshold based on number of choices
 * Uses a simple lookup table based on empirical testing
 */
export function getCollisionThreshold(count: number): number {
  const thresholds = [
    { max: 10, threshold: 0.4 },
    { max: 25, threshold: 0.6 },
    { max: 50, threshold: 0.75 },
    { max: 100, threshold: 0.85 },
    { max: Infinity, threshold: 0.9 },
  ];

  return thresholds.find((entry) => count <= entry.max)?.threshold ?? 0.9;
}

/**
 * Whether `generate` gives different outputs for at least `targetCount` of the
 * seed pairs. Outputs compare with `!==`, so map structured results to a string.
 */
export function enoughPairsDiffer<T>(
  seedPairs: [string, string][],
  targetCount: number,
  generate: (seed: string) => T,
): boolean {
  let differing = 0;

  for (const [seed1, seed2] of seedPairs) {
    if (generate(seed1) !== generate(seed2)) {
      differing++;

      if (differing >= targetCount) {
        break;
      }
    }
  }

  return differing >= targetCount;
}
