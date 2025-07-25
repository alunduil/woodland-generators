import { fromPath, fromPathWithArchetype } from "../../../src/playbook/sources";
import path from "path";

describe("playbook sources orchestration", () => {
  const testFixturesDir = path.join(__dirname, "../../fixtures");
  const nonExistentPath = path.join(testFixturesDir, "non-existent.pdf");
  const invalidPdfPath = path.join(testFixturesDir, "invalid.pdf");

  describe("fromPath", () => {
    it("should throw error when no source can handle the file", async () => {
      await expect(fromPath(nonExistentPath, "test-seed")).rejects.toThrow(
        `No source can handle file: ${nonExistentPath}`,
      );
    });

    it("should throw error when file is not valid for any source", async () => {
      await expect(fromPath(invalidPdfPath, "test-seed")).rejects.toThrow(
        `No source can handle file: ${invalidPdfPath}`,
      );
    });

    it("should handle directories as invalid files", async () => {
      await expect(fromPath(testFixturesDir, "test-seed")).rejects.toThrow(
        `No source can handle file: ${testFixturesDir}`,
      );
    });

    it("should handle empty string path", async () => {
      await expect(fromPath("", "test-seed")).rejects.toThrow("No source can handle file: ");
    });
  });

  describe("fromPathWithArchetype", () => {
    it("should throw error when no source can handle the file", async () => {
      await expect(fromPathWithArchetype(nonExistentPath, "The Ranger")).rejects.toThrow(
        `No source can handle file: ${nonExistentPath}`,
      );
    });

    it("should throw error when file is not valid for any source", async () => {
      await expect(fromPathWithArchetype(invalidPdfPath, "The Ranger")).rejects.toThrow(
        `No source can handle file: ${invalidPdfPath}`,
      );
    });

    it("should handle directories as invalid files", async () => {
      await expect(fromPathWithArchetype(testFixturesDir, "The Ranger")).rejects.toThrow(
        `No source can handle file: ${testFixturesDir}`,
      );
    });

    it("should handle empty string path", async () => {
      await expect(fromPathWithArchetype("", "The Ranger")).rejects.toThrow(
        "No source can handle file: ",
      );
    });
  });

  // Note: Positive tests for successful loading will be added when we have
  // proper test fixtures. The orchestration logic is tested through the CLI
  // integration tests and individual source unit tests handle validation logic.
});
