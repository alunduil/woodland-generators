import { JSONPlaybookSource } from "../../../src/playbook/sources/json";
import path from "path";

describe("JSONPlaybookSource", () => {
  const testFixturesDir = path.join(__dirname, "../../fixtures");
  const nonExistentPath = path.join(testFixturesDir, "non-existent.json");
  const invalidJsonPath = path.join(testFixturesDir, "invalid.pdf"); // PDF file that can't be parsed as JSON

  describe("isValid", () => {
    it("should return false for non-existent files", async () => {
      const source = new JSONPlaybookSource(nonExistentPath);
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for files that cannot be parsed as JSON", async () => {
      const source = new JSONPlaybookSource(invalidJsonPath);
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for directories", async () => {
      const source = new JSONPlaybookSource(testFixturesDir);
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for empty path", async () => {
      const source = new JSONPlaybookSource("");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    // Note: We could add a valid JSON test when we have a test fixture
    it.skip("should return true for valid JSON files", async () => {
      // Skipped until we have a valid JSON test fixture
    });
  });
});
