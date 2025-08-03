import { JSONPlaybookSource } from "../../../src/playbook/sources/json";
import { root } from "../../../src/logging";
import path from "path";

describe("JSONPlaybookSource", () => {
  const testFixturesDir = path.join(__dirname, "../../fixtures");
  const invalidJsonDir = path.join(testFixturesDir, "playbooks-json/invalid");
  const invalidPdfDir = path.join(testFixturesDir, "playbooks-pdf/invalid");
  const validPdfDir = path.join(testFixturesDir, "playbooks-pdf/valid");

  // Invalid JSON fixtures
  const malformedJsonPath = path.join(invalidJsonDir, "malformed-playbook.json");
  const incompleteJsonPath = path.join(invalidJsonDir, "single-playbook.json"); // Incomplete schema

  // Cross-format testing: valid PDFs tested as invalid JSON
  const validPdfAsInvalidJsonPath = path.join(validPdfDir, "single-playbook.pdf");

  // Non-existent files
  const nonExistentPath = path.join(testFixturesDir, "non-existent.json");
  const invalidPdfPath = path.join(invalidPdfDir, "invalid.pdf"); // PDF file that can't be parsed as JSON

  beforeEach(() => {
    root.level = "silent";
  });

  describe("isValid", () => {
    it("should return false for non-existent files", async () => {
      const source = new JSONPlaybookSource(nonExistentPath, "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for files that cannot be parsed as JSON", async () => {
      const source = new JSONPlaybookSource(invalidPdfPath, "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for malformed JSON files", async () => {
      const source = new JSONPlaybookSource(malformedJsonPath, "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for incomplete JSON playbook schema", async () => {
      const source = new JSONPlaybookSource(incompleteJsonPath, "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for valid PDF files when tested as JSON (cross-format)", async () => {
      const source = new JSONPlaybookSource(validPdfAsInvalidJsonPath, "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for directories", async () => {
      const source = new JSONPlaybookSource(testFixturesDir, "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for empty path", async () => {
      const source = new JSONPlaybookSource("", "json");
      const result = await source.isValid();
      expect(result).toBe(false);
    });
  });
});
