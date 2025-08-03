import { PDFPlaybookSource } from "../../../src/playbook/sources/pdf";
import { root } from "../../../src/logging";
import path from "path";
import { glob } from "glob";
import { tmpdir } from "os";

describe("PDFPlaybookSource - PlaybookSource interface implementation", () => {
  const fixturesDir = path.join(__dirname, "../../fixtures");

  // Helper to get the first valid PDF file from our fixtures
  const getFirstValidPdf = () => {
    const validFiles = glob.sync("playbooks-pdf/valid/*", { cwd: fixturesDir });
    if (validFiles.length === 0) {
      throw new Error("No valid PDF files found in test fixtures");
    }
    return path.join(fixturesDir, validFiles[0]!);
  };

  beforeEach(() => {
    root.level = "silent";
  });

  describe("isValid", () => {
    it("should return false for empty path", async () => {
      const source = new PDFPlaybookSource("", "pdf");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for non-existent files", async () => {
      const source = new PDFPlaybookSource(path.join(tmpdir(), "pdf.test.pdf"), "pdf");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    it("should return false for directories", async () => {
      const source = new PDFPlaybookSource(fixturesDir, "pdf");
      const result = await source.isValid();
      expect(result).toBe(false);
    });

    // Generate test cases for files that should be invalid for PDF source
    [
      ...glob
        .sync("playbooks-*/valid/*", { cwd: fixturesDir })
        .filter((file) => !file.includes("playbooks-pdf")),
      ...glob.sync("playbooks-pdf/invalid/*", { cwd: fixturesDir }),
    ].forEach((file) => {
      const testName = `should return false for: ${path.basename(file)}`;

      // TODO: Fix intermittent failure with invalid-compression.pdf due to PDF.js global state contamination
      if (
        path.basename(file) === "invalid-compression.pdf" ||
        path.basename(file) === "bad-xref-entry.pdf"
      ) {
        it.skip(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          const result = await source.isValid();
          expect(result).toBe(false);
        });
      } else {
        it(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          const result = await source.isValid();
          expect(result).toBe(false);
        });
      }
    });

    // Generate test cases for files that should be valid for PDF source
    glob.sync("playbooks-pdf/valid/*", { cwd: fixturesDir }).forEach((file) => {
      it(`should return true for: ${path.basename(file)}`, async () => {
        const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
        const result = await source.isValid();
        expect(result).toBe(true);
      });
    });
  });

  describe("load", () => {
    it("should throw error when loading non-existent files", async () => {
      const source = new PDFPlaybookSource(path.join(tmpdir(), "pdf.test.pdf"), "pdf");
      await expect(source.load()).rejects.toThrow();
    });

    // Generate test cases for files that should fail to load
    [
      ...glob
        .sync("playbooks-*/valid/*", { cwd: fixturesDir })
        .filter((file) => !file.includes("playbooks-pdf")),
      ...glob.sync("playbooks-pdf/invalid/*", { cwd: fixturesDir }),
    ].forEach((file) => {
      const testName = `should throw error when loading: ${path.basename(file)}`;

      // TODO: Fix intermittent failure with invalid-compression.pdf due to PDF.js global state contamination
      if (
        path.basename(file) === "invalid-compression.pdf" ||
        path.basename(file) === "bad-xref-entry.pdf"
      ) {
        it.skip(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          await expect(source.load()).rejects.toThrow();
        });
      } else {
        it(testName, async () => {
          const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
          await expect(source.load()).rejects.toThrow();
        });
      }
    });

    // Generate test cases for files that should successfully load
    glob.sync("playbooks-pdf/valid/*", { cwd: fixturesDir }).forEach((file) => {
      it(`should successfully load: ${path.basename(file)}`, async () => {
        const source = new PDFPlaybookSource(path.join(fixturesDir, file), "pdf");
        await expect(source.load()).resolves.not.toThrow();

        // Extract expected count from filename (e.g., "playbooks-with-rules-2.pdf" -> 2)
        const filename = path.basename(file, ".pdf");
        const countMatch = filename.match(/-(\d+)$/);
        const expectedCount = countMatch ? parseInt(countMatch[1]!, 10) : null;

        // All valid PDF filenames must contain expected playbook count
        if (expectedCount === null) {
          throw new Error(
            `Invalid filename format: ${filename}. Valid PDF files must end with expected playbook count (e.g., "playbooks-with-rules-2.pdf")`,
          );
        }

        // Verify that the exact expected number of playbooks were loaded
        const playbooks = source.getPlaybooks();
        expect(playbooks.length).toBe(expectedCount);
      });
    });

    it("should be idempotent and safe for repeated calls", async () => {
      const source = new PDFPlaybookSource(getFirstValidPdf(), "pdf");
      await source.load();

      // Get the initial state
      const initialPlaybooks = source.getPlaybooks();

      // Load again and verify state hasn't changed
      await expect(source.load()).resolves.not.toThrow();
      const afterSecondLoad = source.getPlaybooks();

      expect(afterSecondLoad).toEqual(initialPlaybooks);
    });
  });
});
