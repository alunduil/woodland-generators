// SPDX-FileCopyrightText: 2025-2026 Alex Brandt
//
// SPDX-License-Identifier: MIT

import { uniqueArray, uniquePairs } from "./generators";
import fc from "fast-check";

describe("uniquePairs", () => {
  it("should guarantee minLength unique source items post-shrink", () => {
    fc.assert(
      fc.property(
        fc.record({
          minLength: fc.integer({ min: 2, max: 8 }),
          maxLength: fc.integer({ min: 9, max: 20 }),
        }),
        (options) => {
          const pairs = fc.sample(uniquePairs(fc.string(), options), 1)[0]!;
          const uniqueItems = new Set<string>();
          for (const [a, b] of pairs) {
            uniqueItems.add(a);
            uniqueItems.add(b);
          }
          return uniqueItems.size >= options.minLength;
        },
      ),
    );
  });

  it("should yield C(n,2) pairs from n unique items", () => {
    const pairs = fc.sample(uniquePairs(fc.string(), { minLength: 5, maxLength: 5 }), 5);
    pairs.forEach((arr) => {
      const uniqueItems = new Set<string>();
      for (const [a, b] of arr) {
        uniqueItems.add(a);
        uniqueItems.add(b);
      }
      const n = uniqueItems.size;
      expect(arr.length).toBe((n * (n - 1)) / 2);
    });
  });

  it("should clamp minLength below 2 up to 2", () => {
    const pairs = fc.sample(uniquePairs(fc.string(), { minLength: 1, maxLength: 5 }), 5);
    pairs.forEach((arr) => {
      const uniqueItems = new Set<string>();
      for (const [a, b] of arr) {
        uniqueItems.add(a);
        uniqueItems.add(b);
      }
      expect(uniqueItems.size).toBeGreaterThanOrEqual(2);
    });
  });
});

describe("uniqueArray", () => {
  it("should generate unique arrays of any type", () => {
    fc.assert(
      fc.property(
        fc.record({
          minLength: fc.integer({ min: 1, max: 5 }),
          maxLength: fc.integer({ min: 6, max: 15 }),
        }),
        (options) => {
          // Test with integers
          const intArray = fc.sample(uniqueArray(fc.integer(), options), 1)[0]!;
          const uniqueInts = new Set(intArray);

          // Test with strings
          const stringArray = fc.sample(uniqueArray(fc.string(), options), 1)[0]!;
          const uniqueStrings = new Set(stringArray);

          // Check lengths are within bounds
          const intLengthValid =
            intArray.length >= options.minLength && intArray.length <= options.maxLength;
          const stringLengthValid =
            stringArray.length >= options.minLength && stringArray.length <= options.maxLength;

          // Check uniqueness
          const intUnique = uniqueInts.size === intArray.length;
          const stringUnique = uniqueStrings.size === stringArray.length;

          return intLengthValid && stringLengthValid && intUnique && stringUnique;
        },
      ),
    );
  });

  it("should work with complex objects", () => {
    const objectGenerator = fc.record({
      id: fc.integer(),
      name: fc.string({ minLength: 1, maxLength: 10 }),
    });

    const objects = fc.sample(uniqueArray(objectGenerator, { minLength: 2, maxLength: 5 }), 1)[0]!;

    // Check uniqueness by stringifying (simple check for this test)
    const objectStrings = objects.map((obj) => JSON.stringify(obj));
    const uniqueObjectStrings = new Set(objectStrings);

    expect(uniqueObjectStrings.size).toBe(objects.length);
    expect(objects.length).toBeGreaterThanOrEqual(2);
    expect(objects.length).toBeLessThanOrEqual(5);
  });

  it("should handle edge cases gracefully", () => {
    // Test with a generator that might produce duplicates
    const limitedIntGenerator = fc.integer({ min: 1, max: 3 });
    const result = fc.sample(uniqueArray(limitedIntGenerator, { minLength: 1, maxLength: 3 }), 10);

    // Should get valid results even with limited input space
    result.forEach((array) => {
      expect(array.length).toBeGreaterThanOrEqual(1);
      expect(array.length).toBeLessThanOrEqual(3);

      const unique = new Set(array);
      expect(unique.size).toBe(array.length);
    });
  });
});
