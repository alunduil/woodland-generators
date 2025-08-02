/**
 * Property-based tests for debug utility functions
 */

import fc from "fast-check";
import Graphemer from "graphemer";
import {
  createTextPreview,
  createPositionHighlight,
  DEFAULT_WINDOW_RADIUS,
} from "../../../src/playbook/sources/debug";

// Global grapheme splitter for consistent test counting
const graphemer = new Graphemer();

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

describe("createTextPreview - Property Tests", () => {
  describe("Length guarantee property", () => {
    it("for any string longer than sampleSize * 2, output length is exactly sampleSize * 2 + 3", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 50 }).chain((sampleSize) => {
            const threshold = sampleSize * 2;
            return fc.tuple(
              fc.constant(sampleSize),
              // Generate strings with grapheme count > threshold to ensure truncation
              fc.string({ unit: "grapheme", minLength: threshold + 1 }),
            );
          }),
          ([sampleSize, input]) => {
            const result = createTextPreview(input, sampleSize);
            const expectedGraphemeCount = sampleSize * 2 + 3; // start + "..." + end

            // Verify the result has the expected grapheme count
            expect(graphemer.countGraphemes(result)).toBe(expectedGraphemeCount);
          },
        ),
      );
    });

    it("for any string at or below sampleSize * 2, output grapheme count is ≤ input grapheme count", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 50 }).chain((sampleSize) =>
            fc.tuple(
              fc.constant(sampleSize),
              // Generate strings that will definitely be ≤ threshold after cleaning
              // Whitespace cleaning can only reduce grapheme count, so maxLength = threshold is safe
              fc.string({ unit: "grapheme", maxLength: sampleSize * 2 }),
            ),
          ),
          ([sampleSize, input]) => {
            const result = createTextPreview(input, sampleSize);

            // For strings that are definitely short enough after cleaning,
            // result grapheme count should be ≤ input grapheme count
            const inputGraphemeCount = graphemer.countGraphemes(input);
            const resultGraphemeCount = graphemer.countGraphemes(result);

            expect(resultGraphemeCount).toBeLessThanOrEqual(inputGraphemeCount);
          },
        ),
      );
    });
  });

  describe("Content preservation property", () => {
    it("for any string at or below sampleSize * 2, no truncation ellipsis is added", () => {
      fc.assert(
        fc.property(
          fc
            .integer({ min: 5, max: 50 })
            .chain((sampleSize) =>
              fc.tuple(
                fc.constant(sampleSize),
                fc.string({ unit: "grapheme", maxLength: sampleSize * 2 }),
              ),
            ),
          ([sampleSize, input]) => {
            const result = createTextPreview(input, sampleSize);

            // Count ellipsis in original vs result
            const originalEllipsisCount = (input.match(/\.\.\./g) || []).length;
            const resultEllipsisCount = (result.match(/\.\.\./g) || []).length;

            // For strings at or below the threshold, no truncation should occur
            // So ellipsis count should remain exactly the same
            expect(resultEllipsisCount).toBe(originalEllipsisCount);
          },
        ),
      );
    });

    it("for long strings, start and end content is preserved exactly", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 25 }).chain((sampleSize) => {
            const patternLength = Math.floor(sampleSize / 4);

            return fc.tuple(
              fc.constant(sampleSize),
              // Generate start/end with minimal whitespace for better test cases
              fc
                .string({ unit: "grapheme", minLength: patternLength, maxLength: patternLength })
                .filter((s) => s.trim().length >= Math.floor(patternLength * 0.7)), // At least 70% non-whitespace
              fc
                .string({ unit: "grapheme", minLength: patternLength, maxLength: patternLength })
                .filter((s) => s.trim().length >= Math.floor(patternLength * 0.7)), // At least 70% non-whitespace
              // Make middle long enough to guarantee truncation even if start/end are empty after cleaning
              fc.string({ unit: "grapheme", minLength: sampleSize * 2 + 20 }),
            );
          }),
          ([sampleSize, start, end, middle]) => {
            const input = start + middle + end;
            const result = createTextPreview(input, sampleSize);

            // Clean the expected prefix and suffix the same way the function does
            const cleanedStart = start.replace(/\s+/g, " ").trim();
            const cleanedEnd = end.replace(/\s+/g, " ").trim();

            // For truncated strings, the start and end should be preserved exactly
            const startGraphemes = graphemer.splitGraphemes(cleanedStart);
            const endGraphemes = graphemer.splitGraphemes(cleanedEnd);
            const resultGraphemes = graphemer.splitGraphemes(result);

            // Check that result starts with the expected start graphemes
            const resultStart = resultGraphemes.slice(0, startGraphemes.length).join("");
            expect(resultStart).toBe(cleanedStart);

            // Check that result ends with the expected end graphemes
            const resultEnd = resultGraphemes.slice(-endGraphemes.length).join("");
            expect(resultEnd).toBe(cleanedEnd);
          },
        ),
      );
    });
  });

  describe("Whitespace normalization property", () => {
    it("never contains multiple consecutive spaces", () => {
      fc.assert(
        fc.property(fc.string({ unit: "grapheme" }), (input) => {
          const result = createTextPreview(input);

          expect(result).not.toMatch(/  +/);
        }),
      );
    });

    it("never contains tabs, newlines, or other whitespace characters", () => {
      fc.assert(
        fc.property(fc.string({ unit: "grapheme" }), (input) => {
          const result = createTextPreview(input);

          expect(result).not.toMatch(/[\t\n\r\f\v]/);
        }),
      );
    });

    it("preserves word boundaries and non-whitespace content", () => {
      fc.assert(
        fc.property(fc.string({ unit: "grapheme" }), (input) => {
          const result = createTextPreview(input);

          const inputWords = input.match(/[a-zA-Z0-9]+/g) || [];
          const resultWords = result.match(/[a-zA-Z0-9]+/g) || [];

          expect(resultWords).toEqual(inputWords);
        }),
      );
    });
  });
});

describe("createPositionHighlight - Property Tests", () => {
  describe("Output structure and positioning property", () => {
    it("always returns exactly 4 lines with proper structure and position marker", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }).chain((textLength) =>
            fc.string({ minLength: 1, maxLength: 20 }).chain((contextDescription) =>
              fc.tuple(
                fc.string({
                  unit: "grapheme",
                  minLength: textLength,
                  maxLength: textLength,
                }),
                fc.integer({ min: 0, max: textLength - 1 }),
                fc.constant(contextDescription),
              ),
            ),
          ),
          ([text, position, contextDescription]) => {
            const result = createPositionHighlight(text, position, contextDescription);
            const lines = result.split("\n");

            expect(lines).toHaveLength(4);

            expect(lines[0]).toBe("");

            expect(lines[1]).toContain("Context:");
            expect(lines[1]).toContain(contextDescription);
            expect(lines[1]).toContain(`character ${position}`);

            // Check that the highlight line contains bracket highlighting
            expect(lines[2]).toMatch(/\[.+?\]/u); // Use Unicode flag and non-greedy match for any character(s)

            expect(lines[3]).toContain("^");
            expect(lines[3]).toContain(`pos:${position}`);
          },
        ),
      );
    });

    it("marker and pointer are visually aligned at the same column position", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }).chain((textLength) =>
            fc.string({ minLength: 1, maxLength: 20 }).chain((contextDescription) =>
              fc.tuple(
                fc.string({
                  unit: "grapheme",
                  minLength: textLength,
                  maxLength: textLength,
                }),
                fc.integer({ min: 0, max: textLength - 1 }),
                fc.constant(contextDescription),
              ),
            ),
          ),
          ([text, position, contextDescription]) => {
            const result = createPositionHighlight(text, position, contextDescription);
            const lines = result.split("\n");

            // Get the lines with proper assertions
            expect(lines.length).toBeGreaterThanOrEqual(4);
            const pointerLine = lines[3]!; // Line with "^" pointer

            // Strip ANSI color codes for position calculation
            // eslint-disable-next-line no-control-regex
            const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, "");

            // Calculate where the target character should be in the stripped highlight line
            const textGraphemes = graphemer.splitGraphemes(text);
            const windowStart = Math.max(0, position - DEFAULT_WINDOW_RADIUS);
            const prefix = windowStart > 0 ? "..." : "";
            const beforeGraphemes = textGraphemes.slice(windowStart, position);
            // Add 1 to account for the opening bracket, so the caret points to the character inside
            const expectedTargetPosition = prefix.length + beforeGraphemes.length + 1;

            // Find position of ^ in pointer line
            const pointerPosition = stripAnsi(pointerLine).indexOf("^");

            expect(pointerPosition).toBe(expectedTargetPosition);
          },
        ),
      );
    });
  });

  describe("Context window extraction property", () => {
    it("extracts correct text window around position with proper boundaries", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 1000 }).chain((textLength) =>
            fc.string({ minLength: 1, maxLength: 15 }).chain((contextDescription) =>
              fc.tuple(
                fc.string({
                  unit: "grapheme",
                  minLength: textLength,
                  maxLength: textLength,
                }),
                fc.integer({
                  min: DEFAULT_WINDOW_RADIUS,
                  max: textLength - DEFAULT_WINDOW_RADIUS,
                }),
                fc.constant(contextDescription),
              ),
            ),
          ),
          ([text, position, contextDescription]) => {
            const result = createPositionHighlight(text, position, contextDescription);
            const lines = result.split("\n");
            const highlightLine = lines[2]!;

            // Strip ANSI codes and ellipsis to get actual content
            const cleanHighlight = highlightLine
              // eslint-disable-next-line no-control-regex
              .replace(/\u001b\[[0-9;]*m/g, "")
              .replace(/\.\.\./g, "");

            // Expected window is DEFAULT_WINDOW_RADIUS graphemes before and after position
            const textGraphemes = graphemer.splitGraphemes(text);
            const windowStart = Math.max(0, position - DEFAULT_WINDOW_RADIUS);
            const windowEnd = Math.min(textGraphemes.length, position + DEFAULT_WINDOW_RADIUS);

            // The window should contain consecutive text from the original
            const beforeGraphemes = textGraphemes.slice(windowStart, position);
            const afterGraphemes = textGraphemes.slice(position + 1, windowEnd);

            if (beforeGraphemes.length > 0) {
              const beforeText = beforeGraphemes.slice(-10).join(""); // Check last 10 graphemes before
              expect(cleanHighlight).toContain(beforeText);
            }
            if (afterGraphemes.length > 0) {
              const afterText = afterGraphemes.slice(0, 10).join(""); // Check first 10 graphemes after
              expect(cleanHighlight).toContain(afterText);
            }
          },
        ),
      );
    });
  });

  describe("Ellipsis placement property", () => {
    it("shows leading ellipsis when text is truncated before position, trailing ellipsis when truncated after", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 1000 }).chain((textLength) =>
            fc.string({ minLength: 1, maxLength: 15 }).chain((contextDescription) =>
              fc.tuple(
                fc.string({
                  unit: "grapheme",
                  minLength: textLength,
                  maxLength: textLength,
                }),
                fc.integer({
                  min: DEFAULT_WINDOW_RADIUS,
                  max: textLength - DEFAULT_WINDOW_RADIUS,
                }),
                fc.constant(contextDescription),
              ),
            ),
          ),
          ([text, position, contextDescription]) => {
            const result = createPositionHighlight(text, position, contextDescription);
            const lines = result.split("\n");
            const highlightLine = lines[2]!;

            // Strip ANSI codes to check for ellipsis placement
            // eslint-disable-next-line no-control-regex
            const cleanHighlight = highlightLine.replace(/\u001b\[[0-9;]*m/g, "");

            const textGraphemes = graphemer.splitGraphemes(text);
            const windowStart = Math.max(0, position - DEFAULT_WINDOW_RADIUS);
            const windowEnd = Math.min(textGraphemes.length, position + DEFAULT_WINDOW_RADIUS);

            // Check for leading ellipsis when text is truncated at start
            if (windowStart > 0) {
              expect(cleanHighlight).toMatch(/^\.\.\./); // Should start with ...
            } else {
              expect(cleanHighlight).not.toMatch(/^\.\.\./); // Should NOT start with ...
            }

            // Check for trailing ellipsis when text is truncated at end
            if (windowEnd < textGraphemes.length) {
              expect(cleanHighlight).toMatch(/\.\.\.$/); // Should end with ...
            } else {
              expect(cleanHighlight).not.toMatch(/\.\.\.$/); // Should NOT end with ...
            }
          },
        ),
      );
    });
  });
});
