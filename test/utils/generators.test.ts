import { uniqueArray } from "./generators";
import fc from "fast-check";

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
