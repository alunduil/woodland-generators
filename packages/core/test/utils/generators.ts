// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import fc from "fast-check";

/**
 * Helper function to create a generator for unique pairs.
 * Generates an array of unique combinations (pairs) from a set of unique values.
 * Post-shrink, the unique-item count is guaranteed >= minLength (floor 2), so
 * shrinking can't collapse a property's input down to a single pair when the
 * caller asked for more.
 */
export function uniquePairs<T>(
  generator: fc.Arbitrary<T>,
  options?: { minLength?: number; maxLength?: number },
): fc.Arbitrary<[T, T][]> {
  const minUnique = Math.max(2, options?.minLength ?? 2);

  return fc
    .array(generator, { minLength: 2, maxLength: 10, ...options })
    .map((arr) => Array.from(new Set(arr)))
    .filter((arr) => arr.length >= minUnique)
    .map((arr) => {
      const pairs: [T, T][] = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          pairs.push([arr[i]!, arr[j]!]);
        }
      }
      return pairs;
    });
}

/**
 * Generate an array of unique values using any arbitrary generator
 * Works with any data type using Set-based deduplication
 */
export function uniqueArray<T>(
  generator: fc.Arbitrary<T>,
  options?: { minLength?: number; maxLength?: number },
): fc.Arbitrary<T[]> {
  const { minLength = 1, maxLength = 10 } = options ?? {};

  // Generate a target length first
  return fc.integer({ min: minLength, max: maxLength }).chain((targetLength) => {
    // Generate enough items to likely get the target number of unique ones
    // Use a reasonable multiplier to avoid excessive generation
    const generateCount = Math.min(targetLength * 2, 50);

    return (
      fc
        .array(generator, { minLength: generateCount, maxLength: generateCount })
        .map((arr) => {
          const uniqueItems = Array.from(new Set(arr));
          // Take exactly the target length, or all unique items if we have fewer
          return uniqueItems.slice(0, targetLength);
        })
        // Only accept if we have at least the minimum required
        .filter((arr) => arr.length >= minLength)
    );
  });
}
