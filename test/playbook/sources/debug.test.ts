/**
 * Unit tests for debug utility functions - Edge cases and error conditions
 */

import { createPositionHighlight } from "../../../src/playbook/sources/debug";
import { root } from "../../../src/logging";

describe("createPositionHighlight", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(root, "warn").mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });
  describe("Newline handling", () => {
    it("replaces newlines with visible characters", () => {
      const result = createPositionHighlight("line1\nline2\nline3", 6, "newline");

      expect(result).toContain("⏎");
    });
  });

  describe("Error handling", () => {
    it("warns when position is beyond text length", () => {
      const text = "short";
      const invalidPos = text.length + 5;

      createPositionHighlight(text, invalidPos, "beyond");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          position: invalidPos,
          graphemeCount: 5, // Now uses grapheme count instead of text length
          description: "beyond",
        }),
      );
    });

    it("returns debug output even with invalid position", () => {
      const text = "short";
      const invalidPos = text.length + 5;

      const result = createPositionHighlight(text, invalidPos, "beyond");

      expect(result.length).toBeGreaterThan(0);
    });

    it("handles empty string", () => {
      const result = createPositionHighlight("", 0, "empty");

      expect(result).toContain("pos:0");
      expect(result).toContain('Context: "empty"');
      // For empty string, there's no character to highlight, just verify structure
      const lines = result.split("\n");
      expect(lines).toHaveLength(4);
      expect(lines[0]).toBe("");
      expect(lines[2]).toBe(""); // Empty highlight line
    });
  });

  describe("Specific formatting verification", () => {
    it("contains bracket highlighting", () => {
      const result = createPositionHighlight("test", 1, "character");

      expect(result).toMatch(/\[.+?\]/u); // Should contain bracket-highlighted character
    });
  });
});
