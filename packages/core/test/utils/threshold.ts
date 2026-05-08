/**
 * Get expected collision rate threshold based on number of choices
 * Uses a simple lookup table based on empirical testing
 */
export function getCollisionThreshold(count: number): number {
  // Simple lookup table - if we encounter flakiness, we can add a statistics library
  const thresholds = [
    { max: 10, threshold: 0.4 },
    { max: 25, threshold: 0.6 },
    { max: 50, threshold: 0.75 },
    { max: 100, threshold: 0.85 },
    { max: Infinity, threshold: 0.9 },
  ];

  return thresholds.find((entry) => count <= entry.max)?.threshold ?? 0.9;
}
